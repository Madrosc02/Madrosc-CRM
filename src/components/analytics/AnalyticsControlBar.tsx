import React, { useState } from 'react';

interface AnalyticsControlBarProps {
    dateRange: { start: string, end: string };
    setDateRange: (range: { start: string, end: string }) => void;
    tierFilter: string;
    setTierFilter: (tier: string) => void;
    stateFilter: string;
    setStateFilter: (state: string) => void;
    availableStates: string[];
}

const AnalyticsControlBar: React.FC<AnalyticsControlBarProps> = ({
    dateRange,
    setDateRange,
    tierFilter,
    setTierFilter,
    stateFilter,
    setStateFilter,
    availableStates
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Ask Data AI Search */}
            <div className="relative w-full md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-sparkles text-indigo-500"></i>
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Ask your data... (e.g. 'Show top customers in May')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Global Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <input 
                        type="date" 
                        value={dateRange.start}
                        onChange={e => setDateRange({...dateRange, start: e.target.value})}
                        className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                        type="date" 
                        value={dateRange.end}
                        onChange={e => setDateRange({...dateRange, end: e.target.value})}
                        className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                    />
                </div>

                <select 
                    value={tierFilter}
                    onChange={e => setTierFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Tiers</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                </select>

                <select 
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none max-w-[150px]"
                >
                    <option value="all">All Regions</option>
                    {availableStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>

                <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" title="Export Dashboard">
                    <i className="fas fa-file-export"></i>
                </button>
            </div>
        </div>
    );
};

export default AnalyticsControlBar;
