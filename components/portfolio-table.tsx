'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { SectorGroup } from '@/lib/types';
import { formatCurrency, formatNumber, formatPercentage, cn } from '@/lib/utils';

interface PortfolioTableProps {
  sectors: SectorGroup[];
  loading?: boolean;
}

type TableRow = SectorGroup['stocks'][number] & { sectorName: string };

export function PortfolioTable({ sectors, loading }: PortfolioTableProps) {
  const allStocks = useMemo(() => {
    return sectors.flatMap(sector => 
      sector.stocks.map(stock => ({
        ...stock,
        sectorName: sector.sector,
      }))
    );
  }, [sectors]);

  const columns = useMemo<ColumnDef<TableRow>[]>(() => [
    {
      accessorKey: 'particulars',
      header: 'Stock',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.particulars}
          </div>
          <div className="text-xs text-muted-foreground/70 font-normal">
            {row.original.exchangeCode.replace(/\.(NS|BO)$/, '')}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.sectorName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'cmp',
      header: 'CMP',
      cell: ({ row }) => {
        const cmp = row.original.cmp;
        if (cmp === null || cmp === undefined) {
          return <span className="text-muted-foreground">Loading...</span>;
        }
        return formatCurrency(cmp);
      },
    },
    {
      accessorKey: 'gainLossPercent',
      header: 'Gain/Loss %',
      cell: ({ row }) => {
        const gainLossPercent = row.original.gainLossPercent;
        if (gainLossPercent === null || gainLossPercent === undefined) {
          return <span className="text-muted-foreground">--</span>;
        }
        return (
          <span className={cn(
            'font-medium',
            gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatPercentage(gainLossPercent)}
          </span>
        );
      },
    },
    {
      accessorKey: 'gainLoss',
      header: 'Gain/Loss',
      cell: ({ row }) => {
        const gainLoss = row.original.gainLoss;
        if (gainLoss === null || gainLoss === undefined) {
          return <span className="text-muted-foreground">--</span>;
        }
        return (
          <span className={cn(
            'font-medium',
            gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {formatCurrency(gainLoss)}
          </span>
        );
      },
    },
    {
      accessorKey: 'presentValue',
      header: 'Present Value',
      cell: ({ row }) => {
        const presentValue = row.original.presentValue;
        if (presentValue === null || presentValue === undefined) {
          return <span className="text-muted-foreground">--</span>;
        }
        return formatCurrency(presentValue);
      },
    },
    {
      accessorKey: 'investment',
      header: 'Investment',
      cell: ({ row }) => formatCurrency(row.original.investment),
    },
    {
      accessorKey: 'portfolioPercent',
      header: 'Portfolio %',
      cell: ({ row }) => `${row.original.portfolioPercent.toFixed(2)}%`,
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Purchase Price',
      cell: ({ row }) => formatCurrency(row.original.purchasePrice),
    },
    {
      accessorKey: 'qty',
      header: 'Qty',
      cell: ({ row }) => formatNumber(row.original.qty),
    },
    {
      accessorKey: 'peRatio',
      header: 'P/E Ratio',
      cell: ({ row }) => {
        const peRatio = row.original.peRatio;
        if (peRatio === null || peRatio === undefined) {
          return <span className="text-muted-foreground">N/A</span>;
        }
        return peRatio.toFixed(2);
      },
    },
    {
      accessorKey: 'latestEarnings',
      header: 'Latest Earnings',
      cell: ({ row }) => {
        const earnings = row.original.latestEarnings;
        if (earnings === null || earnings === undefined) {
          return <span className="text-muted-foreground">N/A</span>;
        }
        return formatCurrency(earnings);
      },
    },
    {
      accessorKey: 'exchangeCode',
      header: 'NSE/BSE',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-foreground">
          {row.original.exchangeCode.endsWith('.BO') ? 'BSE' : 'NSE'}
        </span>
      ),
    },
  ], []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: allStocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="rounded-md border p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto md:h-auto md:max-h-[calc(100vh-12rem)] rounded-md border border-[#ffffff0e]">
      <table className="w-full min-w-225 caption-bottom text-sm">
        <thead className="sticky top-0 z-20 bg-background shadow-sm [&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="group border-b transition-colors hover:bg-muted/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'h-11 px-3 md:h-12 md:px-4 text-left align-middle font-medium text-muted-foreground bg-background',
                    header.column.id === 'particulars' &&
                      'sticky left-0 top-0 z-30 bg-background group-hover:bg-muted/60 border-r'
                  )}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group border-b transition-colors hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                    key={cell.id}
                    className={cn(
                      'p-3 md:p-4 align-middle',
                      cell.column.id === 'particulars' &&
                        'sticky left-0 z-10 bg-background group-hover:bg-muted/60 border-b'
                    )}
                  >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}