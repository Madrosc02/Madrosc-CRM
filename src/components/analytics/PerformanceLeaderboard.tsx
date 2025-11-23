import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Customer } from '../../types';

type LeaderboardType = 'revenue' | 'growth' | 'frequency';

const PerformanceLeaderboard: React.FC = () => {
    const { customers } = useApp();
    const [activeTab, setActiveTab] = useState<LeaderboardType>('revenue');

    const sortedCustomers = useMemo(() => {
        if (!customers) return [];

        let sorted = [...customers];

        switch (activeTab) {
            case 'revenue':
                // Rank by 6-month average sales (or salesThisMonth if preferred, but avg is more stable)
                sorted.sort((a, b) => b.avg6MoSales - a.avg6MoSales);
                break;
            case 'growth':
                // Rank by growth (Sales This Month vs Avg)
                sorted.sort((a, b) => {
                    const growthA = a.avg6MoSales > 0 ? (a.salesThisMonth - a.avg6MoSales) / a.avg6MoSales : 0;
                    const growthB = b.avg6MoSales > 0 ? (b.salesThisMonth - b.avg6MoSales) / b.avg6MoSales : 0;
                    return growthB - growthA;
                });
                break;
            case 'frequency':
                // Rank by frequency (using daysSinceLastOrder as proxy for recency/frequency inverse, 
                // but ideally we need order count. For now, let's use Sales This Month as a proxy for activity 
                // or just stick to revenue/growth if we lack frequency data. 
                // Actually, we have `salesThisMonth`. Let's use that for "Active Now".)
                sorted.sort((a, b) => b.salesThisMonth - a.salesThisMonth);
                break;
        }

        return sorted.slice(0, 5);
    }, [customers, activeTab]);

    const getMetricDisplay = (customer: Customer, type: LeaderboardType) => {
        switch (type) {
            case 'revenue':
                return `₹${(customer.avg6MoSales / 1000).toFixed(1)}k / mo`;
            case 'growth':
                const growth = customer.avg6MoSales > 0
                    ? ((customer.salesThisMonth - customer.avg6MoSales) / customer.avg6MoSales) * 100
                    : 0;
                return (
                    <span className={growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                    </span>
                );
            case 'frequency':
                return `₹${(customer.salesThisMonth / 1000).toFixed(1)}k this month`;
        }
    };

    return (
        <div className="card-base bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                    <i className="fas fa-trophy text-yellow-500"></i>
                    Top Performers
                </h3>
                <div className="flex gap-2 mt-4">
                    {(['revenue', 'growth', 'frequency'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${activeTab === tab
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {sortedCustomers.map((customer, index) => (
                    <div key={customer.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors group">
                        <div className={`
                            w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm mr-3
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                index === 1 ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                                    index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                        'text-gray-400 dark:text-gray-500'}
                        `}>
                            {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] truncate">
                                {customer.firmName || customer.name}
                            </p>
                            <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] truncate">
                                {customer.district}, {customer.state}
                            </p>
                        </div>

                        <div className="text-right font-medium text-sm text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                            {getMetricDisplay(customer, activeTab)}
                        </div>
                    </div>
                ))}

                {sortedCustomers.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No data available
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformanceLeaderboard;
