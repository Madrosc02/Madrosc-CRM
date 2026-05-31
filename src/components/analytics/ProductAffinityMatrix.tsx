import React, { useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { scaleLinear } from 'd3-scale';

const CATEGORIES = ['Software Licenses', 'Hardware Solutions', 'Professional Services', 'Cloud Storage', 'Support Contracts'];

const ProductAffinityMatrix: React.FC = () => {
    const { customers } = useApp();

    const { matrixData, maxVal, states } = useMemo(() => {
        if (!customers || customers.length === 0) return { matrixData: {}, maxVal: 0, states: [] };

        const statesSet = new Set<string>();
        customers.forEach(c => {
            if (c.state) statesSet.add(c.state.trim());
        });
        const statesList = Array.from(statesSet).sort();

        // Generate deterministic mock data based on state name and category name
        const data: Record<string, Record<string, number>> = {};
        let maximum = 0;

        statesList.forEach(state => {
            data[state] = {};
            CATEGORIES.forEach(cat => {
                // hash string to create a consistent mock value
                const seed = state.length * cat.length + state.charCodeAt(0) + cat.charCodeAt(0);
                const val = (seed * 17) % 500; // Mock revenue value in thousands
                data[state][cat] = val;
                if (val > maximum) maximum = val;
            });
        });

        return { matrixData: data, maxVal: maximum, states: statesList };
    }, [customers]);

    const colorScale = scaleLinear<string>().domain([0, maxVal]).range(["#EFF6FF", "#1E3A8A"]); // Blue-50 to Blue-900

    if (states.length === 0) return null;

    return (
        <div className="card-base p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Regional Product Affinity
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Predictive</span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Identify which product categories perform best in specific regions to optimize localized marketing.
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500">
                    <i className="fas fa-th text-lg"></i>
                </div>
            </div>

            <div className="overflow-x-auto pb-4">
                <div className="inline-block min-w-full">
                    <div className="grid" style={{ gridTemplateColumns: `150px repeat(${CATEGORIES.length}, minmax(120px, 1fr))` }}>
                        {/* Header Row */}
                        <div className="p-3"></div> {/* Empty corner cell */}
                        {CATEGORIES.map(cat => (
                            <div key={cat} className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700">
                                {cat}
                            </div>
                        ))}

                        {/* Data Rows */}
                        {states.map(state => (
                            <React.Fragment key={state}>
                                <div className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 flex items-center">
                                    {state}
                                </div>
                                {CATEGORIES.map(cat => {
                                    const val = matrixData[state][cat];
                                    const bgColor = val > 0 ? colorScale(val) : 'transparent';
                                    const textColor = val > (maxVal * 0.6) ? 'text-white' : 'text-slate-700 dark:text-slate-200';
                                    
                                    return (
                                        <div key={`${state}-${cat}`} className="p-1 border-b border-r border-slate-100 dark:border-slate-800/50">
                                            <div 
                                                className={`w-full h-full min-h-[40px] rounded flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer ${textColor}`}
                                                style={{ backgroundColor: bgColor }}
                                                title={`${state} - ${cat}: ₹${val}k`}
                                            >
                                                <span className="font-mono text-sm font-bold">₹{val}k</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-4 flex items-center justify-end gap-3 text-xs text-slate-500">
                <span>Low Affinity</span>
                <div className="w-24 h-3 rounded bg-gradient-to-r from-blue-50 to-blue-800"></div>
                <span>High Affinity</span>
            </div>
        </div>
    );
};

export default ProductAffinityMatrix;
