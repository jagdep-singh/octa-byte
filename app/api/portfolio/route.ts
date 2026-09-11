import {NextResponse} from 'next/server';
import {holdings} from '@/lib/data/holdings';
import {SectorGroup , PortfolioData} from '@/lib/types';

export async function GET() {
    const sectorMap = new Map<string, typeof holdings>();

    for(const stock of holdings){
        const existing = sectorMap.get(stock.sector)
        if(existing){
            existing.push(stock)
        }else{
            sectorMap.set(stock.sector, [stock])
        }
    }

    const sectors : SectorGroup[] = []
    let totalInvestment = 0;

    for (const [sector, stocks] of sectorMap){
        const sectorInvestment = stocks.reduce((acc, stock) => acc + stock.investment, 0)
        totalInvestment += sectorInvestment;
        sectors.push({
            sector,
            stocks: stocks.map(s => ({
                ...s,
                cmp: null,
                presentValue: null,
                gainLoss: null,
                gainLossPercent: null,
                peRatio: null,
                latestEarnings: null
            })),
            totalInvestment: sectorInvestment,
            totalPresentValue: 0,
            totalGainLoss: 0,
            sectorPercent: 0
        })
    }
    
    for(const sector of sectors){
        sector.sectorPercent = (sector.totalInvestment / totalInvestment) * 100;
        for(const stock of sector.stocks){
            stock.portfolioPercent = (stock.investment / totalInvestment) * 100;
        }
    }

    const responce: PortfolioData = {
        sectors: sectors,
        totalInvestment,
        totalPresentValue: totalInvestment,
        totalGainLoss: 0
    }

    return NextResponse.json(responce)
}