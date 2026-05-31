import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';
import { scaleLinear } from 'd3-scale';

interface CohortData {
    cohort: string; // "YYYY-MM"
    size: number;
    retention: number[]; // [Month 0 %, Month 1 %, ...]
    revenue: number[]; // [Month 0 $, Month 1 $, ...]
}

interface CohortAnalysisProps {
    sales: Sale[];
    loading?: boolean;
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({ sales, loading: externalLoading }) => {
    const { getAllSales } = useApp();
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'retention' | 'revenue'>('retention');

    const cohorts = useMemo(() => {
        if (sales.length === 0) return [];

        // 1. Determine Acquisition Date for each customer
        const customerAcquisition: Record<string, string> = {}; // customerId -> "YYYY-MM"

        // Sort sales by date asc
        const sortedSales = [...sales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedSales.forEach(sale => {
            if (!customerAcquisition[sale.customerId]) {
                const date = new Date(sale.date);
                customerAcquisition[sale.customerId] = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
        });

        // 2. Group sales into Cohort Buckets
        // Map<CohortMonth, Map<MonthIndex, Set<CustomerId> | TotalRevenue>>
        const cohortMap = new Map<string, {
            size: Set<string>,
            activity: Map<number, { activeCustomers: Set<string>, revenue: number }>
        }>();

        sortedSales.forEach(sale => {
            const customerId = sale.customerId;
            const acquisitionMonthStr = customerAcquisition[customerId];
            if (!acquisitionMonthStr) return;

            if (!cohortMap.has(acquisitionMonthStr)) {
                cohortMap.set(acquisitionMonthStr, { size: new Set(), activity: new Map() });
            }

            const cohort = cohortMap.get(acquisitionMonthStr)!;
            cohort.size.add(customerId);

            // Calculate month difference
            const acquisitionDate = new Date(acquisitionMonthStr + "-01");
            const saleDate = new Date(sale.date);

            // Difference in months
            const monthDiff = (saleDate.getFullYear() - acquisitionDate.getFullYear()) * 12 + (saleDate.getMonth() - acquisitionDate.getMonth());

            if (monthDiff >= 0 && monthDiff <= 11) { // Limit to 12 months for display
                if (!cohort.activity.has(monthDiff)) {
                    cohort.activity.set(monthDiff, { activeCustomers: new Set(), revenue: 0 });
                }
                const monthActivity = cohort.activity.get(monthDiff)!;
                monthActivity.activeCustomers.add(customerId);
                monthActivity.revenue += sale.amount;
            }
        });

        // 3. Format for display
        const result: CohortData[] = [];
        const sortedCohorts = Array.from(cohortMap.keys()).sort().reverse().slice(0, 12); // Last 12 cohorts

        sortedCohorts.forEach(cohortMonth => {
            const data = cohortMap.get(cohortMonth)!;
            const cohortSize = data.size.size;
            const retention: number[] = [];
            const revenue: number[] = [];

            for (let i = 0; i < 12; i++) {
                const activity = data.activity.get(i);
                if (activity) {
                    retention.push((activity.activeCustomers.size / cohortSize) * 100);
                    revenue.push(activity.revenue / cohortSize);
                } else {
                    retention.push(0);
                    revenue.push(0);
                }
            }
            result.push({ cohort: cohortMonth, size: cohortSize, retention, revenue });
        });

        return result;
    }, [sales]);

    // Better color mapping functions using rgba for easy opacity handling
    const getRetentionColor = (val: number, isDark: boolean) => {
        if (val === 0) return isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)';
        // Map 1-100 to 0.1-1.0 opacity on a rich indigo base
        const opacity = 0.1 + (val / 100) * 0.9;
        return `rgba(79, 70, 229, ${opacity})`;
    };

    const getRevenueColor = (val: number, maxRev: number, isDark: boolean) => {
        if (val === 0 || maxRev === 0) return isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)';
        const opacity = 0.1 + (val / maxRev) * 0.9;
        return `rgba(16, 185, 129, ${opacity})`; // Emerald
    };

    const maxRevenue = useMemo(() => Math.max(...cohorts.flatMap(c => c.revenue), 1), [cohorts]);

    if (loading || externalLoading) return <div className="h-64 flex items-center justify-center">Loading analysis...</div>;
    if (cohorts.length === 0) return null;

    // Detect dark mode roughly for rendering raw colors if needed
    // Assuming standard implementation where dark mode relies on a 'dark' class on HTML
    const isDark = document.documentElement.classList.contains('dark');

    return (
        <div className="card-base p-6 border-t-4 border-t-indigo-500 bg-white dark:bg-[#1e293b]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <i className="fas fa-layer-group"></i>
                        </div>
                        Customer Cohort Matrix
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-10">
                        Track long-term retention & lifetime value across monthly acquisition groups.
                    </p>
                </div>
                <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setMode('retention')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${mode === 'retention'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-600'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <i className="fas fa-users"></i> Retention
                    </button>
                    <button
                        onClick={() => setMode('revenue')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${mode === 'revenue'
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-600'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <i className="fas fa-rupee-sign"></i> Revenue (ARPU)
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2">
                <table className="w-full text-xs text-left border-separate" style={{ borderSpacing: '2px' }}>
                    <thead>
                        <tr>
                            <th className="py-3 px-3 font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-24">Cohort</th>
                            <th className="py-3 px-3 font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider w-16 text-center">Size</th>
                            {[...Array(12)].map((_, i) => (
                                <th key={i} className="py-3 px-1 font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider">
                                    Month {i}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cohorts.map((row) => (
                            <tr key={row.cohort} className="group">
                                <td className="py-2 px-3 font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/50 rounded-l-md border border-gray-100 dark:border-gray-800 border-r-0">
                                    {new Date(row.cohort + "-01").toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-2 px-3 text-center font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 border-x-0">
                                    <div className="flex items-center justify-center gap-1">
                                        <i className="fas fa-user text-[10px] opacity-50"></i>
                                        {row.size}
                                    </div>
                                </td>
                                {row.retention.map((val, i) => {
                                    const displayVal = mode === 'retention' ? `${val.toFixed(0)}%` : `₹${(row.revenue[i] / 1000).toFixed(1)}k`;
                                    const bg = mode === 'retention' ? getRetentionColor(val, isDark) : getRevenueColor(row.revenue[i], maxRevenue, isDark);
                                    const textColor = (mode === 'retention' ? val > 45 : (row.revenue[i] / maxRevenue) > 0.45) ? 'text-white' : 'text-gray-700 dark:text-gray-300';
                                    
                                    // Make Month 0 slightly special if it's 100% retention
                                    const isM0 = i === 0 && mode === 'retention';

                                    return (
                                        <td key={i} className="p-0.5">
                                            <div
                                                className={`w-full h-10 flex items-center justify-center rounded-md font-bold text-[11px] transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default ${textColor} ${isM0 ? 'ring-1 ring-inset ring-black/10 dark:ring-white/10' : ''}`}
                                                style={{ backgroundColor: bg }}
                                                title={mode === 'retention' ? `${val.toFixed(1)}% Retention in Month ${i}` : `₹${row.revenue[i].toLocaleString()} ARPU in Month ${i}`}
                                            >
                                                {val > 0 ? displayVal : <span className="opacity-30">-</span>}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex items-center justify-end gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium mr-2">Intensity:</span>
                <span>Low</span>
                <div className="flex h-3 w-32 rounded overflow-hidden">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: mode === 'retention' ? `rgba(79, 70, 229, ${op})` : `rgba(16, 185, 129, ${op})` }}></div>
                    ))}
                </div>
                <span>High</span>
            </div>
        </div>
    );
};

export default CohortAnalysis;
