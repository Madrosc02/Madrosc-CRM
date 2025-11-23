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

const CohortAnalysis: React.FC = () => {
    const { getAllSales } = useApp();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<'retention' | 'revenue'>('retention');

    useEffect(() => {
        const loadSales = async () => {
            try {
                const data = await getAllSales();
                setSales(data);
            } catch (error) {
                console.error("Failed to load sales for cohort analysis", error);
            } finally {
                setLoading(false);
            }
        };
        loadSales();
    }, [getAllSales]);

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
        // Sort cohorts descending (newest first) or ascending? Usually descending.
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
                    revenue.push(activity.revenue / cohortSize); // Revenue per user (ARPU) or Total? Let's do ARPU for heatmap comparison
                } else {
                    retention.push(0);
                    revenue.push(0);
                }
            }
            result.push({ cohort: cohortMonth, size: cohortSize, retention, revenue });
        });

        return result;
    }, [sales]);

    // Color scales
    const retentionColor = scaleLinear<string>()
        .domain([0, 100])
        .range(["#ffffff", "#4f46e5"]); // White to Indigo

    const revenueColor = useMemo(() => {
        const maxRev = Math.max(...cohorts.flatMap(c => c.revenue), 100);
        return scaleLinear<string>()
            .domain([0, maxRev])
            .range(["#ffffff", "#10b981"]); // White to Emerald
    }, [cohorts]);

    if (loading) return <div className="h-64 flex items-center justify-center">Loading analysis...</div>;
    if (cohorts.length === 0) return null;

    return (
        <div className="card-base p-6 bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                        Cohort Analysis
                    </h3>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                        Customer retention over time
                    </p>
                </div>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                        onClick={() => setMode('retention')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'retention'
                                ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-indigo-300'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        Retention
                    </button>
                    <button
                        onClick={() => setMode('revenue')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'revenue'
                                ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600 dark:text-green-300'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        Revenue (ARPU)
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr>
                            <th className="text-left py-2 px-2 font-semibold text-gray-500 w-24">Cohort</th>
                            <th className="text-left py-2 px-2 font-semibold text-gray-500 w-16">Users</th>
                            {[...Array(12)].map((_, i) => (
                                <th key={i} className="text-center py-2 px-1 font-semibold text-gray-500">M{i}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {cohorts.map((row) => (
                            <tr key={row.cohort} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                <td className="py-2 px-2 font-medium text-gray-700 dark:text-gray-300">{row.cohort}</td>
                                <td className="py-2 px-2 text-gray-500">{row.size}</td>
                                {row.retention.map((val, i) => {
                                    const isFuture = false; // Ideally check if cohort month + i > current month
                                    // Simple check: if val is 0 and it's a recent cohort, it might be future. 
                                    // For now, just render.

                                    const displayVal = mode === 'retention' ? `${val.toFixed(0)}%` : `₹${row.revenue[i].toFixed(0)}`;
                                    const bg = mode === 'retention' ? retentionColor(val) : revenueColor(row.revenue[i]);
                                    const opacity = val === 0 ? 0 : 0.2 + (val / (mode === 'retention' ? 100 : 1000)) * 0.8; // Simple opacity logic

                                    // Better color logic:
                                    // Use the scale directly for background, but need to handle text contrast.
                                    // Let's use simple inline style for bg color

                                    return (
                                        <td key={i} className="p-0.5">
                                            <div
                                                className="w-full h-8 flex items-center justify-center rounded text-[10px]"
                                                style={{
                                                    backgroundColor: bg,
                                                    color: (mode === 'retention' ? val > 50 : row.revenue[i] > 500) ? 'white' : 'black'
                                                }}
                                                title={mode === 'retention' ? `${val.toFixed(1)}% Retention` : `₹${row.revenue[i].toFixed(0)} ARPU`}
                                            >
                                                {val > 0 ? displayVal : '-'}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CohortAnalysis;
