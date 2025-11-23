import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { analyzeChurnRisks, ChurnRiskData } from '../../utils/churnPrediction';
import { Customer } from '../../types';

const ChurnRiskDashboard: React.FC = () => {
    const { customers, getAllSales, remarks } = useApp();
    const [sales, setSales] = React.useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            const s = await getAllSales();
            setSales(s);
        };
        fetchData();
    }, [getAllSales]);

    const riskData = useMemo(() => {
        return analyzeChurnRisks(customers, sales, remarks);
    }, [customers, sales, remarks]);

    const highRiskCustomers = riskData.filter(r => r.riskLevel === 'High');
    const mediumRiskCustomers = riskData.filter(r => r.riskLevel === 'Medium');

    const totalRiskRevenue = highRiskCustomers.reduce((sum, r) => {
        const customer = customers.find(c => c.id === r.customerId);
        return sum + (customer?.avg6MoSales || 0);
    }, 0);

    const displayList = showAll ? highRiskCustomers : highRiskCustomers.slice(0, 5);

    if (highRiskCustomers.length === 0) {
        return (
            <div className="card-base p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-green-600 dark:text-green-200">
                        <i className="fas fa-check-circle text-2xl"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Low Churn Risk</h3>
                        <p className="text-green-700 dark:text-green-300">Great job! Your customer base looks healthy.</p>
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
