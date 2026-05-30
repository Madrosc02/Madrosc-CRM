'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function MayTargetProgress() {
  const achieved = 85;
  const target = 30.0;
  const actual = 25.6;

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (achieved / 100) * circumference;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-bold text-foreground mb-1">May Target Progress</h3>
      <p className="text-sm text-muted-foreground mb-6">Current month achievement</p>

      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute w-full h-full" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
            />
          </svg>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{achieved}%</p>
            <p className="text-sm text-muted-foreground mt-2">Achieved</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Achievement</span>
          <span className="text-sm font-semibold text-foreground">₹{actual}L</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Target</span>
          <span className="text-sm font-semibold text-foreground">₹{target}L</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-orange-600 text-sm font-medium">
        <AlertCircle className="w-4 h-4" />
        At Risk
      </div>
    </div>
  );
}
