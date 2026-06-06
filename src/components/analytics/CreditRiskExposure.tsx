import React, { useMemo } from 'react';
import { Customer } from '../../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';

interface CreditRiskExposureProps {
    customers: Customer[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white mb-2">{data.name}</p>
                <div className="space-y-1 text-sm">
                    <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Tier:</span> {data.tier}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Avg Monthly Revenue:</span> ₹{data.x.toLocaleString()}
                    </p>
                    <p className="text-red-600 dark:text-red-400">
                        <span className="font-medium">Outstanding:</span> ₹{data.y.toLocaleString()}
                    </p>
                    <p className="text-amber-600 dark:text-amber-400 font-bold mt-1">
                        Risk Ratio: {data.riskRatio.toFixed(1)}x
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const CreditRiskExposure: React.FC<CreditRiskExposureProps> = ({ customers }) => {
    const { openDetailModal } = useApp();

    const data = useMemo(() => {
        return customers
            .filter(c => c.outstandingBalance > 0 || c.avg6MoSales > 0)
            .map(c => ({
                id: c.id,
                name: c.firmName || c.name,
                tier: c.tier,
                x: c.avg6MoSales || 0,
                y: c.outstandingBalance || 0,
                riskRatio: c.avg6MoSales > 0 ? (c.outstandingBalance / c.avg6MoSales) : (c.outstandingBalance > 0 ? 10 : 0),
                customer: c
            }));
    }, [customers]);

    const highRiskCount = data.filter(d => d.riskRatio > 1.5).length;
    const totalOutstanding = data.reduce((sum, d) => sum + d.y, 0);
    const totalMRR = data.reduce((sum, d) => sum + d.x, 0);

    return (
        <div className="card-base p-6 bg-gradient-to-br from-orange-50/50 to-rose-50/50 dark:from-orange-900/10 dark:to-rose-900/10 border border-orange-100 dark:border-orange-900/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col xl:flex-row xl:items-start justify-between mb-8 gap-6 relative z-10">
                <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-500 shadow-inner">
                            <i className="fas fa-hand-holding-usd text-lg"></i>
                        </div>
                        Credit Risk & Exposure Analysis
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                        AI-assisted plotting of outstanding balances against average monthly revenue. Use this to identify clients who are over-leveraged compared to their historical purchasing power.
                    </p>
                </div>

                {/* Summary Metrics */}
                <div className="flex flex-wrap gap-3 shrink-0">
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm min-w-[140px]">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Exposure</div>
                        <div className="text-lg font-black text-rose-600 dark:text-rose-400">₹{(totalOutstanding / 100000).toFixed(2)}L</div>
                    </div>
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm min-w-[140px]">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total MRR Base</div>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{(totalMRR / 100000).toFixed(2)}L</div>
                    </div>
                    <div className="bg-orange-500 dark:bg-orange-600 p-3 rounded-xl shadow-md min-w-[140px] text-white">
                        <div className="text-[10px] font-bold text-orange-100 uppercase tracking-wider mb-1">High Risk Accounts</div>
                        <div className="text-lg font-black flex items-center gap-2">
                            {highRiskCount} <i className="fas fa-exclamation-circle text-sm opacity-80"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-[450px] w-full bg-white/40 dark:bg-gray-900/40 rounded-2xl p-4 border border-white/50 dark:border-gray-700/50 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Avg Monthly Revenue" 
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            stroke="#94a3b8"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Outstanding Balance" 
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            stroke="#94a3b8"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fontWeight: 500 }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                        <Scatter name="Clients" data={data} onClick={(dataPoint: any) => openDetailModal(dataPoint?.payload?.customer || dataPoint?.customer, 'invoices')}>
                            {data.map((entry, index) => {
                                let color = '#3b82f6'; // blue
                                let strokeColor = '#2563eb';
                                let radius = 60; // area
                                
                                if (entry.riskRatio > 1.5) {
                                    color = '#ef4444'; // red
                                    strokeColor = '#dc2626';
                                    radius = 120; // make high risk dots larger
                                }
                                else if (entry.riskRatio > 0.8) {
                                    color = '#f59e0b'; // orange
                                    strokeColor = '#d97706';
                                    radius = 80;
                                }
                                else if (entry.x > 50000 && entry.riskRatio < 0.2) {
                                    color = '#10b981'; // green
                                    strokeColor = '#059669';
                                    radius = 90;
                                }

                                return (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={color} 
                                        fillOpacity={0.7}
                                        stroke={strokeColor}
                                        strokeWidth={2}
                                        className="cursor-pointer hover:opacity-100 transition-opacity" 
                                    />
                                );
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            
            {/* Elegant Legend */}
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full border border-red-100 dark:border-red-900/30 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div> 
                    High Risk ({'>'}1.5x MRR)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full border border-orange-100 dark:border-orange-900/30 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-600"></div> 
                    Monitor (0.8 - 1.5x MRR)
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full border border-blue-100 dark:border-blue-900/30 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></div> 
                    Healthy
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-full border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div> 
                    Low Risk / High Volume
                </div>
            </div>
        </div>
    );
};

export default CreditRiskExposure;
