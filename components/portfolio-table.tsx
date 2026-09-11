'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Stock, SectorGroup } from '@/lib/types';
import { formatCurrency, formatNumber, formatPercentage, cn } from '@/lib/utils';

interface PortfolioTableProps {
  sectors: SectorGroup[];
  loading?: boolean;
}

export function PortfolioTable({ sectors, loading }: PortfolioTableProps) {
  const allStocks = useMemo(() => {
    return sectors.flatMap(sector => 
      sector.stocks.map(stock => ({
        ...stock,
        sectorName: sector.sector,
      }))
    );
  }, [sectors]);

  const columns = useMemo(() => [
    {
      accessorKey: 'particulars',
      header: 'Stock',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.particulars}</div>
          <div className="text-sm text-muted-foreground">{row.original.sectorName}</div>
        </div>
      ),
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
  ], []);

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
    <div className="rounded-md border">
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
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
              className="border-b transition-colors hover:bg-muted/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-4 align-middle">
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