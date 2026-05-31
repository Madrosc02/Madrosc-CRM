import React, { useMemo } from 'react';
import { Customer } from '../../types';

interface StateLeaderboardProps {
    customers: Customer[];
}

const StateLeaderboard: React.FC<StateLeaderboardProps> = ({ customers }) => {
    const stateData = useMemo(() => {
        const data: Record<string, { revenue: number; customers: number; growth: number; prevRevenue: number }> = {};
        
        customers.forEach(c => {
            const state = c.state || 'Unknown';
            if (!data[state]) {
                data[state] = { revenue: 0, customers: 0, growth: 0, prevRevenue: 0 };
            }
            data[state].revenue += c.salesThisMonth || 0;
            data[state].prevRevenue += c.avg6MoSales || 0;
            data[state].customers += 1;
        });

        Object.keys(data).forEach(state => {
            const current = data[state].revenue;
            const prev = data[state].prevRevenue;
            data[state].growth = prev > 0 ? ((current - prev) / prev) * 100 : 0;
        });

        const sortedData = Object.entries(data)
            .map(([state, metrics]) => ({ state, ...metrics }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Top 5
            
        // Calculate max revenue for progress bars
        const maxRev = sortedData.length > 0 ? sortedData[0].revenue : 1;
        
        return sortedData.map(d => ({ ...d, percentOfMax: (d.revenue / maxRev) * 100 }));
    }, [customers]);

    return (
        <div className="card-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col h-[550px] shadow-sm relative overflow-hidden group">
            {/* Subtle background glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-1000"></div>
            
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Top Performing States
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Regional revenue leaders</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                    <i className="fas fa-trophy"></i>
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center space-y-3 z-10 overflow-y-auto">
                {stateData.map((data, index) => (
                    <div
                        key={data.state}
                        className="relative p-4 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-md hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-300 transform hover:-translate-y-0.5 cursor-default overflow-hidden group/item"
                    >
                        {/* Background Progress Bar */}
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-slate-50 dark:bg-slate-800/30 -z-10 transition-all duration-1000 ease-out border-r border-slate-100 dark:border-slate-700/50"
                            style={{ width: `${data.percentOfMax}%` }}
                        ></div>

                        <div className="flex items-center">
                            <div className={`
                                w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm mr-4 shadow-sm transition-transform duration-300 group-hover/item:scale-110
                                ${index === 0 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900 border border-amber-300' :
                                    index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border border-slate-300' :
                                        index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900 border border-orange-300' :
                                            'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}
                            `}>
                                #{index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {data.state}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 font-medium mt-0.5">
                                    <i className="fas fa-users text-[10px]"></i> {data.customers} Active
                                </p>
                            </div>

                            <div className="text-right flex flex-col items-end justify-center">
                                 <div className="font-mono font-black text-lg text-slate-800 dark:text-slate-100">
                                    ₹{(data.revenue / 1000).toFixed(1)}k
                                 </div>
                                 <div className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 flex items-center gap-1 ${data.growth >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                     {data.growth >= 0 ? <i className="fas fa-arrow-up text-[10px]"></i> : <i className="fas fa-arrow-down text-[10px]"></i>}
                                     {Math.abs(data.growth).toFixed(1)}%
                                 </div>
                            </div>
                        </div>
                    </div>
                ))}

                {stateData.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                        <i className="fas fa-inbox text-3xl mb-3 opacity-50"></i>
                        <span className="text-sm font-medium">No territory data available</span>
                    </div>
                )}
            </div>
            
            {stateData.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 z-10 text-center">
                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 w-full">
                        View Complete Rankings <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
};

export default StateLeaderboard;
