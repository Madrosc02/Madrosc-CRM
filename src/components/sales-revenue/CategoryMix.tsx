'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const categoryData = [
  { name: 'Antibiotics', value: 34, fill: '#5B5FFF' },
  { name: 'Cardiac', value: 22, fill: '#8B5FFF' },
  { name: 'Diabetic', value: 18, fill: '#B5A0FF' },
  { name: 'GI Tract', value: 14, fill: '#D4C9FF' }
];

export default function CategoryMix() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">Category Mix</h3>
      <p className="text-sm text-muted-foreground mb-6">Revenue share by therapeutic area</p>

      <div className="flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 space-y-3">
        {categoryData.map((item, index) => (
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
