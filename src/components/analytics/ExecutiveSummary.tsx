import React from 'react';
import { AlertCircle, CheckCircle2, TriangleAlert, Lightbulb } from 'lucide-react';
import { HealthScoreData } from '../../hooks/useAnalyticsData';

interface ExecutiveSummaryProps {
  data: HealthScoreData;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data }) => {
  const { score, wins, concerns, actions } = data;
  const maxScore = 100;
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 32;
  
  const isCritical = score < 50;

  return (
    <div className="bg-white rounded-[20px] border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      {/* Top Section */}
      <div className="flex items-start gap-5 mb-8">
        {/* Left: Circle Chart */}
        <div className="flex flex-col items-center justify-start w-[100px] shrink-0">
          <div className="relative w-20 h-20 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="32" fill="none" stroke="#f1f5f9" strokeWidth="7" />
              <circle
                cx="50"
                cy="50"
                r="32"
                fill="none"
                stroke={isCritical ? "#ef4444" : "#6366f1"}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * percentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[22px] font-extrabold text-slate-900 leading-none">{score}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">/100</p>
            </div>
          </div>
          {isCritical ? (
            <span className="px-2.5 py-0.5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
               <AlertCircle className="w-3 h-3" /> Critical
            </span>
          ) : (
             <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
               <CheckCircle2 className="w-3 h-3" /> Healthy
            </span>
          )}
        </div>

        {/* Right: Header & Text */}
        <div className="flex-1 pt-1">
          <h3 className="text-[16px] font-bold text-slate-800 mb-2.5 tracking-tight">Executive Summary</h3>
          {isCritical ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 border border-red-100 text-red-700 text-[11px] font-semibold rounded-full mb-3 shadow-sm">
              <AlertCircle className="w-3 h-3" /> Needs Attention
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-full mb-3 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> On Track
            </div>
          )}
          <p className="text-[13px] text-slate-500 leading-relaxed pr-4">
            Health score is <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-indigo-600'}`}>
              {isCritical ? 'below target' : 'healthy'}
            </span>. {concerns.length} critical items need resolution this week.
          </p>
        </div>
      </div>

      {/* Bottom Section: Columns */}
      <div className="grid grid-cols-3 gap-3.5 mt-auto">
        {/* Column 1: Wins */}
        <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 relative flex flex-col">
          <h4 className="text-[12px] font-bold text-blue-700 mb-3.5 flex flex-col items-center justify-center text-center gap-1.5 h-10">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="leading-tight">This Week's<br/>Wins</span>
          </h4>
          <ul className="text-[11.5px] text-slate-600 space-y-3 list-none pl-3 relative flex-1">
             {wins.length > 0 ? wins.map((win, idx) => (
                <li key={idx} className="relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
                   {win}
                </li>
             )) : (
               <li className="text-slate-400 italic">No major wins this week.</li>
             )}
          </ul>
        </div>

        {/* Column 2: Concerns */}
        <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-3.5 relative flex flex-col">
          <h4 className="text-[12px] font-bold text-orange-700 mb-3.5 flex flex-col items-center justify-center text-center gap-1.5 h-10">
            <TriangleAlert className="w-4 h-4 text-orange-500" />
            <span className="leading-tight">Concerns</span>
          </h4>
          <ul className="text-[11.5px] text-slate-600 space-y-3 list-none pl-3 relative flex-1">
             {concerns.length > 0 ? concerns.map((concern, idx) => (
               <li key={idx} className="relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-orange-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
                 {concern}
               </li>
             )) : (
               <li className="text-slate-400 italic">No major concerns.</li>
             )}
          </ul>
        </div>

        {/* Column 3: Actions */}
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 relative flex flex-col">
          <h4 className="text-[12px] font-bold text-indigo-700 mb-3.5 flex flex-col items-center justify-center text-center gap-1.5 h-10">
            <Lightbulb className="w-4 h-4 text-indigo-500" />
            <span className="leading-tight">Recommended<br/>Actions</span>
          </h4>
          <ul className="text-[11.5px] text-slate-600 space-y-3 list-none pl-3 relative flex-1">
             {actions.length > 0 ? actions.map((action, idx) => (
                <li key={idx} className="relative before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full before:absolute before:-left-3 before:top-1.5">
                  {action}
                </li>
             )) : (
               <li className="text-slate-400 italic">Keep up the good work!</li>
             )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
