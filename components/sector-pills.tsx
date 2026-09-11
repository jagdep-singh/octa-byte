'use client'

import { SectorGroup } from '@/lib/types';
import {cn} from '@/lib/utils'

interface SectorPillsProps{
    sectors : SectorGroup[];
    selectedSector : string | null;
    onSelectSector : (sector: string | null) => void;
    className ?: string;
}

export function SectorPills({
  sectors,
  selectedSector,
  onSelectSector,
  className,
}: SectorPillsProps) {
  const options = ['All', ...sectors.map(s => s.sector)];

  return (
    <div className={cn('flex gap-2', className)}>
      {options.map(option => {
        const value = option === 'All' ? null : option;
        const active = selectedSector === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelectSector(value)}
            className={cn(
              'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}