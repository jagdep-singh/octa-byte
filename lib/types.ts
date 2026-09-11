export interface Stock{
    id: number;
    particulars: string;
    purchasePrice: number;
    qty: number;
    investment: number;
    portfolioPercent: number;
    exchangeCode: string;
    sector: string;
    cmp: number | null;
    presentValue: number | null;
    gainLoss: number | null;
    gainLossPercent: number | null;
    peRatio: number | null;
    latestEarnings: number | null;
}

export interface SectorGroup {
    sector: string;
    stocks: Stock[];
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
    sectorPercent: number;
}

export interface PortfolioData{
    sectors: SectorGroup[];
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
}

export interface QuotaResponse {
    [symbol: string]: {
        cmp: number | null;
        trailingPE?: number;
        epsTrailing12months?: number;
        error?: string;
    };
}

export interface FundamentalsResponse {
    [symbol: string]: {
        peRatio: number | null;
        latestEarnings: number | null;
        error?: string;
    };
}