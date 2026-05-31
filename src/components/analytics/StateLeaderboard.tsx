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

        return Object.entries(data)
            .map(([state, metrics]) => ({ state, ...metrics }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Top 5
    }, [customers]);

    return (
        <div className="card-base bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                    <i className="fas fa-map-marker-alt text-indigo-500"></i>
                    Top Performing States
                </h3>
            </div>

            <div className="flex-1 p-2 flex flex-col justify-center">
                {stateData.map((data, index) => (
                    <div
                        key={data.state}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors group"
                    >
                        <div className={`
                            w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-4
                            ${index === 0 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                index === 1 ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-800/30 dark:text-indigo-300' :
                                    index === 2 ? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                        'text-gray-400 dark:text-gray-500'}
                        `}>
                            {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] truncate">
                                {data.state}
                            </p>
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] truncate">
                                {data.customers} active customers
                            </p>
                        </div>

                        <div className="text-right">
                             <div className="font-bold text-sm text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                                ₹{(data.revenue / 1000).toFixed(1)}k
                             </div>
                             <div className={`text-xs font-semibold ${data.growth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                 {data.growth > 0 ? '+' : ''}{data.growth.toFixed(1)}%
                             </div>
                        </div>
                    </div>
                ))}

                {stateData.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No territory data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default StateLeaderboard;
