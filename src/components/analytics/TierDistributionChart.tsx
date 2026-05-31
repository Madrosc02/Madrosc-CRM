// components/analytics/TierDistributionChart.tsx
import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomerTier } from '../../types';

const TierDistributionChart: React.FC = () => {
    const { customers } = useApp();

    const COLORS: Record<CustomerTier, string> = {
        Platinum: '#e5e4e2',
        Gold: '#ffc107',
        Silver: '#6c757d',
        Bronze: '#fd7e14',
        Dead: '#0dcaf0'
    };

    const chartData = useMemo(() => {
        const tierCounts: Record<CustomerTier, number> = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0, Dead: 0 };
        customers.forEach(customer => {
            tierCounts[customer.tier]++;
        });
        return (Object.keys(tierCounts) as CustomerTier[]).map(tier => ({
            name: tier,
            value: tierCounts[tier]
        })).filter(d => d.value > 0);
    }, [customers]);
    
    return (
        <div className="h-[400px] flex flex-col relative">
            <div className="px-2 mb-2 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">Client Tier Distribution</h3>
                    <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-0.5">Value-based segmentation breakdown</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                    <i className="fas fa-layer-group"></i>
                </div>
            </div>
            
            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = 25 + innerRadius + (outerRadius - innerRadius);
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                    <text x={x} y={y} fill="var(--text-secondary-light)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold dark:fill-[var(--text-secondary-dark)]">
                                        {value} ({(percent * 100).toFixed(0)}%)
                                    </text>
                                );
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name as CustomerTier]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text for donut hole */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                    <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{customers.filter(c => c.tier !== 'Dead').length}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</span>
                </div>
            </div>
        </div>
    );
};

export default TierDistributionChart;