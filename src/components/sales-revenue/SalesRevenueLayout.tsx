'use client';

import React from 'react';
import SalesRevenueHeader from './SalesRevenueHeader';
import KPICards from './KPICards';
import ZoneDistribution from './ZoneDistribution';
import TopProductsByRevenue from './TopProductsByRevenue';
import TopStatesByRevenue from './TopStatesByRevenue';
import SalesRepLeaderboard from './SalesRepLeaderboard';
import RevenueVsTarget from './RevenueVsTarget';
import MayTargetProgress from './MayTargetProgress';
import ReceivablesAging from './ReceivablesAging';
import CategoryMix from './CategoryMix';
import CollectionSummary from './CollectionSummary';

export interface DateRange {
  from: string;
  to: string;
}

export interface SalesRevenueLayoutProps {
  dateRange: DateRange;
  selectedClient: string;
  onDateRangeChange: (range: DateRange) => void;
  onClientChange: (client: string) => void;
}

export default function SalesRevenueLayout({
  dateRange,
  selectedClient,
  onDateRangeChange,
  onClientChange
}: SalesRevenueLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <SalesRevenueHeader
        dateRange={dateRange}
        selectedClient={selectedClient}
        onDateRangeChange={onDateRangeChange}
        onClientChange={onClientChange}
      />

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards Section */}
        <KPICards dateRange={dateRange} />

        {/* Charts Grid - First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ZoneDistribution />
          <TopProductsByRevenue />
        </div>

        {/* Top States */}
        <TopStatesByRevenue />

        {/* Receivables Aging */}
        <ReceivablesAging />

        {/* Collection Summary */}
        <CollectionSummary />

        {/* Sales Rep Leaderboard */}
        <SalesRepLeaderboard />

        {/* Revenue Forecast */}
        <RevenueVsTarget />

        {/* Progress & Category Mix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MayTargetProgress />
          <CategoryMix />
        </div>
      </main>
    </div>
  );
}
