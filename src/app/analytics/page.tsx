'use client';

import React, { useState } from 'react';
import SalesRevenueLayout from '@/components/sales-revenue/SalesRevenueLayout';

export default function SalesRevenuePage() {
  const [dateRange, setDateRange] = useState({
    from: '2026-04-30',
    to: '2026-05-30'
  });
  
  const [selectedClient, setSelectedClient] = useState('All Customers');

  return (
    <SalesRevenueLayout
      dateRange={dateRange}
      selectedClient={selectedClient}
      onDateRangeChange={setDateRange}
      onClientChange={setSelectedClient}
    />
  );
}
