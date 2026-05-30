'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';

const repData = [
  {
    rank: 1,
    initials: 'PS',
    name: 'Priya Sharma',
    region: 'Bengaluru',
    revenue: '₹12.4L',
    target: '+24%',
    calls: 148,
    conversion: 24.3,
    targetTrend: 'up'
  },
  {
    rank: 2,
    initials: 'RV',
    name: 'Rahul Verma',
    region: 'Pune',
    revenue: '₹10.8L',
    target: '-2%',
    calls: 132,
    conversion: 21.7,
    targetTrend: 'down'
  },
  {
    rank: 3,
    initials: 'KN',
    name: 'Kavitha Nair',
    region: 'Chennai',
    revenue: '₹9.6L',
    target: '+7%',
    calls: 119,
    conversion: 22.5,
    targetTrend: 'up'
  },
  {
    rank: 4,
    initials: 'AJ',
    name: 'Amit Joshi',
    region: 'Hyderabad',
    revenue: '₹8.9L',
    target: '-11%',
    calls: 141,
    conversion: 18.4,
    targetTrend: 'down'
  },
  {
    rank: 5,
    initials: 'SR',
    name: 'Sunita Reddy',
    region: 'Mumbai',
    revenue: '₹7.4L',
    target: '-18%',
    calls: 108,
    conversion: 15.7,
    targetTrend: 'down'
  },
  {
    rank: 6,
    initials: 'DS',
    name: 'Deepak Singh',
    region: 'Ahmedabad',
    revenue: '₹6.8L',
    target: '-15%',
    calls: 97,
    conversion: 17.2,
    targetTrend: 'down'
  }
];

export default function SalesRepLeaderboard() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Sales Rep Leaderboard</h3>
          <p className="text-sm text-muted-foreground">MTD performance — revenue, calls & conversion vs personal target</p>
        </div>
        <button className="flex items-center gap-2 text-primary text-sm font-medium hover:text-primary/80 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Rank</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Rep</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Region</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Revenue</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">vs Target</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Calls</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Conv. %</th>
            </tr>
          </thead>
          <tbody>
            {repData.map((rep) => (
              <tr key={rep.rank} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm">
                    {rep.rank}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-semibold text-sm">
                      {rep.initials}
                    </span>
                    <span className="font-medium text-foreground">{rep.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{rep.region}</td>
                <td className="py-4 px-4 font-semibold text-foreground">{rep.revenue}</td>
                <td className="py-4 px-4">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      rep.targetTrend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {rep.targetTrend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {rep.target}
                  </span>
                </td>
                <td className="py-4 px-4 text-foreground">{rep.calls}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${rep.conversion}%` }}
                      ></div>
                    </div>
                    <span className="text-foreground font-medium w-10">{rep.conversion}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
