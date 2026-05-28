// components/analytics/OverallSalesTrendChart.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../ui/Skeleton';

const OverallSalesTrendChart: React.FC = () => {
    const { getAllSales, analyticsFilters } = useApp();
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const salesData = await getAllSales();
            setSales(salesData);
            setLoading(false);
        };
        fetchData();
    }, [getAllSales]);


    const chartData = useMemo(() => {
        const { start, end } = analyticsFilters.dateRange;
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);

        const salesInRange = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });
        
        const monthlySales: { [key: string]: number } = {};
        salesInRange.forEach(sale => {
            const date = new Date(sale.date);
            const monthYear = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            monthlySales[monthYear] = (monthlySales[monthYear] || 0) + sale.amount;
        });

        const sortedMonths = Object.keys(monthlySales).sort((a,b) => {
            const dateA = new Date(`01 ${a}`);
            const dateB = new Date(`01 ${b}`);
            return dateA.getTime() - dateB.getTime();
        });
        
        return sortedMonths.map(month => ({
            name: month,
            sales: monthlySales[month]
        }));
    }, [sales, analyticsFilters.dateRange]);
    
    if (loading) {
        return <div className="h-[400px]">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-full w-full" />
        </div>
    }

    return (
        <div className="h-[400px]">
             <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-4 px-2">Overall Sales Trend</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary-light, #3b82f6)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--primary-light, #3b82f6)" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light, rgba(200,200,200,0.2))" className="dark:stroke-[var(--border-dark)]" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `₹${Number(value)/1000}k`} 
                        dx={-10}
                    />
                    <Tooltip 
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]}
                        contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                        itemStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="var(--primary-light, #3b82f6)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OverallSalesTrendChart;