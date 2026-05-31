import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import { useApp } from '../../contexts/AppContext';
import StateProfileDrawer from './StateProfileDrawer';
import { Customer } from '../../types';

const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

const PROJECTION_CONFIG = {
    scale: 1000,
    center: [78.9629, 22.5937] as [number, number]
};

type MetricType = 'revenue' | 'customers' | 'growth';

const TerritoryHeatmap: React.FC = () => {
    const { customers } = useApp();
    const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const stateData = useMemo(() => {
        if (!customers) return {};

        const data: Record<string, { revenue: number; customerCount: number; prevRevenue: number; customers: Customer[] }> = {};

        customers.forEach(customer => {
            const state = customer.state?.trim() || 'Unknown';
            if (!data[state]) {
                data[state] = { revenue: 0, customerCount: 0, prevRevenue: 0, customers: [] };
            }
            data[state].revenue += customer.salesThisMonth || 0;
            data[state].prevRevenue += customer.avg6MoSales || 0;
            data[state].customerCount += 1;
            data[state].customers.push(customer);
        });

        return data;
    }, [customers]);

    const colorScale = useMemo(() => {
        let maxVal = 1;
        let minVal = 0;

        if (activeMetric === 'revenue') {
            maxVal = Math.max(...Object.values(stateData).map(d => d.revenue), 1000);
            return scaleLinear<string>().domain([0, maxVal]).range(["#E0E7FF", "#3730A3"]); // Indigo
        } else if (activeMetric === 'customers') {
            maxVal = Math.max(...Object.values(stateData).map(d => d.customerCount), 10);
            return scaleLinear<string>().domain([0, maxVal]).range(["#ECFEFF", "#0891B2"]); // Cyan
        } else {
            // Growth
            const growths = Object.values(stateData).map(d => d.prevRevenue > 0 ? ((d.revenue - d.prevRevenue)/d.prevRevenue)*100 : 0);
            maxVal = Math.max(...growths, 1);
            minVal = Math.min(...growths, -1);
            return scaleLinear<string>().domain([minVal, 0, maxVal]).range(["#FEF2F2", "#F3F4F6", "#059669"]); // Red-Gray-Emerald
        }
    }, [stateData, activeMetric]);

    const handleStateClick = (stateName: string) => {
        if (stateData[stateName]?.customerCount > 0) {
            setSelectedState(stateName);
            setIsDrawerOpen(true);
        }
    };

    return (
        <>
            <div className="card-base p-6 bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 flex flex-col h-[500px]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                            Territory Heatmap
                        </h3>
                        <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                            Geographic distribution of performance
                        </p>
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {(['revenue', 'customers', 'growth'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMetric(m)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeMetric === m ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 relative">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={PROJECTION_CONFIG}
                        className="w-full h-full outline-none"
                    >
                        <ZoomableGroup center={[78.9629, 22.5937]} zoom={1.2}>
                            <Geographies geography={INDIA_TOPO_JSON}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const stateName = geo.properties.NAME_1 || geo.properties.name;
                                        const cur = stateData[stateName] || stateData[stateName.toUpperCase()] || { revenue: 0, customerCount: 0, prevRevenue: 0, customers: [] };
                                        
                                        let val = 0;
                                        if (activeMetric === 'revenue') val = cur.revenue;
                                        else if (activeMetric === 'customers') val = cur.customerCount;
                                        else val = cur.prevRevenue > 0 ? ((cur.revenue - cur.prevRevenue)/cur.prevRevenue)*100 : 0;

                                        const hasData = cur.customerCount > 0;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={hasData ? colorScale(val) : "#F8FAFC"}
                                                stroke="#CBD5E1"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: hasData ? "#F59E0B" : "#F1F5F9", outline: "none", cursor: hasData ? "pointer" : "default" },
                                                    pressed: { outline: "none" },
                                                }}
                                                onClick={() => hasData && handleStateClick(stateName)}
                                                onMouseEnter={() => {
                                                    if(hasData) setHoveredState(stateName);
                                                }}
                                                onMouseLeave={() => setHoveredState(null)}
                                                data-tooltip-id="map-tooltip"
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                    
                    <Tooltip 
                        id="map-tooltip" 
                        isOpen={!!hoveredState}
                        className="!bg-slate-900/95 !backdrop-blur-md !p-4 !rounded-xl !shadow-2xl z-50 !border !border-slate-700/50"
                    >
                        {hoveredState && stateData[hoveredState] && (
                            <div className="min-w-[150px]">
                                <h4 className="font-bold text-white mb-2 pb-2 border-b border-slate-700/50">{hoveredState}</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Revenue</span>
                                        <span className="font-mono text-emerald-400 font-medium">₹{(stateData[hoveredState].revenue / 1000).toFixed(1)}k</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Customers</span>
                                        <span className="font-mono text-white font-medium">{stateData[hoveredState].customerCount}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Growth</span>
                                        <span className="font-mono text-white font-medium">
                                            {(() => {
                                                const p = stateData[hoveredState].prevRevenue;
                                                const c = stateData[hoveredState].revenue;
                                                if (p === 0) return 'N/A';
                                                const g = ((c - p)/p)*100;
                                                return <span className={g >= 0 ? 'text-emerald-400' : 'text-red-400'}>{g>0?'+':''}{g.toFixed(1)}%</span>;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Tooltip>
                </div>
            </div>

            <StateProfileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                stateName={selectedState}
                customers={selectedState ? (stateData[selectedState]?.customers || []) : []}
            />
        </>
    );
};

export default TerritoryHeatmap;
