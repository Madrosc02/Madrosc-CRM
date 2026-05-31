import React from 'react';

const STAGES = [
    { id: 'prospects', name: 'Prospects', count: 1250, value: 2500, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', barColor: 'bg-indigo-200 dark:bg-indigo-800' },
    { id: 'qualified', name: 'Qualified', count: 850, value: 1800, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', barColor: 'bg-blue-300 dark:bg-blue-700' },
    { id: 'quoted', name: 'Quoted', count: 420, value: 1100, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300', barColor: 'bg-cyan-400 dark:bg-cyan-600' },
    { id: 'negotiation', name: 'Negotiation', count: 180, value: 650, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', barColor: 'bg-amber-400 dark:bg-amber-600' },
    { id: 'won', name: 'Closed Won', count: 85, value: 320, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', barColor: 'bg-emerald-500 dark:bg-emerald-500' }
];

const PipelineFunnel: React.FC = () => {
    const maxCount = STAGES[0].count;

    return (
        <div className="card-base p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Pipeline Velocity
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Warning</span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Conversion funnel and bottleneck analysis
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                    <i className="fas fa-filter text-lg"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
                {STAGES.map((stage, idx) => {
                    const widthPercent = (stage.count / maxCount) * 100;
                    const prevStage = idx > 0 ? STAGES[idx - 1] : null;
                    const conversionRate = prevStage ? ((stage.count / prevStage.count) * 100).toFixed(1) : null;

                    return (
                        <div key={stage.id} className="relative group">
                            {idx > 0 && (
                                <div className="absolute -top-4 right-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 pr-2">
                                    <i className="fas fa-level-down-alt mr-1"></i>
                                    {conversionRate}% conversion
                                </div>
                            )}
                            
                            <div className="flex items-center gap-4">
                                <div className={`w-32 py-2 px-3 rounded-lg text-xs font-bold ${stage.color} flex-shrink-0 text-center`}>
                                    {stage.name}
                                </div>
                                <div className="flex-1 h-12 relative flex items-center">
                                    <div 
                                        className={`absolute left-0 h-full ${stage.barColor} rounded-r-lg transition-all duration-700 ease-out flex items-center justify-end px-3`}
                                        style={{ width: `${widthPercent}%`, minWidth: '40px' }}
                                    >
                                        <span className={`text-xs font-bold ${idx === 4 ? 'text-white' : 'text-slate-700 dark:text-white'}`}>
                                            {stage.count}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-24 text-right flex-shrink-0">
                                    <div className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">
                                        ₹{stage.value}k
                                    </div>
                                    {stage.id === 'quoted' && (
                                        <div className="text-[10px] text-red-500 font-bold mt-0.5 animate-pulse">
                                            Bottleneck
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                <span className="font-medium text-slate-700 dark:text-slate-300">Insight:</span> The drop-off from <strong>Quoted</strong> to <strong>Negotiation</strong> (42.8%) is 15% higher than industry average. Focus on accelerating quoted deals.
            </div>
        </div>
    );
};

export default PipelineFunnel;
