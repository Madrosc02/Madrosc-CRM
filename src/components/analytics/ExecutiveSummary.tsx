import React from 'react';
import { AlertCircle, CheckCircle2, TriangleAlert, Lightbulb } from 'lucide-react';

const ExecutiveSummary: React.FC = () => {
  const score = 35;
  const maxScore = 100;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 35;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      {/* Top Section */}
      <div className="flex items-start gap-6 mb-8">
        {/* Left: Circle Chart */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#a855f7"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * percentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-900 leading-none">{score}</p>
              <p className="text-[10px] text-slate-500 font-medium">/100</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full flex items-center gap-1">
             <AlertCircle className="w-3 h-3" /> Critical
          </span>
        </div>

        {/* Right: Header & Text */}
        <div className="flex-1 pt-2">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Executive Summary</h3>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-3">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Attention
          </div>
          <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
            Health score is <span className="font-bold text-purple-700">below target</span>. 3 critical items need resolution this week.
          </p>
        </div>
      </div>

      {/* Bottom Section: Columns */}
      <div className="grid grid-cols-3 gap-4 mt-auto">
        {/* Column 1: Wins */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 relative h-full">
          <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center justify-center text-center gap-1.5 h-8">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="leading-tight">This Week's<br/>Wins</span>
            </div>
          </h4>
          <ul className="text-[11px] text-blue-800 space-y-2.5 list-none pl-3 relative mt-4">
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-blue-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Steady performance maintained
             </li>
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-blue-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               New client onboarding <span className="font-bold">+12%</span>
             </li>
          </ul>
        </div>

        {/* Column 2: Concerns */}
        <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 relative h-full">
          <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center justify-center text-center gap-1.5 h-8">
             <div className="flex flex-col items-center gap-1">
              <TriangleAlert className="w-3.5 h-3.5 text-orange-600" />
              <span className="leading-tight">Concerns</span>
            </div>
          </h4>
          <ul className="text-[11px] text-orange-800 space-y-2.5 list-none pl-3 relative mt-4">
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-orange-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               High outstanding ratio (23%)
             </li>
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-orange-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Focus on outstanding payments
             </li>
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-orange-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Identify tier-upgrade clients
             </li>
          </ul>
        </div>

        {/* Column 3: Actions */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 relative h-full">
          <h4 className="text-sm font-bold text-indigo-800 mb-3 flex items-center justify-center text-center gap-1.5 h-8">
             <div className="flex flex-col items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
              <span className="leading-tight">Recommended<br/>Actions</span>
            </div>
          </h4>
          <ul className="text-[11px] text-indigo-800 space-y-2.5 list-none pl-3 relative mt-4">
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-indigo-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Collect outstanding payments
             </li>
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-indigo-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Reach 8 engagement opps
             </li>
             <li className="relative before:content-[''] before:w-1 before:h-1 before:bg-indigo-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
               Upgrade 3 clients to premium
             </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
