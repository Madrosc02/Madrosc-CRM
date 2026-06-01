import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LOSS_REASONS = [
    { reason: 'Price too high', count: 42, color: '#F87171' },
    { reason: 'Missing Feature X', count: 28, color: '#FCA5A5' },
    { reason: 'Competitor A', count: 24, color: '#FECACA' },
    { reason: 'Poor Support', count: 12, color: '#FEE2E2' },
    { reason: 'Internal Budget Cut', count: 8, color: '#FEF2F2' }
];

const WinLossAnalysis: React.FC = () => {
    const totalLost = LOSS_REASONS.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="card-base p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Loss & Churn Drivers
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Primary reasons for closed-lost opportunities
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                    <i className="fas fa-heart-broken text-lg"></i>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={LOSS_REASONS} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="reason" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} width={120} />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value: any) => [`${value} Deals`, 'Count']}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fill: '#64748B', fontSize: 12, fontWeight: 'bold' }}>
                            {LOSS_REASONS.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Total Lost Deals:</span>
                <span className="font-bold text-red-500 text-lg">{totalLost}</span>
            </div>
        </div>
    );
};

export default WinLossAnalysis;
