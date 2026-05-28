// components/analytics/SalesByStateChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sale, Customer } from '../../types';
import Skeleton from '../ui/Skeleton';

const SalesByStateChart: React.FC = () => {
    const { customers, getAllSales, analyticsFilters, setSearchQuery, searchQuery } = useApp();
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

    const handleBarClick = (data: any) => {
        if (searchQuery === data.name) {
            setSearchQuery('');
        } else {
            setSearchQuery(data.name);
        }
    };

    return (
        <div className="h-[400px]">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Top States by Sales</h3>
                {searchQuery && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setSearchQuery('')}>
                        Filtering by: {searchQuery} <i className="fas fa-times ml-1"></i>
                    </span>
                )}
            </div>
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
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            borderColor: 'transparent',
                            color: '#1f2937',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}
                    />
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                    </defs>
                    <Bar 
                        dataKey="sales" 
                        fill="url(#barGradient)" 
                        radius={[0, 4, 4, 0]} 
                        barSize={20} 
                        onClick={handleBarClick}
                        cursor="pointer"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesByStateChart;