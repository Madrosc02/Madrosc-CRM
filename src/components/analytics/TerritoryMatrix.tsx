import React, { useMemo } from 'react';
import { Customer } from '../../types';

interface TerritoryMatrixProps {
    customers: Customer[];
}

const TrendSparkline: React.FC<{ data: number[] }> = ({ data }) => {
    // Simple inline SVG sparkline
    if (!data || data.length === 0) return <span>-</span>;
    const max = Math.max(...data) || 1;
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 40;
        const y = 20 - ((val - min) / range) * 20;
        return `${x},${y}`;
    }).join(' ');

    const isPositive = data[data.length - 1] >= data[0];

    return (
        <svg width="40" height="20" className="inline-block overflow-visible">
            <polyline 
                points={points} 
                fill="none" 
                stroke={isPositive ? '#10B981' : '#EF4444'} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
            />
        </svg>
    );
};

const TerritoryMatrix: React.FC<TerritoryMatrixProps> = ({ customers }) => {
    const stateData = useMemo(() => {
        const data: Record<string, { 
            revenue: number; 
            target: number; 
            customers: number; 
            totalOrders: number; 
            history: number[] 
        }> = {};
        
        customers.forEach(c => {
            const state = c.state || 'Unknown';
            if (!data[state]) {
                data[state] = { revenue: 0, target: 0, customers: 0, totalOrders: 0, history: [0,0,0,0,0,0] };
            }
            
            data[state].revenue += c.salesThisMonth || 0;
            // Mocking a target based on historical average
            data[state].target += (c.avg6MoSales || c.salesThisMonth || 0) * 1.1; 
            data[state].customers += 1;
            
            // Mocking history based on avg vs current for a sparkline
            const avg = c.avg6MoSales || 0;
            const current = c.salesThisMonth || 0;
            for(let i=0; i<6; i++) {
                // simple interpolation/randomization for demo
                const val = avg + (Math.random() - 0.5) * (avg * 0.2); 
                data[state].history[i] += (i === 5 ? current : Math.max(0, val));
            }
        });

        return Object.entries(data)
            .map(([state, metrics]) => ({ 
                state, 
                ...metrics,
                achievement: metrics.target > 0 ? (metrics.revenue / metrics.target) * 100 : 0,
                aov: metrics.customers > 0 ? metrics.revenue / metrics.customers : 0 // Simplified AOV
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [customers]);

    return (
        <div className="card-base flex flex-col h-[500px]">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                     Territory Performance Matrix
                 </h3>
                 <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                     Export CSV <i className="fas fa-download ml-1"></i>
                 </button>
             </div>
             <div className="overflow-y-auto flex-grow relative">
                <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-50/80 dark:bg-slate-800/80 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="p-4 text-left font-semibold text-slate-500 dark:text-slate-400">Territory (State)</th>
                            <th className="p-4 text-right font-semibold text-slate-500 dark:text-slate-400">Revenue (MTD)</th>
                            <th className="p-4 text-right font-semibold text-slate-500 dark:text-slate-400">Target %</th>
                            <th className="p-4 text-center font-semibold text-slate-500 dark:text-slate-400">Customers</th>
                            <th className="p-4 text-right font-semibold text-slate-500 dark:text-slate-400">Avg Value</th>
                            <th className="p-4 text-center font-semibold text-slate-500 dark:text-slate-400">6mo Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stateData.length > 0 ? stateData.map((row, idx) => (
                             <tr key={row.state} className="border-b border-gray-100 dark:border-gray-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                                    {row.state}
                                </td>
                                <td className="p-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                                    ₹{row.revenue.toLocaleString('en-IN')}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${row.achievement >= 100 ? 'bg-emerald-500' : row.achievement >= 80 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, row.achievement)}%` }}
                                            />
                                        </div>
                                        <span className={`font-mono text-xs ${row.achievement >= 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {row.achievement.toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                                    {row.customers}
                                </td>
                                <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-400">
                                    ₹{Math.round(row.aov).toLocaleString('en-IN')}
                                </td>
                                <td className="p-4 text-center">
                                    <TrendSparkline data={row.history} />
                                </td>
                             </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-slate-500">
                                    No territory data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TerritoryMatrix;
