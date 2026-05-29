import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  subtitle?: string;
}

export function MetricCard({ icon, title, value, trend, subtitle }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
          {icon}
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <Info className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {title}
      </h3>

      <p className="text-3xl font-bold text-slate-900 mb-2">
        {value}
      </p>

      {trend && (
        <div className="flex items-center gap-1">
          {trend.direction === 'up' ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{trend.value}</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-600">{trend.value}</span>
            </>
          )}
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

export default MetricCard;
