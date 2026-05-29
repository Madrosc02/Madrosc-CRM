import React from 'react';
import { BarChart3 } from 'lucide-react';

import { Customer } from '../../types';
import { HealthScoreData } from '../../hooks/useAnalyticsData';

interface PerformanceMetric {
  label: string;
  value: number;
  color: string;
}

interface PerformanceSnapshotProps {
  customers?: Customer[];
  healthScore?: HealthScoreData;
}

function ProgressBar({ label, value, color }: PerformanceMetric) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}

const PerformanceSnapshot: React.FC<PerformanceSnapshotProps> = ({ customers = [], healthScore }) => {
  const metrics: PerformanceMetric[] = React.useMemo(() => {
    if (customers.length === 0) return [];

    // Pipeline Health = Health Score (or 100 if missing)
    const pipelineHealth = healthScore ? healthScore.score : 100;

    // Active Engagement = % of customers with sales this month
    const activeCount = customers.filter(c => c.salesThisMonth > 0).length;
    const activeEngagement = Math.round((activeCount / customers.length) * 100);

    // Outstanding Balance Health = % of customers with 0 outstanding balance
    const cleanBalanceCount = customers.filter(c => c.outstandingBalance === 0).length;
    const balanceHealth = Math.round((cleanBalanceCount / customers.length) * 100);

    // Customer Retention = % of customers active in last 90 days
    const retainedCount = customers.filter(c => c.daysSinceLastOrder <= 90).length;
    const retention = Math.round((retainedCount / customers.length) * 100);

    return [
      { label: 'Overall Health', value: pipelineHealth, color: 'bg-indigo-600' },
      { label: 'Active Engagement', value: activeEngagement, color: 'bg-orange-500' },
      { label: 'Balance Health', value: balanceHealth, color: 'bg-blue-500' },
      { label: '90-Day Retention', value: retention, color: 'bg-purple-600' },
    ];
  }, [customers, healthScore]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Performance Snapshot
      </h3>

      <div className="space-y-6">
        {metrics.map((metric) => (
          <ProgressBar
            key={metric.label}
            label={metric.label}
            value={metric.value}
            color={metric.color}
          />
        ))}
      </div>
    </div>
  );
};

export default PerformanceSnapshot;
