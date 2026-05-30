'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const collectionData = [
  { name: 'Current (0-30d)', value: 18.4, fill: '#10B981', invoices: 42 },
  { name: '30-60d', value: 9.2, fill: '#F59E0B', invoices: 18 },
  { name: '60-90d', value: 4.8, fill: '#EF5350', invoices: 9 },
  { name: '90d+ Overdue', value: 2.1, fill: '#DC2626', invoices: 5 }
];

export default function CollectionSummary() {
  const totalOutstanding = collectionData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">Collection Summary</h3>
      <p className="text-sm text-muted-foreground mb-6">Outstanding by bucket</p>

      <div className="space-y-3 mb-6">
        {collectionData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: item.fill }} />
              <div>
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.invoices} invoices</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold text-foreground">₹{item.value}L</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold text-foreground">₹{totalOutstanding.toFixed(1)}L</p>
          </div>
          <div className="flex items-center gap-2 text-orange-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>At Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
