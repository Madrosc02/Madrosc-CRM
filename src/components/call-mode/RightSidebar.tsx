import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '../../utils';

interface RightSidebarProps {
    openGoals: () => void;
    openSalesHistory: () => void;
    openTasks: () => void;
    openQuickActions: () => void;
    openInvoiceModal: () => void;
    setShowAICallPrep: (show: boolean) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    openGoals,
    openSalesHistory,
    openTasks,
    openQuickActions,
    openInvoiceModal,
    setShowAICallPrep
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const quickActions = [
        { icon: '📄', label: 'Upload Invoice', count: 'AI Scan', onClick: openInvoiceModal },
        { icon: '⚡', label: 'Quick Actions', count: '8 pending', onClick: openQuickActions },
        { icon: '🎯', label: 'Goals', count: '3 pending', onClick: openGoals },
        { icon: '✓', label: 'Tasks', count: '5 pending', onClick: openTasks },
        { icon: '📈', label: 'Sales History', count: 'View', onClick: openSalesHistory },
    ];

    if (isCollapsed) {
        return (
            <button
                onClick={() => setIsCollapsed(false)}
                className="fixed right-4 bottom-20 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl z-[90]"
                title="Expand sidebar"
            >
                <ChevronLeft className="w-5 h-5 rotate-180" />
            </button>
        );
    }

    return (
        <div className="w-72 bg-white border-l border-slate-200 p-6 overflow-y-auto flex flex-col gap-6 h-full shrink-0 relative z-[90] custom-scrollbar shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Activity & Insights</h2>
                <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Collapse sidebar"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
            </div>

            {/* AI Recommendations */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="text-lg">✨</span> AI Next Best Action
                </h3>
                <div 
                    className="space-y-3 cursor-pointer group"
                    onClick={() => setShowAICallPrep(true)}
                >
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 group-hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-red-100 rounded-bl-xl flex items-center justify-center translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <i className="fas fa-robot text-red-500 text-[10px]"></i>
                        </div>
                        <p className="text-[10px] font-black tracking-wider text-red-600 mb-2">HIGH PRIORITY</p>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">Follow up on pending order from last week</p>
                        <p className="text-xs text-slate-600 mt-2">Customer showed strong interest in Antibiotic range</p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">⏰ Suggested: Today, 2:00 PM</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 group-hover:shadow-md transition-shadow duration-300">
                        <p className="text-[10px] font-black tracking-wider text-amber-600 mb-2">MEDIUM PRIORITY</p>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">Introduce new Cardio product line</p>
                        <p className="text-xs text-slate-600 mt-2">Customer has history of ordering similar products</p>
                        <p className="text-xs text-slate-500 mt-2 font-medium">⏰ Suggested: This week</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                <div className="space-y-2">
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            onClick={action.onClick}
                            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-transparent rounded-lg transition-colors duration-200 cursor-pointer group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg w-6 text-center">{action.icon}</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">{action.label}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{action.count}</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-[10px] text-slate-300 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"></i>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call Script */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold shadow-inner">📋</span>
                    Call Script
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">Key talking points for this customer interaction</p>
            </div>

            {/* Interaction History */}
            <div className="flex-1 flex flex-col pb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Team Interactions</h3>
                <div className="space-y-2 flex-1">
                    {[
                        { name: 'rjsfh', team: 'Sales Team', time: '11/23/2025, 11:01:40 PM' },
                        { name: 'ad', team: 'Sales Team', time: '11/23/2025, 11:01:13 PM' },
                        { name: 'adfcdgfgv', team: 'Sales Team', time: '11/23/2025, 10:34:04 PM' },
                    ].map((item, index) => (
                        <div key={index} className="p-3 bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 cursor-pointer border border-slate-100 shadow-sm hover:shadow-md group">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-[10px]">
                                        {index + 1}
                                    </div>
                                    <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium group-hover:text-purple-500">{item.time.split(',')[0]}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 ml-8 uppercase tracking-wider">{item.team}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
