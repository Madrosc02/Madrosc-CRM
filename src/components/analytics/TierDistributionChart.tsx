import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { CustomerTier } from '../../types';

const TierDistributionChart: React.FC = () => {
    const { customers } = useApp();

    const COLORS: Record<CustomerTier, string> = {
        Platinum: '#6366F1', // Indigo
        Gold: '#F59E0B',     // Amber
        Silver: '#94A3B8',   // Slate
        Bronze: '#D97706',   // Darker orange
        Dead: '#EF4444'      // Red
    };

    const data = useMemo(() => {
        const tierStats: Record<CustomerTier, { count: number; revenue: number }> = {
            Platinum: { count: 0, revenue: 0 },
            Gold: { count: 0, revenue: 0 },
            Silver: { count: 0, revenue: 0 },
            Bronze: { count: 0, revenue: 0 },
            Dead: { count: 0, revenue: 0 }
        };

        let totalRevenue = 0;

        customers.forEach(customer => {
            const tier = customer.tier || 'Bronze';
            tierStats[tier].count++;
            tierStats[tier].revenue += customer.salesThisMonth || 0;
            totalRevenue += customer.salesThisMonth || 0;
        });

        const chartData = (Object.keys(tierStats) as CustomerTier[]).map(tier => ({
            name: tier,
            value: tierStats[tier].count,
            revenue: tierStats[tier].revenue,
            percentRev: totalRevenue > 0 ? (tierStats[tier].revenue / totalRevenue) * 100 : 0
        })).filter(d => d.value > 0).sort((a, b) => b.revenue - a.revenue);

        return { chartData, totalRevenue };
    }, [customers]);
    
    return (
        <div className="flex flex-col">
            <div className="px-2 mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Client Tier Analysis</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Volume vs. Value contribution by segment</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                    <i className="fas fa-layer-group text-xl"></i>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-[350px]">
                {/* Left Side: Pie Chart (Volume) */}
                <div className="h-full relative flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider absolute top-4 left-6">Customer Count</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                stroke="none"
                            >
                                {data.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as CustomerTier]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                                formatter={(value: number) => [`${value} Customers`, 'Count']}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{customers.filter(c => c.tier !== 'Dead').length}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</span>
                    </div>
                </div>

                {/* Right Side: Revenue Bars (Value) */}
                <div className="h-full flex flex-col justify-center space-y-6">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Revenue Contribution</h4>
                        <div className="space-y-4">
                            {data.chartData.map((tier) => (
                                <div key={tier.name} className="flex flex-col gap-1">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[tier.name as CustomerTier] }}></div>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">{tier.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                                                ₹{(tier.revenue / 1000).toFixed(1)}k
                                            </span>
                                            <span className="text-xs text-slate-500 ml-2 font-medium">({tier.percentRev.toFixed(1)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ 
                                                width: `${tier.percentRev}%`, 
                                                backgroundColor: COLORS[tier.name as CustomerTier] 
                                            }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                        <span>{tier.value} clients</span>
                                        <span>AOV: ₹{tier.value > 0 ? Math.round(tier.revenue / tier.value).toLocaleString('en-IN') : 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TierDistributionChart;