import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';

type DatePreset = '7d' | '1m' | '3m' | '6m' | '1y' | 'custom';

const SalesTrendChart: React.FC = () => {
    const { getAllSales } = useApp();
    const [sales, setSales] = React.useState<Sale[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<DatePreset>('6m');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await getAllSales();
            setSales(data);
        };
        fetchSales();
    }, [getAllSales]);

    const getDateRange = (): { start: Date; end: Date } => {
        const end = new Date();
        let start = new Date();

        if (selectedPreset === 'custom' && customStartDate && customEndDate) {
            return {
                start: new Date(customStartDate),
                end: new Date(customEndDate)
            };
        }

        switch (selectedPreset) {
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '1m':
                start.setMonth(end.getMonth() - 1);
                break;
            case '3m':
                start.setMonth(end.getMonth() - 3);
                break;
            case '6m':
                start.setMonth(end.getMonth() - 6);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
        }

        return { start, end };
    };

    const chartData = useMemo(() => {
        const { start, end } = getDateRange();
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determine aggregation level
        let aggregation: 'daily' | 'weekly' | 'monthly' = 'monthly';
        if (diffDays <= 30) aggregation = 'daily';
        else if (diffDays <= 90) aggregation = 'weekly';

        const dataMap: { [key: string]: number } = {};

        // Initialize periods
        if (aggregation === 'monthly') {
            const months = Math.ceil(diffDays / 30);
            for (let i = months - 1; i >= 0; i--) {
                const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
                const monthName = d.toLocaleString('default', { month: 'short' });
                dataMap[monthName] = 0;
            }
        } else if (aggregation === 'weekly') {
            const weeks = Math.ceil(diffDays / 7);
            for (let i = weeks - 1; i >= 0; i--) {
                const d = new Date(end);
                d.setDate(d.getDate() - (i * 7));
                const weekLabel = `Week ${weeks - i}`;
                dataMap[weekLabel] = 0;
            }
        } else {
            // Daily
            for (let i = diffDays - 1; i >= 0; i--) {
                const d = new Date(end);
                d.setDate(d.getDate() - i);
                const dayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dataMap[dayLabel] = 0;
            }
        }

        // Aggregate sales
        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            if (saleDate >= start && saleDate <= end) {
                let key: string;
                if (aggregation === 'monthly') {
                    key = saleDate.toLocaleString('default', { month: 'short' });
                } else if (aggregation === 'weekly') {
                    const weeksDiff = Math.floor((end.getTime() - saleDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                    const totalWeeks = Math.ceil(diffDays / 7);
                    key = `Week ${totalWeeks - weeksDiff}`;
                } else {
                    key = saleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }

                if (dataMap[key] !== undefined) {
                    dataMap[key] += sale.amount;
                }
            }
        });

        return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
    }, [sales, selectedPreset, customStartDate, customEndDate]);

    const presetButtons: { label: string; value: DatePreset }[] = [
        { label: '7 Days', value: '7d' },
        { label: '1 Month', value: '1m' },
        { label: '3 Months', value: '3m' },
        { label: '6 Months', value: '6m' },
        { label: '1 Year', value: '1y' },
        { label: 'Custom', value: 'custom' },
    ];

    return (
        <div className="card-base p-6 h-full">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">Sales Trend</h3>
                </div>

                {/* Date Range Selector */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-2">
                        {presetButtons.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setSelectedPreset(value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${selectedPreset === value
                                    ? 'bg-[var(--primary-light)] text-white dark:bg-[var(--primary-dark)]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Inputs */}
                    {selectedPreset === 'custom' && (
                        <div className="flex gap-2 items-center">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <span className="text-xs text-gray-500">to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'var(--bg-surface)',
                                borderColor: 'var(--border-color)',
                                color: 'var(--text-primary)',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                            ))}
                        </Bar>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SalesTrendChart;
