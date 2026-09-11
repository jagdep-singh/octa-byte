'use client';

import {SectorGroup} from '@/lib/types';
import {formatCompact, formatPercentage, cn} from '@/lib/utils';

interface SidebarProps {
  sectors: SectorGroup[];
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export function Sidebar({
  sectors,
  totalInvestment,
  totalPresentValue,
  totalGainLoss,
  totalGainLossPercent,
}: SidebarProps) {
  return (
    <aside className="w-80 shrink-0 space-y-6 overflow-y-auto border-r p-4">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Summary
        </h2>
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
                <span className="text-xs text-muted-foreground">{sector.stocks.length} stocks</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] text-muted-foreground">Inv</div>
                  <div className="text-xs font-medium">{formatCompact(sector.totalInvestment)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">PV</div>
                  <div className="text-xs font-medium">{formatCompact(sector.totalPresentValue)}</div>
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
    </aside>
  );
}