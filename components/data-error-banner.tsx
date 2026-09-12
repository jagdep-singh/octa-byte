'use client'

import {AlertTriangle , RefreshCw} from 'lucide-react';
import {Button} from '@/components/ui/button';

export function DataErrorBanner({message , onRetry}: {message: string; onRetry: () => void}){
    return (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            <span className="flex min-w-0 items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="truncate">{message}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={onRetry}>
                <RefreshCw className="size-3" /> Retry
            </Button>
        </div>

    )
}