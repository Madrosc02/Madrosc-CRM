// components/analytics/SalesByStateChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sale, Customer } from '../../types';
import Skeleton from '../ui/Skeleton';

const SalesByStateChart: React.FC = () => {
    const { customers, getAllSales, analyticsFilters } = useApp();
    const [allSales, setAllSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            const salesData = await getAllSales();
            setAllSales(salesData);
            setLoading(false);
        };
        fetchSales();
    }, [getAllSales]);

    const chartData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const salesInRange = allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const customerMap = new Map<string, Customer>(customers.map(c => [c.id, c]));
        const salesByState: { [key: string]: number } = {};

        salesInRange.forEach(sale => {
            const customer = customerMap.get(sale.customerId);
            if (customer) {
                salesByState[customer.state] = (salesByState[customer.state] || 0) + sale.amount;
            }
        });

        return Object.entries(salesByState)
            .map(([name, sales]) => ({ name, sales }))
            .filter(item => item.sales > 0)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 10); // Show top 10 states
    }, [customers, allSales, analyticsFilters.dateRange]);

    if (loading) {
        return (
            <div className="h-[400px]">
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-[calc(100%-2rem)] w-full" />
            </div>
        );
    }

    return (
        <div className="h-[400px]">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 px-2">Top States by Sales (Period)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                    <XAxis
                        type="number"
                        tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
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
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesByStateChart;