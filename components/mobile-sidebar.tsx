'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectorGroup } from '@/lib/types';
import { formatCompact, formatPercentage, cn } from '@/lib/utils';

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  sectors: SectorGroup[];
  lastUpdated: Date | null;
  isOpen: boolean;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export function MobileSidebar({
  open,
  onClose,
  sectors,
  lastUpdated,
  isOpen,
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercent,
}: MobileSidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85%] flex-col bg-background shadow-xl transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Summary</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close summary">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <section>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Total Investment</div>
                <div className="text-base font-bold">{formatCompact(totalInvestment)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Present Value</div>
                <div className="text-base font-bold">{formatCompact(totalPresentValue)}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Total Gain/Loss</div>
                <div
                  className={cn(
                    'text-base font-bold',
                    totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatCompact(totalGainLoss)}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Return %</div>
                <div
                  className={cn(
                    'text-base font-bold',
                    totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {formatPercentage(totalGainLossPercent)}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not updated yet'}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                )}
              >
                {isOpen ? 'Market Live' : 'Market Closed'}
              </span>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sectors
            </h2>
            <div className="space-y-2">
              {sectors.map(sector => (
                <div key={sector.sector} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">{sector.sector}</span>
                    <span className="text-xs text-muted-foreground">
                      {sector.stocks.length} stocks
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground">Inv</div>
                      <div className="text-xs font-medium">
                        {formatCompact(sector.totalInvestment)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">PV</div>
                      <div className="text-xs font-medium">
                        {formatCompact(sector.totalPresentValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">G/L</div>
                      <div
                        className={cn(
                          'text-xs font-medium',
                          sector.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {formatCompact(sector.totalGainLoss)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}