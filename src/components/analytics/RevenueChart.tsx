import React from 'react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RevenueData } from '../../hooks/useAnalyticsData';

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Actual vs target (₹) — Last 6 months</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-50"
          >
            Trend
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Bars
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
          <span className="text-sm text-slate-600">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
          <span className="text-sm text-slate-600">Target</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />

          <Line
            type="monotone"
            dataKey="actual"
            stroke="#4f46e5"
            dot={{ fill: '#4f46e5', r: 4 }}
            activeDot={{ r: 6 }}
            strokeWidth={3}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#cbd5e1"
            dot={false}
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
