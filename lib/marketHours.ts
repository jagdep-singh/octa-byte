import { DateTime } from 'luxon'

export const MARKET_OPEN_MINUTES = 9 * 60
export const MARKET_CLOSE_MINUTES = 15 * 60 + 30


export function isMarketOpen(date: Date = new Date()): boolean {

    const ist = DateTime.fromJSDate(date, { 
        zone: 'Asia/Kolkata' 
    })

    const weekday = ist.weekday // 1=Mon

    if (weekday === 6 || weekday === 7) {
        return false
    }

    const minutes = ist.hour * 60 + ist.minute
    return minutes >= MARKET_OPEN_MINUTES && minutes <= MARKET_CLOSE_MINUTES

}

export const CLOSED_HOURS_TTL = 6 * 60 * 60 * 1000