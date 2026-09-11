import {NextResponse} from 'next/server';
import YahooFinance from 'yahoo-finance2';
import {holdings} from '@/lib/data/holdings';
import {quoteCache} from '@/lib/cache';
import {QuotaResponse} from '@/lib/types';
import { resolveSymbols } from '@/lib/symbols';
import { CLOSED_HOURS_TTL, isMarketOpen } from '@/lib/marketHours';

const yahooFinance = new YahooFinance()

export async function GET() {
    const closed = !isMarketOpen()
    
    const cached = quoteCache.get<QuotaResponse>('quotes', closed ? CLOSED_HOURS_TTL : undefined)
    if (cached) {
        return NextResponse.json(cached)
    }

    const results: QuotaResponse = {}
    const uniqSymbols = [...new Set(holdings.map(stock => stock.exchangeCode))]
    const batchSize = 5

    for(let i = 0; i < uniqSymbols.length; i += batchSize){
        const batch = uniqSymbols.slice(i, i + batchSize)
        const promises = batch.map(async (symbol) =>{
            try{

                const quote = await yahooFinance.quote(resolveSymbols(symbol))

                if (!quote) {
                    console.error(`No quote found for ${symbol}`)

                    results[symbol] = {
                        cmp: null,
                        error: 'No quote found'
                    }

                    return
                }
                results[symbol] = {
                    cmp: quote.regularMarketPrice || 0,
                    trailingPE: quote.trailingPE ?? null,
                    epsTrailing12months: quote.epsTrailing12months ?? null
                }

            }catch (error){

                console.error(`Error fetching quote for ${symbol}:`, error)
                results[symbol] = {
                    cmp: null,
                    error: 'Failed to fetch quote'
                }
            }
        })

        await Promise.all(promises)
    }

    quoteCache.set('quotes', results)
    return NextResponse.json(results)
}