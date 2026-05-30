'use client';

import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chartData = [
  { month: 'Oct', actual: 20, target: 22, forecast: 21 },
  { month: 'Nov', actual: 21, target: 23, forecast: 22 },
  { month: 'Dec', actual: 26, target: 24, forecast: 25 },
  { month: 'Jan', actual: 20, target: 25, forecast: 27 },
  { month: 'Feb', actual: 28, target: 26, forecast: 28 },
  { month: 'Mar', actual: 30, target: 29, forecast: 31 },
  { month: 'Apr', actual: 26, target: 30, forecast: 32 },
  { month: 'May', actual: 25, target: 28, forecast: 33 },
  { month: 'Jun', actual: null, target: null, forecast: 35 },
  { month: 'Jul', actual: null, target: null, forecast: 36 },
  { month: 'Aug', actual: null, target: null, forecast: 37 }
];

export default function RevenueVsTarget() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">Revenue vs Target & AI Forecast</h3>
      <p className="text-sm text-muted-foreground mb-6">Actual performance with 90-day AI-projected forecast (shaded)</p>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5FFF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8B5FFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" label={{ value: '₹L', angle: -90, position: 'insideLeft' }} />
          <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '6px' }} />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#5B5FFF"
            strokeWidth={2}
            dot={{ fill: '#5B5FFF', r: 4 }}
            name="Actual"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="var(--muted-foreground)"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
            dot={{ fill: 'var(--muted-foreground)', r: 4 }}
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="forecast"
            stroke="#8B5FFF"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorForecast)"
            name="Forecast"
            connectNulls={true}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Mar Data:</strong> Target: ₹28.0L | Actual: ₹31.4L
        </p>
      </div>
    </div>
  );
}
