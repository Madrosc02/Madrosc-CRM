import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RevenueData } from '../../hooks/useAnalyticsData';

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

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
            onClick={() => setChartType('line')}
            className={`text-xs ${chartType === 'line' ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'text-slate-500'}`}
          >
            Trend
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setChartType('bar')}
            className={`text-xs ${chartType === 'bar' ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50' : 'text-slate-500'}`}
          >
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
        {chartType === 'line' ? (
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
        ) : (
          <BarChart data={data}>
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
              cursor={{ fill: '#f1f5f9' }}
            />
            <Bar dataKey="actual" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
