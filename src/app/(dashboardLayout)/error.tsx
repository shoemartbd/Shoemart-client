"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
      <div className="h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mb-6 border border-amber-100 shadow-sm shadow-amber-100">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
      </div>
      
      <h2 className="text-2xl font-black text-slate-900 mb-2">Dashboard Error</h2>
      <p className="text-slate-500 font-medium max-w-sm mb-8">
        We had some trouble loading this section of your dashboard. This might be a temporary connection issue.
      </p>

      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="h-12 px-8 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reload Section
        </Button>
      </div>

      <div className="mt-12 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
          Technical Details: {error.message || "Unknown error occurred"}
        </p>
      </div>
    </div>
  );
}
