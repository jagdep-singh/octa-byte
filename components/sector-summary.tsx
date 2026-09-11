import { SectorGroup } from '@/lib/types';
import { formatCurrency,  cn } from '@/lib/utils';

interface SectorSummaryProps {
  sector: SectorGroup;
}

export function SectorSummary({ sector }: SectorSummaryProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{sector.sector}</h2>
        <div className="text-sm text-muted-foreground">
          {sector.stocks.length} stocks • {sector.sectorPercent.toFixed(1)}% of portfolio
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Investment</div>
          <div className="text-lg font-semibold">{formatCurrency(sector.totalInvestment)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Present Value</div>
          <div className="text-lg font-semibold">{formatCurrency(sector.totalPresentValue)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm text-muted-foreground">Gain/Loss</div>
          <div className={cn(
            'text-lg font-semibold',
            sector.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(sector.totalGainLoss)}
          </div>
        </div>
      </div>
    </div>
  );
}