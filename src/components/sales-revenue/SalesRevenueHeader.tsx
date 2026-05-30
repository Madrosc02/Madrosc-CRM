'use client';

import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

interface DateRange {
  from: string;
  to: string;
}

export interface SalesRevenueHeaderProps {
  dateRange: DateRange;
  selectedClient: string;
  onDateRangeChange: (range: DateRange) => void;
  onClientChange: (client: string) => void;
}

export default function SalesRevenueHeader({
  dateRange,
  selectedClient,
  onDateRangeChange,
  onClientChange
}: SalesRevenueHeaderProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40">
      <div className="px-6 py-6">
        <div className="flex flex-col gap-6">
          {/* Title and Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold text-foreground">Analytics Hub</h1>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Date Range */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, from: e.target.value })
                    }
                    className="px-3 py-2 rounded-md text-sm border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      onDateRangeChange({ ...dateRange, to: e.target.value })
                    }
                    className="px-3 py-2 rounded-md text-sm border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Client Filter */}
              <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
                {selectedClient}
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-border overflow-x-auto">
            <button className="pb-4 px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>📊</span>
              Overview
            </button>
            <button className="pb-4 px-2 text-primary font-medium border-b-2 border-primary flex items-center gap-2 whitespace-nowrap">
              <span>💰</span>
              Sales & Revenue
            </button>
            <button className="pb-4 px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>👥</span>
              Clients & Risk
            </button>
            <button className="pb-4 px-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 whitespace-nowrap">
              <span>📍</span>
              Territory & Performance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
