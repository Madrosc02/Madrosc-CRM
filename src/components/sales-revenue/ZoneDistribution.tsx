'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const zoneData = [
  { name: 'South Zone', value: 48, fill: '#5B5FFF' },
  { name: 'West Zone', value: 24, fill: '#8B5FFF' },
  { name: 'North Zone', value: 16, fill: '#B5A0FF' },
  { name: 'East Zone', value: 12, fill: '#D4C9FF' }
];

export default function ZoneDistribution() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">Zone Distribution</h3>
      <p className="text-sm text-muted-foreground mb-6">Revenue split across zones</p>
      
      <div className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={zoneData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {zoneData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        {zoneData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              ></div>
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
