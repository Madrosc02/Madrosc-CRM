import React from 'react';
import { AlertCircle } from 'lucide-react';

const ExecutiveSummary: React.FC = () => {
  const score = 35;
  const maxScore = 100;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Executive Summary</h3>

      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#a78bfa"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * percentage) / 100}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-bold text-slate-900">{score}</p>
            <p className="text-xs text-slate-500">/100</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm text-red-900">Needs Attention</p>
            <p className="text-xs text-red-700 mt-1">
              Health score is <span className="font-semibold">below target</span>. 3 critical items need resolution this week.
            </p>
          </div>
        </div>

        <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
          🔴 Critical
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
