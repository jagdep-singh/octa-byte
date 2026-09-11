import {NextResponse} from 'next/server';
import yahooFinance from 'yahoo-finance2';
import {holdings} from '@/lib/data/holdings';
import {quoteCache} from '@/lib/cache';
import {QuotaResponse} from '@/lib/types';
import { Quote } from 'yahoo-finance2/modules/quote';


export async function GET() {
    const cached = quoteCache.get<QuotaResponse>('quotes')
    if(cached){
        return NextResponse.json(cached)
    }

    const results: QuotaResponse = {}
    const uniqSymbols = [...new Set(holdings.map(stock => stock.exchangeCode))]
    const batchSize = 5

    for(let i = 0; i < uniqSymbols.length; i += batchSize){
        const batch = uniqSymbols.slice(i, i + batchSize)
        const promises = batch.map(async (symbol) =>{
            try{

                const quote = await yahooFinance.quote(symbol) as Quote
                results[symbol] = {
                    cmp: quote.regularMarketPrice || 0
                }

            }catch (error){

                console.error(`Error fetching quote for ${symbol}:`, error)
                results[symbol] = {
                    cmp: 0,
                    error: 'Failed to fetch quote'
                }
            }
        })

        await Promise.all(promises)
    }

    quoteCache.set('quotes', results)
    return NextResponse.json(results)
}