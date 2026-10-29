"use client";

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Visual Icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-red-100 rounded-full scale-150 blur-xl opacity-50 animate-pulse" />
          <div className="relative h-24 w-24 bg-white rounded-[2rem] shadow-xl shadow-red-200/50 flex items-center justify-center border border-red-50">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Error Messaging */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Something went wrong</h1>
          <p className="text-slate-500 font-medium">
            We encountered an unexpected error while processing your request. Please try again or return to safety.
          </p>
          {error.digest && (
            <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              ID: {error.digest}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => reset()}
            className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-primary transition-all group"
          >
            <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </Button>
          
          <Link href="/">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl border-2 border-slate-200 text-slate-600 font-black uppercase tracking-widest hover:bg-slate-50 transition-all w-full sm:w-auto"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Footer help */}
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest pt-8">
          Support Code: NB-ERR-500
        </p>
      </div>
    </div>
  );
}
