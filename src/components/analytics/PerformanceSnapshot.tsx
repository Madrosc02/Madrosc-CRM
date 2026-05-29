import React from 'react';
import { BarChart3 } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: number;
  color: string;
}

const metrics: PerformanceMetric[] = [
  { label: 'Pipeline Health', value: 72, color: 'bg-indigo-600' },
  { label: 'Follow-up Rate', value: 58, color: 'bg-orange-500' },
  { label: 'Close Rate', value: 34, color: 'bg-blue-500' },
  { label: 'Customer Retention', value: 88, color: 'bg-purple-600' },
];

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

const PerformanceSnapshot: React.FC = () => {
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
