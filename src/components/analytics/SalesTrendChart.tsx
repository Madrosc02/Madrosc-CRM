import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';

const SalesTrendChart: React.FC = () => {
    const { getAllSales } = useApp();
    const [sales, setSales] = React.useState<Sale[]>([]);

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await getAllSales();
            setSales(data);
        };
        fetchSales();
    }, [getAllSales]);

    const chartData = useMemo(() => {
        const last6Months: { [key: string]: number } = {};
        const today = new Date();

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            last6Months[monthName] = 0;
        }

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            // Check if sale is within last 6 months
            const diffTime = Math.abs(today.getTime() - saleDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 180) {
                const monthName = saleDate.toLocaleString('default', { month: 'short' });
                if (last6Months[monthName] !== undefined) {
                    last6Months[monthName] += sale.amount;
                }
            }
        });

        return Object.entries(last6Months).map(([name, value]) => ({ name, value }));
    }, [sales]);

    return (
        <div className="card-base p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">Sales Trend</h3>
                <span className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">Last 6 Months</span>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary-light)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary-light)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                backgroundColor: 'var(--surface-light)',
                                borderColor: 'var(--border-light)',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
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
