'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

const receivablesData = [
  { label: 'Current (0-30d)', value: 18.4, color: '#10B981' },
  { label: '30-60d', value: 9.2, color: '#FFA500' },
  { label: '60-90d', value: 4.8, color: '#FF7F50' },
  { label: '90d+ Overdue', value: 2.1, color: '#FF4444' }
];

const MAX_VALUE = 20;
const CHART_HEIGHT = 280;

export default function ReceivablesAging() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Receivables Aging</h2>
          <p className="text-sm text-gray-500 mt-1">Outstanding payment buckets — critical for cash flow management</p>
        </div>
        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">₹2.1L overdue 90d+</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex gap-4" style={{ minHeight: `${CHART_HEIGHT + 60}px` }}>
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between pr-4" style={{ minWidth: '50px' }}>
          <span className="text-xs text-gray-500 font-medium">₹20L</span>
          <span className="text-xs text-gray-500 font-medium">₹15L</span>
          <span className="text-xs text-gray-500 font-medium">₹10L</span>
          <span className="text-xs text-gray-500 font-medium">₹5L</span>
          <span className="text-xs text-gray-500 font-medium">₹0L</span>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative" style={{ height: `${CHART_HEIGHT}px` }}>
          {/* Background Grid */}
          <div className="absolute inset-0 bg-gray-50 rounded-lg">
            <div className="absolute w-full h-full flex flex-col justify-between pointer-events-none">
              <div className="border-t border-gray-200"></div>
              <div className="border-t border-gray-200"></div>
              <div className="border-t border-gray-200"></div>
              <div className="border-t border-gray-200"></div>
              <div className="border-t border-gray-200"></div>
            </div>
          </div>

          {/* Bars Container - No extra spacing */}
          <div className="absolute inset-0 flex items-end justify-around px-4 gap-8 py-0">
            {receivablesData.map((item) => {
              const heightPercent = (item.value / MAX_VALUE) * 100;

              return (
                <div key={item.label} className="flex flex-col items-center flex-1 gap-2">
                  {/* Bar - Proper width and height */}
                  <div
                    className="w-full rounded-t-md transition-all hover:shadow-md"
                    style={{
                      backgroundColor: item.color,
                      height: `${heightPercent}%`,
                      minHeight: '10px',
                      maxWidth: '120px'
                    }}
                  />
                  {/* Label */}
                  <span className="text-xs text-gray-600 text-center font-medium mt-2 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
