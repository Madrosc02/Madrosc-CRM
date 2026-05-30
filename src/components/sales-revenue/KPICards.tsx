'use client';

import React from 'react';
import { TrendingUp, Target, Activity, Package, Users } from 'lucide-react';

export interface KPICardsProps {
  dateRange: { from: string; to: string };
}

const kpiData = [
  {
    label: 'REVENUE MTD',
    value: '₹25.6L',
    subtext: 'May 2026',
    trend: '+8.7%',
    trendDirection: 'up',
    icon: TrendingUp,
    iconBg: '#5B5FFF',
    comparison: 'vs last month'
  },
  {
    label: 'TARGET ACHIEVEMENT',
    value: '85.3%',
    subtext: '₹25.6L of ₹30L',
    trend: '-4.1%',
    trendDirection: 'down',
    icon: Target,
    iconBg: '#8B5FFF',
    comparison: 'vs last month'
  },
  {
    label: 'MOM GROWTH',
    value: '+11.5%',
    subtext: 'vs April ₹23.1L',
    trend: 'Trending Up',
    trendDirection: 'up',
    icon: Activity,
    iconBg: '#10B981',
    comparison: 'vs last month'
  },
  {
    label: 'AVG. ORDER VALUE',
    value: '₹18,400',
    subtext: 'Per invoice',
    trend: '+₹1,200',
    trendDirection: 'up',
    icon: Package,
    iconBg: '#F59E0B',
    comparison: 'vs last month'
  },
  {
    label: 'PIPELINE VALUE',
    value: '₹68.2L',
    subtext: '142 active deals',
    trend: '+12 deals',
    trendDirection: 'up',
    icon: Users,
    iconBg: '#5B5FFF',
    comparison: 'vs last month'
  }
];

export default function KPICards({ dateRange }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={index}
            className="bg-card rounded-lg p-4 border border-border hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: kpi.iconBg + '20' }}>
                <IconComponent className="w-5 h-5" style={{ color: kpi.iconBg }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
              {kpi.label}
            </p>
            <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            <p className="text-sm text-muted-foreground mb-3">{kpi.subtext}</p>
            <p
              className={`text-sm font-medium ${
                kpi.trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {kpi.trendDirection === 'up' ? '↗' : '↘'} {kpi.trend} {kpi.comparison}
            </p>
          </div>
        );
      })}
    </div>
  );
}
