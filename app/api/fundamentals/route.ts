import {NextResponse} from 'next/server';
import {holdings} from '@/lib/data/holdings';
import {fundamentalsCache} from '@/lib/cache';
import {FundamentalsResponse} from '@/lib/types';
import {fundamentalScrapper} from '@/lib/googlefinance';
import { isMarketOpen } from '@/lib/marketHours';

export async function GET() {
    const cached = fundamentalsCache.get<FundamentalsResponse>('fundamentals')
    if(cached){
        return NextResponse.json(cached)
    }

    if (!isMarketOpen()) {
        return NextResponse.json(cached ?? {});
    }

    const results: FundamentalsResponse = {}
    const batchSize = 6
    
    for(let i = 0; i < holdings.length ; i+= batchSize){
        const batch = holdings.slice(i, i+batchSize)

        await Promise.all(batch.map( async (stock) => {
            try{
                const {peRatio , latestEarnings} = await fundamentalScrapper(stock.exchangeCode)
                results[stock.exchangeCode] = {peRatio , latestEarnings}
            } catch(err) {
                console.error(`Error fetching fundamentals for ${stock.exchangeCode} ->` ,err)
                results[stock.exchangeCode] = {peRatio: null , latestEarnings : null}
            }
        }))

    }

    fundamentalsCache.set('fundamentals', results)
    return NextResponse.json(results)
}