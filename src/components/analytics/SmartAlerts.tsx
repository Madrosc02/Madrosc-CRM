import React, { useState } from 'react';
import { InsightCategoryData } from '../../hooks/useAnalyticsData';
import { useApp } from '../../contexts/AppContext';
import UpcomingTasks from '../UpcomingTasks';

interface SmartAlertsProps {
  insights?: InsightCategoryData[];
}

export const SmartAlerts: React.FC<SmartAlertsProps> = ({ insights = [] }) => {
  const { openAddCustomerModal, tasks, customers } = useApp();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Use dynamic real data for counts
  const overdueCount = tasks.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length;
  // Consider a customer 'new' if added in the last 30 days. We don't have createdDate, so we can use Engagement Opportunities as a proxy, or default to 0.
  const newCustomerCount = insights.find(i => i.category === 'Engagement Opportunities')?.count || 0;

  const handleViewTasks = () => {
    setIsTaskModalOpen(true);
  };

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setGeneratedInsight(null);
    try {
        const { generateShortAIInsight } = await import('../../services/geminiService');
        const summary = await generateShortAIInsight(customers, tasks);
        setGeneratedInsight(summary);
    } catch (error) {
        console.error("Failed to generate insights:", error);
        setGeneratedInsight("Failed to connect to AI service.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Smart Alerts Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-semibold text-[16px] text-slate-900 tracking-tight">
          Smart Alerts
        </h3>
        <span className="flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 text-purple-600 text-[11px] font-semibold rounded-full border border-purple-100">
          <i className="far fa-clock text-[10px]"></i> 2 Active
        </span>
      </div>

      {/* Overdue Tasks Alert */}
      <div className="bg-[#fffcf3] border border-amber-200/60 rounded-[16px] p-4">
        <div className="flex items-start gap-3.5">
          <div className="bg-white border border-amber-100 w-9 h-9 rounded-[10px] flex items-center justify-center text-amber-500 shadow-sm shrink-0">
            <i className="fas fa-exclamation-triangle text-[14px]"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-semibold text-slate-900 text-[13.5px]">Overdue Tasks</h4>
              <span className="px-2 py-0.5 bg-amber-100/80 text-amber-700 text-[11px] font-bold rounded-full flex items-center gap-1">
                <i className="fas fa-exclamation-triangle text-[9px]"></i> {overdueCount} New
              </span>
            </div>
            <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3 pr-2">
              You have {overdueCount} overdue tasks requiring attention.
            </p>
            <button 
              onClick={handleViewTasks}
              className="text-amber-600 text-[12.5px] font-semibold flex items-center gap-1 hover:text-amber-700 transition-colors"
            >
              View Tasks <i className="fas fa-chevron-right text-[9px] mt-[1px]"></i>
            </button>
          </div>
        </div>
      </div>

      {/* New Customers Alert */}
      <div className="bg-blue-50/40 border border-blue-200/60 rounded-[16px] p-4">
        <div className="flex items-start gap-3.5">
          <div className="bg-white border border-blue-100 w-9 h-9 rounded-[10px] flex items-center justify-center text-blue-500 shadow-sm shrink-0">
            <i className="fas fa-user-plus text-[14px]"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-semibold text-slate-900 text-[13.5px]">New Customers</h4>
              <span className="px-2 py-0.5 bg-blue-100/80 text-blue-700 text-[11px] font-bold rounded-full flex items-center gap-1">
                <i className="fas fa-arrow-trend-up text-[9px]"></i> Onboard
              </span>
            </div>
            <p className="text-[12.5px] text-slate-500 leading-relaxed mb-3">
              {newCustomerCount} new customers added recently.
            </p>
            <button 
              onClick={openAddCustomerModal}
              className="text-blue-600 text-[12.5px] font-semibold flex items-center gap-1 hover:text-blue-700 transition-colors"
            >
              Onboard Now <i className="fas fa-chevron-right text-[9px] mt-[1px]"></i>
            </button>
          </div>
        </div>
      </div>

      {/* AI Powered Insights */}
      <div className="bg-[#242152] rounded-[16px] p-5 text-white shadow-md relative overflow-hidden mt-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <i className="far fa-sparkles text-indigo-300 text-[14px]"></i>
            <h3 className="font-semibold text-[14px] tracking-wide">AI Powered Insights</h3>
          </div>
          <button 
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            className="bg-[#4239b5] hover:bg-[#4b41cc] text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <i className={`fas fa-sync-alt text-[9px] ${isGenerating ? 'animate-spin' : ''}`}></i> Regenerate
          </button>
        </div>
        
        <div className="bg-[#1a173d]/60 border border-white/5 rounded-[12px] p-5 mt-2 flex flex-col items-center text-center relative z-10 min-h-[120px] justify-center">
          {isGenerating ? (
            <div className="flex flex-col items-center">
              <i className="fas fa-circle-notch fa-spin text-indigo-400 text-2xl mb-3"></i>
              <p className="text-[12px] text-indigo-200/80">Analyzing your live data...</p>
            </div>
          ) : generatedInsight ? (
            <div className="text-left w-full">
              <p className="text-[12.5px] text-indigo-100/90 leading-relaxed mb-3 font-medium">
                {generatedInsight}
              </p>
              <button 
                onClick={() => setGeneratedInsight(null)}
                className="text-[11px] text-indigo-300 hover:text-white transition-colors flex items-center gap-1"
              >
                Clear Insight
              </button>
            </div>
          ) : (
            <>
              <p className="text-[12.5px] text-indigo-200/80 leading-relaxed max-w-[200px] mb-4">
                Generate AI-powered recommendations from your live data.
              </p>
              <button 
                onClick={handleGenerateInsights}
                className="bg-[#7859ff] hover:bg-[#8668ff] text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl flex items-center justify-center gap-2 w-full transition-all shadow-sm"
              >
                <i className="far fa-sparkles"></i> Generate Insights
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="h-[500px]">
              <UpcomingTasks />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartAlerts;
