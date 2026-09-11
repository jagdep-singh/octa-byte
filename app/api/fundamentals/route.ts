import {NextResponse} from 'next/server';
import {holdings} from '@/lib/data/holdings';
import {fundamentalsCache} from '@/lib/cache';
import {FundamentalsResponse} from '@/lib/types';

const exleFundamentals: { [key: string]: { peRatio: number; latestEarnings: number } } = {
    'HDFCBANK.NS': { peRatio: 18.69, latestEarnings: 91.02 },
    'BAJFINANCE.NS': { peRatio: 32.63, latestEarnings: 257.8 },
    'ICICIBANK.NS': { peRatio: 17.68, latestEarnings: 68.72 },
    'SAVANI.NS': { peRatio: null as any, latestEarnings: null as any },
    'AFFLE.NS': { peRatio: 55.53, latestEarnings: 26.11 },
    'LTIM.NS': { peRatio: 34.69, latestEarnings: 145.92 },
    'KPITTECH.NS': { peRatio: 46.57, latestEarnings: 27.77 },
    'TATATECH.NS': { peRatio: 41.68, latestEarnings: 15.88 },
    'BLSE.NS': { peRatio: 26.3, latestEarnings: 5.8 },
    'TANLA.NS': { peRatio: 11.64, latestEarnings: 39.48 },
    'DMART.NS': { peRatio: 82.63, latestEarnings: 41.75 },
    'TATACONSUM.NS': { peRatio: 26.56, latestEarnings: 134.77 },
    'PIDILITIND.NS': { peRatio: 71.13, latestEarnings: 38.36 },
    'TATAPOWER.NS': { peRatio: 29.36, latestEarnings: 11.94 },
    'KPIGREEN.NS': { peRatio: 29.26, latestEarnings: 13.75 },
    'SUZLON.NS': { peRatio: 61.25, latestEarnings: 0.84 },
    'GENSOL.NS': { peRatio: 39.51, latestEarnings: 5.57 },
    'HARIOMPIPE.NS': { peRatio: 17.98, latestEarnings: 19.78 },
    'ASTRAL.NS': { peRatio: 67.13, latestEarnings: 19.59 },
    'POLYCAB.NS': { peRatio: 40.91, latestEarnings: 121.97 },
    'CLEAN.NS': { peRatio: 50.37, latestEarnings: 24.52 },
    'DEEPAKNTR.NS': { peRatio: 41.86, latestEarnings: 37.26 },
    'FINEORG.NS': { peRatio: 41.86, latestEarnings: 37.26 },
    'GRAVITA.NS': { peRatio: 41.86, latestEarnings: 37.26 },
    'SBILIFE.NS': { peRatio: null as any, latestEarnings: -5.82 },
};

export async function GET() {
    const cached = fundamentalsCache.get<FundamentalsResponse>('fundamentals')
    if(cached){
        return NextResponse.json(cached)
    }

    const results: FundamentalsResponse = {}
    for(const stock of holdings){
        const fundamentals = exleFundamentals[stock.exchangeCode]
        results[stock.exchangeCode] = {
            peRatio: fundamentals?.peRatio || null,
            latestEarnings: fundamentals?.latestEarnings || null
        }
    }
    fundamentalsCache.set('fundamentals', results)
    return NextResponse.json(results)
}