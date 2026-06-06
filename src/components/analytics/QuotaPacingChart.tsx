import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const QuotaPacingChart: React.FC = () => {
    const CURRENT_DAY = 20;
    const TOTAL_DAYS = 30;
    const TARGET = 500; // in K

    // Generate mock pacing data
    const generateData = () => {
        const data = [];
        let cumulative = 0;
        const dailyAvg = 16; // 16k a day
        
        for (let i = 1; i <= TOTAL_DAYS; i++) {
            if (i <= CURRENT_DAY) {
                // Actuals with some randomness
                cumulative += dailyAvg + (Math.random() * 8 - 4);
                data.push({ day: `Day ${i}`, actual: Math.round(cumulative), projected: null, target: Math.round((TARGET / TOTAL_DAYS) * i) });
            } else {
                // Future projections based on run-rate
                const runRate = cumulative / CURRENT_DAY;
                const projectedVal = cumulative + (runRate * (i - CURRENT_DAY));
                data.push({ day: `Day ${i}`, actual: null, projected: Math.round(projectedVal), target: Math.round((TARGET / TOTAL_DAYS) * i) });
            }
        }
        return data;
    };

    const data = React.useMemo(generateData, []);
    const currentRevenue = data[CURRENT_DAY - 1].actual as number;
    const projectedEnd = data[TOTAL_DAYS - 1].projected as number;
    const isProjectedToHit = projectedEnd >= TARGET;

    return (
        <div className="card-base p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Quota Pacing & Run-Rate
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Predictive AI</span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Current velocity vs end-of-month projections
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        ₹{currentRevenue}k <span className="text-sm text-slate-400 font-medium">/ ₹{TARGET}k</span>
                    </div>
                    <div className={`text-sm font-bold ${isProjectedToHit ? 'text-emerald-500' : 'text-amber-500'}`}>
                        Projected: ₹{projectedEnd}k
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} interval={4} />
                        <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}k`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            labelStyle={{ color: '#64748B', fontWeight: 'bold', marginBottom: '4px' }}
                            formatter={(value: any, name: any) => [`₹${value}k`, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <ReferenceLine y={TARGET} label={{ position: 'top', value: 'Target', fill: '#64748B', fontSize: 10, fontWeight: 'bold' }} stroke="#94A3B8" strokeDasharray="3 3" />
                        <ReferenceLine x={`Day ${CURRENT_DAY}`} stroke="#CBD5E1" />
                        
                        <Area type="monotone" dataKey="target" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                        <Area type="monotone" dataKey="actual" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                        <Area type="monotone" dataKey="projected" stroke="#F59E0B" strokeWidth={3} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorProjected)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Current Run Rate</div>
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{(currentRevenue / CURRENT_DAY).toFixed(1)}k <span className="text-xs text-slate-400">/day</span></div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                    <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-500 mb-1">Required Run Rate</div>
                    <div className="text-lg font-bold text-amber-700 dark:text-amber-400">₹{((TARGET - currentRevenue) / (TOTAL_DAYS - CURRENT_DAY)).toFixed(1)}k <span className="text-xs text-amber-500/70">/day</span></div>
                </div>
            </div>
        </div>
    );
};

export default QuotaPacingChart;
