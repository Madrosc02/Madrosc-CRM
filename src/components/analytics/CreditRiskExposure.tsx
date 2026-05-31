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

    // High risk = Outstanding is more than 1.5x their average monthly sales
    const highRiskCount = data.filter(d => d.riskRatio > 1.5).length;

    return (
        <div className="card-base p-6 border-l-4 border-l-orange-500 bg-white dark:bg-[#1e293b]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-hand-holding-usd text-orange-500"></i>
                        Credit Risk & Receivables Exposure
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyzing outstanding balances vs. average monthly revenue. 
                        <span className="font-bold text-orange-500 ml-1">{highRiskCount} High Risk</span> clients detected.
                    </p>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Avg Monthly Revenue" 
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            stroke="#64748b"
                        />
                        <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Outstanding Balance" 
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                            stroke="#64748b"
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Clients" data={data} onClick={(dataPoint) => openDetailModal(dataPoint.customer, 'invoices')}>
                            {data.map((entry, index) => {
                                // Color based on risk ratio
                                let color = '#3b82f6'; // blue (normal)
                                if (entry.riskRatio > 1.5) color = '#ef4444'; // red (high risk)
                                else if (entry.riskRatio > 0.8) color = '#f59e0b'; // orange (medium risk)
                                else if (entry.x > 50000 && entry.riskRatio < 0.2) color = '#10b981'; // green (great client)

                                return <Cell key={`cell-${index}`} fill={color} className="cursor-pointer hover:opacity-80 transition-opacity" />;
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 text-xs justify-center text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> High Risk ({'>'}1.5x MRR)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Medium Risk</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Normal</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Low Risk / High Value</div>
            </div>
        </div>
    );
};

export default CreditRiskExposure;
