
// import {clsx , type ClassValue} from "clsx"
// import {twMerge} from "tailwind-merge"

// export function cns(...inputs: ClassValue[]) {
//     return twMerge(clsx(inputs))
// }
export { cn } from "cn"

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatNumber(value: number): string{
    return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function toGoogleFinanceTicker(exchangeCode: string): string {
    return `${exchangeCode.replace('.NS', '')}:NSE`;
}

export function toNumber(value: string): number | null {
    const parsed = parseFloat(value.replace(/[^0-9.\-]/g, ''));
    return Number.isNaN(parsed) ? null : parsed;
}