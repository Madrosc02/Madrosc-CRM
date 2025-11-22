import React, { useState, useMemo } from 'react';
import { Sale } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const inputStyle = "block w-full px-3 py-2 rounded-md bg-card-bg-light dark:bg-card-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark transition-colors shadow-sm focus:outline-none focus:border-primary-light dark:focus:border-primary-dark focus:ring-2 focus:ring-primary-light/30 dark:focus:ring-primary-dark/30";

export const CustomerSales: React.FC<{ sales: Sale[] }> = ({ sales }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (saleDate < start) return false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (saleDate > end) return false;
            }
            return true;
        });
    }, [sales, startDate, endDate]);

    const chartData = useMemo(() => {
        const monthlySales: { [key: string]: number } = {};
        filteredSales.forEach(sale => {
            const monthYear = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlySales[monthYear] = (monthlySales[monthYear] || 0) + sale.amount;
        });
        return Object.entries(monthlySales).map(([name, amount]) => ({ name, amount })).reverse();
    }, [filteredSales]);

    return (
        <div>
            <div className="flex items-center gap-4 mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <label htmlFor="startDate" className="text-sm font-medium">From:</label>
                    <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyle} />
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="endDate" className="text-sm font-medium">To:</label>
                    <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyle} />
                </div>
            </div>
            <h4 className="font-semibold mb-2 text-lg">Sales Chart</h4>
            <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light, #dee2e6)" className="dark:stroke-[var(--border-dark)]" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Sales"]} />
                        <Legend />
                        <Bar dataKey="amount" fill="var(--primary-light, #0d6efd)" className="dark:fill-[var(--primary-dark)]" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h4 className="font-semibold mt-6 mb-2 text-lg">Transaction List</h4>
            <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {filteredSales.length > 0 ? filteredSales.map(sale => (
                    <li key={sale.id} className="flex justify-between p-2 bg-gray-50 dark:bg-white/5 rounded-md">
                        <span>{new Date(sale.date).toLocaleDateString()}</span>
                        <span className="font-mono font-semibold">₹{sale.amount.toLocaleString('en-IN')}</span>
                    </li>
                )) : <p className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] italic text-center py-4">No sales found for the selected period.</p>}
            </ul>
        </div>
    )
}
