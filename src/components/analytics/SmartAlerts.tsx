import React from 'react';
import { InsightCategoryData } from '../../hooks/useAnalyticsData';

interface SmartAlertsProps {
  insights?: InsightCategoryData[];
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ insights = [] }) => {
  // Use the top two insights to display as alerts
  const displayInsights = insights.filter(i => i.count > 0).slice(0, 2);
  const totalActive = displayInsights.reduce((sum, i) => sum + i.count, 0);

  return (
    <div className="space-y-5">
      {/* Smart Alerts Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-[16px] text-slate-900 tracking-tight">
          Smart Alerts
        </h3>
        {totalActive > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 text-[11px] font-semibold rounded-full border border-purple-100">
            <i className="far fa-clock text-[10px]"></i> {totalActive} Active
          </span>
        )}
      </div>

      {/* Dynamic Alerts */}
      {displayInsights.length > 0 ? displayInsights.map((insight, idx) => {
        const isWarning = insight.iconType === 'AlertTriangle' || insight.iconType === 'AlertCircle';
        const bgColor = isWarning ? 'bg-[#fffcf3] border-amber-200/60' : 'bg-blue-50/40 border-blue-200/60';
        const iconBg = isWarning ? 'bg-white border-amber-100 text-amber-500' : 'bg-white border-blue-100 text-blue-500';
        const badgeColor = isWarning ? 'bg-amber-100/80 text-amber-700' : 'bg-blue-100/80 text-blue-700';
        const btnColor = isWarning ? 'text-amber-600 hover:text-amber-700' : 'text-blue-600 hover:text-blue-700';
        
        let iconClass = 'fas fa-chart-line';
        if (insight.iconType === 'AlertTriangle') iconClass = 'fas fa-exclamation-triangle';
        if (insight.iconType === 'AlertCircle') iconClass = 'fas fa-exclamation-circle';
        if (insight.iconType === 'TrendingUp') iconClass = 'fas fa-arrow-trend-up';

        return (
          <div key={idx} className={`${bgColor} border rounded-[16px] p-4`}>
            <div className="flex items-start gap-3.5">
              <div className={`${iconBg} border w-9 h-9 rounded-[10px] flex items-center justify-center shadow-sm shrink-0`}>
                <i className={`${iconClass} text-[14px]`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-semibold text-slate-900 text-[13.5px]">{insight.category}</h4>
                  <span className={`px-2 py-0.5 ${badgeColor} text-[11px] font-bold rounded-full flex items-center gap-1`}>
                    {insight.count} Found
                  </span>
                </div>
                <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3 pr-2">
                  {insight.count} {insight.count === 1 ? 'customer requires' : 'customers require'} attention in this category.
                </p>
                <button className={`${btnColor} text-[12.5px] font-semibold flex items-center gap-1 transition-colors`}>
                  Review List <i className="fas fa-chevron-right text-[9px] mt-[1px]"></i>
                </button>
              </div>
            </div>
          </div>
        );
      }) : (
        <div className="text-center text-sm text-slate-500 p-4 border border-dashed border-slate-200 rounded-xl">
           No active alerts right now.
        </div>
      )}

      {/* AI Powered Insights */}
      <div className="bg-[#242152] rounded-[16px] p-5 text-white shadow-md relative overflow-hidden mt-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <i className="far fa-sparkles text-indigo-300 text-[14px]"></i>
            <h3 className="font-semibold text-[14px] tracking-wide">AI Powered Insights</h3>
          </div>
          <button className="bg-[#4239b5] hover:bg-[#4b41cc] text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
            <i className="fas fa-sync-alt text-[9px]"></i> Regenerate
          </button>
        </div>
        
        <div className="bg-[#1a173d]/60 border border-white/5 rounded-[12px] p-5 mt-2 flex flex-col items-center text-center relative z-10">
          <p className="text-[12.5px] text-indigo-200/80 leading-relaxed max-w-[200px] mb-4">
            Generate AI-powered recommendations from your live data.
          </p>
          <button className="bg-[#7859ff] hover:bg-[#8668ff] text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 w-full transition-all shadow-sm">
            <i className="far fa-sparkles"></i> Generate Insights
          </button>
        </div>
      </div>
    </div>
  );
}

export default SmartAlerts;
