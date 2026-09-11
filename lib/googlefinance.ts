import * as cheerio from 'cheerio';
import { toGoogleFinanceTicker , toNumber } from './utils';

const G_FINANCE_URL = (ticker: string) => `https://www.google.com/finance/quote/${ticker}`
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
const FETCH_TIMEOUT = 10000

const GOOGLE_TICKER_OVERRIDES: Record<string, string> = {
    'LTIM.NS': 'LTM:NSE',
}

function reslveGoogleTicker(exchangeCode: string): string {
    return GOOGLE_TICKER_OVERRIDES[exchangeCode] ?? toGoogleFinanceTicker(exchangeCode)
}


export async function fundamentalScrapper(exchangeCode : string): Promise<{
    peRatio: number | null;
    latestEarnings: number | null;
    }> {

    const ticker = reslveGoogleTicker(exchangeCode)
    const res = await fetch(G_FINANCE_URL(ticker), {
        headers:{
            'User-Agent': UA,
            'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT)
    })

    if(!res.ok){
        throw new Error(`Google Finance ${res.status} for ${ticker}`)
    }

    const c = cheerio.load(await res.text())
    const stat = (label: string): number | null => {
        const row = c('div.KxsRFb').filter((_, el) => c(el).find('div.SwQK7').text().trim() === label).first()
        const value = row.find('div.dO6ijd').text().trim()
        return value ? toNumber(value) : null
    }

    const peRatio = stat('P/E ratio')
    const latestEarnings = stat('EPS')

    if(peRatio === null && latestEarnings === null){
        console.warn(`Google Finance data not found for ${ticker} for both P/E and EPS`)
    }

    return {peRatio , latestEarnings}
}