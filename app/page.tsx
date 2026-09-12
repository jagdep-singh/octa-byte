'use client';

import { useEffect, useState, useCallback } from 'react';
import { PortfolioData, QuotaResponse, FundamentalsResponse } from '@/lib/types';
import { PortfolioTable } from '@/components/portfolio-table';
import { ErrorBoundary } from '@/components/error-boundary';
import { TopBar } from '@/components/top-bar';
import { Sidebar } from '@/components/sidebar';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { SectorPills } from '@/components/sector-pills';
import { formatCompact, formatPercentage, cn } from '@/lib/utils';
import { isMarketOpen } from '@/lib/marketHours';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DataErrorBanner } from '@/components/data-error-banner';

export default function Dashboard() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [quotes, setQuotes] = useState<QuotaResponse>({});
  const [fundamentals, setFundamentals] = useState<FundamentalsResponse>({});

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [refreshing , setRefreshing] = useState(false)
  const [dataError , setDataError] = useState<{quotes: boolean ; fundamentals: boolean}>({
    quotes: false,
    fundamentals: false
  })

  const isDesktop = useMediaQuery('(min-width: 768px)')

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (!response.ok) throw new Error('Failed to fetch portfolio')
      const data = await response.json()
      setPortfolioData(data)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    }
  }, []);

  const fetchQuotes = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/quotes')
      if (!response.ok) throw new Error('Failed to fetch quotes')
      const data = await response.json()
      setQuotes(data)
      setLastUpdated(new Date())
      setDataError(p => ({...p, quotes:false}))
    } catch (error) {
      console.error('Error fetching quotes:', error)
      setDataError(p => ({...p, quotes: true}))
    }finally{
      setRefreshing(false)
    }
  }, []);

  const fetchFundamentals = useCallback(async () => {
    try {
      const response = await fetch('/api/fundamentals')
      if (!response.ok) throw new Error('Failed to fetch fundamentals')
      const data = await response.json()
      setFundamentals(data)
      setDataError(p => ({...p , fundamentals: false}))
    } catch (error) {
      console.error('Error fetching fundamentals:', error)
      setDataError(p => ({...p , fundamentals: true}))
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPortfolio(), fetchQuotes(), fetchFundamentals()])
      setLoading(false)
    };
    loadData()
  }, [fetchPortfolio, fetchQuotes, fetchFundamentals]);

  const [isOpen, setIsOpen] = useState(() => isMarketOpen());
  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let watchTimer: ReturnType<typeof setInterval> | null = null;
    let prevOpen: boolean | null = null;

    const clearPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const sync = () => {
      const open = isMarketOpen();
      setIsOpen(open);
      if (open) {
        if (!pollTimer) {
          pollTimer = setInterval(fetchQuotes, 15000);
          if (prevOpen === false) {
            fetchQuotes();
          }
        }
      } else {
        clearPoll();
      }
      prevOpen = open;
    };

    sync();
    watchTimer = setInterval(sync, 15000);
    return () => {
      clearPoll();
      if (watchTimer) clearInterval(watchTimer);
    };
  }, [fetchQuotes]);

  const enrichedSectors = portfolioData?.sectors.map(sector => {
    const enrichedStocks = sector.stocks.map(stock => {
      const quote = quotes[stock.exchangeCode];
      const fund = fundamentals[stock.exchangeCode];

      const cmp = quote?.cmp || null;
      const presentValue = cmp != null ? cmp * stock.qty : null;
      const gainLoss = presentValue != null ? presentValue - stock.investment : null;
      const gainLossPercent = gainLoss != null ? (gainLoss / stock.investment) * 100 : null;

      return {
        ...stock,
        cmp,
        presentValue,
        gainLoss,
        gainLossPercent,
        peRatio: fund?.peRatio ?? quote?.trailingPE ?? null,
        latestEarnings: fund?.latestEarnings ?? quote?.epsTrailingTwelveMonths ?? null,
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
  const totalPresentValue = enrichedSectors.reduce(
    (sum, sector) => sum + sector.totalPresentValue,
    0
  );
  const totalGainLoss = totalPresentValue - totalInvestment;
  const totalGainLossPercent = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

  const filteredSectors = selectedSector
    ? enrichedSectors.filter(s => s.sector === selectedSector)
    : enrichedSectors;

  const retry = useCallback(() => {
    fetchQuotes()
    fetchFundamentals()
  }, [fetchQuotes, fetchFundamentals])

  const hasQuoteFailures = Object.values(quotes).some(q => q.error)
  const hasFundFailures = Object.values(fundamentals).some(f => f.error)
  const showError = dataError.quotes || dataError.fundamentals || hasQuoteFailures || hasFundFailures

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <TopBar
        isDesktop={isDesktop}
        onMenuClick={() => setSidebarOpen(true)}
        sectors={enrichedSectors}
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        lastUpdated={lastUpdated}
        isOpen={isOpen}
        refreshing={refreshing}
      />

      {isDesktop ? (
        <div className="flex">
          <Sidebar
            sectors={enrichedSectors}
            totalInvestment={totalInvestment}
            totalPresentValue={totalPresentValue}
            totalGainLoss={totalGainLoss}
            totalGainLossPercent={totalGainLossPercent}
          />
          <main className="min-w-0 flex-1 p-4 md:p-6">
            <SectorPills
              sectors={enrichedSectors}
              selectedSector={selectedSector}
              onSelectSector={setSelectedSector}
              className="mb-5 flex-wrap"
            />
            <p className="mb-3 text-xs text-muted-foreground">
              P/E ratio & latest earnings are from Google Finance...   
              Yahoo Finance is used automatically where Google doesn&apos;t provide them 
              and N/A means neither source has the data
            </p>
            {showError && (
              <DataErrorBanner
                message="Prices or fundamentals couldn't be fully updated — showing the last known data."
                onRetry={retry}
              />
            )}
            <ErrorBoundary>
              <PortfolioTable sectors={filteredSectors} loading={loading} />
            </ErrorBoundary>
          </main>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 items-center justify-between gap-1 border-b bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground">
            <span>Inv {formatCompact(totalInvestment)}</span>
            <span>PV {formatCompact(totalPresentValue)}</span>
            <span className={cn('font-medium', totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600')}>
              G/L {formatCompact(totalGainLoss)}
            </span>
            <span className={cn('font-medium', totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatPercentage(totalGainLossPercent)}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden px-3 pb-3 pt-3">
            {showError && (
              <DataErrorBanner
                message="Prices or fundamentals couldn't be fully updated — showing the last known data."
                onRetry={retry}
              />
            )}
            <ErrorBoundary>
              <PortfolioTable sectors={filteredSectors} loading={loading} />
            </ErrorBoundary>
            <p className="pb-2 text-[11px] text-muted-foreground">
              P/E & earnings from Google Finance ,Yahoo for fallback and N/A when unavailable from both.
            </p>
          </div>
        </>
      )}

      {!isDesktop && (
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sectors={enrichedSectors}
          lastUpdated={lastUpdated}
          isOpen={isOpen}
          totalInvestment={totalInvestment}
          totalPresentValue={totalPresentValue}
          totalGainLoss={totalGainLoss}
          totalGainLossPercent={totalGainLossPercent}
        />
      )}
    </div>
  );
}