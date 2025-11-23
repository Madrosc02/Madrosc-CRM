import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { analyzeRevenueOpportunities } from '../../utils/revenueAnalysis';

const RevenueOpportunityAnalyzer: React.FC = () => {
    const { customers } = useApp();

    const opportunities = useMemo(() => {
        if (!customers) return [];
        return analyzeRevenueOpportunities(customers);
    }, [customers]);

    const totalPotential = opportunities.reduce((sum, op) => sum + op.potentialRevenue, 0);

    if (opportunities.length === 0) return null;

    return (
        <div className="card-base p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-100 dark:border-indigo-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                        <i className="fas fa-lightbulb text-yellow-500"></i>
                        Revenue Opportunities
                    </h3>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">
                        Unlock <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{(totalPotential / 1000).toFixed(1)}k</span> in additional revenue
                    </p>
                </div>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    View All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.slice(0, 4).map((op) => (
                    <div key={op.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${op.type === 'tier-upgrade' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                    op.type === 'reactivation' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                }`}>
                                {op.type === 'tier-upgrade' ? 'Tier Upgrade' : op.type === 'reactivation' ? 'Reactivation' : 'Consistency'}
                            </span>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                +₹{(op.potentialRevenue / 1000).toFixed(1)}k
                            </span>
                        </div>
                        <h4 className="font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-1">
                            {op.title}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-3">
                            {op.description}
                        </p>
                        <button className="w-full py-1.5 text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                            {op.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RevenueOpportunityAnalyzer;
