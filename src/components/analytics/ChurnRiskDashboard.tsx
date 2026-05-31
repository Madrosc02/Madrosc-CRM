import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { analyzeChurnRisks, ChurnRiskData } from '../../utils/churnPrediction';
import { Customer, Sale } from '../../types';

interface ChurnRiskDashboardProps {
    sales: Sale[];
    loading?: boolean;
}

const ChurnRiskDashboard: React.FC<ChurnRiskDashboardProps> = ({ sales, loading }) => {
    const { customers, remarks } = useApp();
    const [showAll, setShowAll] = useState(false);

    const riskData = useMemo(() => {
        if (!customers || !sales || !remarks) return [];
        return analyzeChurnRisks(customers, sales, remarks);
    }, [customers, sales, remarks]);

    if (!riskData) return null;

    const highRiskCustomers = riskData.filter(r => r.riskLevel === 'High');
    // const mediumRiskCustomers = riskData.filter(r => r.riskLevel === 'Medium');

    const totalRiskRevenue = highRiskCustomers.reduce((sum, r) => {
        const customer = customers.find(c => c.id === r.customerId);
        return sum + (customer?.avg6MoSales || 0);
    }, 0);

    const displayList = showAll ? highRiskCustomers : highRiskCustomers.slice(0, 5);

    if (highRiskCustomers.length === 0) {
        return (
            <div className="card-base p-8 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 border-l-4 border-l-emerald-500 overflow-hidden relative group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all duration-500"></div>
                
                <div className="relative flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-800/50">
                        <i className="fas fa-shield-check text-3xl"></i>
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100 tracking-tight">Optimal Retention Health</h3>
                    <p className="text-emerald-700 dark:text-emerald-300 mt-2 max-w-md mx-auto text-sm">
                        Zero high-risk churn indicators detected across your entire active customer base. Engagement and purchasing frequency are stable.
                    </p>
                    
                    <div className="mt-6 flex gap-4">
                        <div className="px-4 py-2 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30">
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Active Accounts</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">{customers.filter(c => c.tier !== 'Dead').length}</div>
                        </div>
                        <div className="px-4 py-2 bg-white/60 dark:bg-gray-900/40 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30">
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Risk Status</div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white">Secure</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-base p-6 border-l-4 border-l-red-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-red-500"></i>
                        Churn Risk Alert
                    </h3>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">
                        <span className="font-bold text-red-500">{highRiskCustomers.length} High Risk</span> customers identified
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        Revenue at Risk (Monthly)
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹{(totalRiskRevenue / 1000).toFixed(1)}k
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {displayList.map((risk) => (
                    <div key={risk.customerId} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                                    {risk.customerName}
                                </h4>
                                <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                    Risk: {risk.riskScore}%
                                </span>
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400 mt-1 flex flex-wrap gap-2">
                                {risk.factors.map((factor, i) => (
                                    <span key={i} className="flex items-center gap-1">
                                        <i className="fas fa-circle text-[6px]"></i> {factor}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">Last Order</div>
                                <div className="text-sm font-medium text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                                    {risk.daysSinceLastOrder} days ago
                                </div>
                            </div>
                            <button className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
                                <i className="fas fa-phone-alt mr-1.5"></i> Recover
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {highRiskCustomers.length > 5 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full mt-4 py-2 text-sm text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:text-[var(--text-primary-light)] dark:hover:text-[var(--text-primary-dark)] transition-colors"
                >
                    {showAll ? 'Show Less' : `View All ${highRiskCustomers.length} At-Risk Customers`}
                </button>
            )}
        </div>
    );
};

export default ChurnRiskDashboard;
