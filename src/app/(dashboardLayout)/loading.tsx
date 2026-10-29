import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Loading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-48 rounded-2xl" />
      </div>

      {/* Grid Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-[2rem]" />
        ))}
      </div>

      {/* Large Content Area Loading */}
      <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
      
      {/* Table-like Loading */}
      <div className="space-y-4 pt-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl opacity-70" />
        <Skeleton className="h-12 w-full rounded-2xl opacity-40" />
      </div>
    </div>
  );
}
