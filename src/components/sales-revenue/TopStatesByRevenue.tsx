'use client';

import React from 'react';

const statesData = [
  {
    rank: 1,
    name: 'Karnataka',
    cities: '8 cities',
    growth: '+14.2%',
    revenue: '₹25.6L',
    percentage: 32
  },
  {
    rank: 2,
    name: 'Maharashtra',
    cities: '12 cities',
    growth: '+8.7%',
    revenue: '₹18.9L',
    percentage: 24
  },
  {
    rank: 3,
    name: 'Tamil Nadu',
    cities: '7 cities',
    growth: '-2.1%',
    revenue: '₹12.4L',
    percentage: 16
  },
  {
    rank: 4,
    name: 'Telangana',
    cities: '5 cities',
    growth: '+21.3%',
    revenue: '₹9.8L',
    percentage: 12
  },
  {
    rank: 5,
    name: 'Gujarat',
    cities: '6 cities',
    growth: '+11.8%',
    revenue: '₹7.2L',
    percentage: 9
  },
  {
    rank: 6,
    name: 'Rajasthan',
    cities: '4 cities',
    growth: '+4.5%',
    revenue: '₹5.6L',
    percentage: 7
  }
];

export default function TopStatesByRevenue() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Top States by Revenue</h3>
          <p className="text-sm text-muted-foreground">State-wise contribution with MoM growth signal</p>
        </div>
        <span className="text-sm text-primary font-medium">📍 6 states active</span>
      </div>

      <div className="space-y-4">
        {statesData.map((state) => (
          <div key={state.rank} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground w-6 text-center">
              {state.rank}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                {state.name} <span className="text-muted-foreground text-xs">{state.cities}</span>
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
                  style={{ width: `${state.percentage * 3}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right min-w-max">
              <p
                className={`text-xs font-medium mb-1 ${
                  state.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {state.growth}
              </p>
              <p className="text-sm font-semibold text-foreground">{state.revenue}</p>
              <p className="text-xs text-muted-foreground">{state.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
