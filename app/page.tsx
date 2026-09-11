'use client';

import { useEffect, useState, useCallback } from 'react';
import { PortfolioData, QuotaResponse, FundamentalsResponse } from '@/lib/types';
import { PortfolioTable } from '@/components/portfolio-table';
import { SectorSummary } from '@/components/sector-summary';
import { ErrorBoundary } from '@/components/error-boundary';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { isMarketOpen } from '@/lib/marketHours';

export default function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [quotes, setQuotes] = useState<QuotaResponse>({});
  const [fundamentals, setFundamentals] = useState<FundamentalsResponse>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      setQuotes(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  }, []);

  const fetchFundamentals = useCallback(async () => {
    try {
      const response = await fetch('/api/fundamentals');
      if (!response.ok) throw new Error('Failed to fetch fundamentals');
      const data = await response.json();
      setFundamentals(data);
    } catch (error) {
      console.error('Error fetching fundamentals:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPortfolio(), fetchQuotes(), fetchFundamentals()]);
      setLoading(false);
    };
    loadData();
  }, [fetchPortfolio, fetchQuotes, fetchFundamentals]);

  const [isOpen ,setIsOpen] = useState(() => isMarketOpen())
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let watchTimer: ReturnType<typeof setInterval> | null = null;
    let prevOpen: boolean | null = null;


    const clearPoll = () => {
        if(pollTimer){
            clearInterval(pollTimer)
            pollTimer = null
        }
    }

    const sync = () => {
        const open = isMarketOpen()
        setIsOpen(open)
        if(open){
            if(!pollTimer){
                pollTimer = setInterval(fetchQuotes , 15000)
                if(prevOpen === false){
                    fetchQuotes()
                }
            }
        }else{
            clearPoll()
        }

        prevOpen = open
    }

    sync()

    watchTimer = setInterval(sync , 15000)
    return () => {
        clearPoll()
        if(watchTimer) clearInterval(watchTimer)
    }

  }, [fetchQuotes])

  const enrichedSectors = portfolioData?.sectors.map(sector => {
    const enrichedStocks = sector.stocks.map(stock => {
      const quote = quotes[stock.exchangeCode]
      const fund = fundamentals[stock.exchangeCode]

      const cmp = quote?.cmp || null
      const presentValue = cmp != null ? cmp * stock.qty : null
      const gainLoss = presentValue != null ? presentValue - stock.investment : null
      const gainLossPercent = gainLoss != null ? (gainLoss / stock.investment) * 100 : null

      return {
        ...stock,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercent,
        peRatio: fund?.peRatio || null,
        latestEarnings: fund?.latestEarnings || null,
      };
    });

    const totalPresentValue = enrichedStocks.reduce(
      (sum, stock) => sum + (stock.presentValue || 0),
      0
    );

    return {
      ...sector,
      stocks: enrichedStocks,
      totalPresentValue,
      totalGainLoss: totalPresentValue - sector.totalInvestment,
    };
  }) || [];

  const totalInvestment = portfolioData?.totalInvestment || 0;
  const totalPresentValue = enrichedSectors.reduce((sum, sector) => sum + sector.totalPresentValue,0)
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercent = (totalGainLoss / totalInvestment) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your investments in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Investment</div>
            <div className="text-2xl font-bold">{formatCurrency(totalInvestment)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Present Value</div>
            <div className="text-2xl font-bold">{formatCurrency(totalPresentValue)}</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Gain/Loss</div>
            <div className={cn(
              'text-2xl font-bold',
              totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(totalGainLoss)}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Return %</div>
            <div className={cn(
              'text-2xl font-bold',
              totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatPercentage(totalGainLossPercent)}
            </div>
          </div>
        </div>

        {lastUpdated && (
          <div className="text-sm text-muted-foreground mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        <ErrorBoundary>
          <PortfolioTable sectors={enrichedSectors} loading={loading} />
        </ErrorBoundary>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedSectors.map(sector => (
            <ErrorBoundary key={sector.sector}>
              <SectorSummary sector={sector} />
            </ErrorBoundary>
          ))}
        </div>
      </div>
    </div>
  );
}