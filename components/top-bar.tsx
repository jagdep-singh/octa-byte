'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectorGroup } from '@/lib/types';
import { SectorPills } from '@/components/sector-pills';
import { cn } from '@/lib/utils';

interface TopBarProps {
  isDesktop: boolean;
  onMenuClick: () => void;
  sectors: SectorGroup[];
  selectedSector: string | null;
  onSelectSector: (sector: string | null) => void;
  lastUpdated: Date | null;
  isOpen: boolean;
}

export function TopBar({
  isDesktop,
  onMenuClick,
  sectors,
  selectedSector,
  onSelectSector,
  lastUpdated,
  isOpen,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background">
      {isDesktop ? (
        <div className="flex h-20 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              <span
                className={cn('h-1.5 w-1.5 rounded-full', isOpen ? 'bg-green-500' : 'bg-red-500')}
              />
              {isOpen ? 'Market open' : 'Market closed'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 px-3 py-2.5">
          <Button variant="ghost" size="icon-lg" onClick={onMenuClick} aria-label="Open summary">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <SectorPills
              sectors={sectors}
              selectedSector={selectedSector}
              onSelectSector={onSelectSector}
              className="overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
            />
          </div>
        </div>
      )}
    </header>
  );
}