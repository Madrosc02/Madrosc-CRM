import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from 'react-simple-maps';
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

type MetricType = 'revenue' | 'customers' | 'growth' | 'whitespace';

// Consistent mock random generator based on state name
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
};

// Map of coordinates for major Indian states to place markers
const STATE_CENTERS: Record<string, [number, number]> = {
    "Maharashtra": [76.0, 19.5],
    "Karnataka": [76.5, 14.5],
    "Delhi": [77.2, 28.6],
    "Gujarat": [71.5, 22.5],
    "Tamil Nadu": [79.0, 11.0],
    "Uttar Pradesh": [80.5, 27.0],
    "West Bengal": [88.0, 23.5],
    "Telangana": [79.0, 17.5],
    "Haryana": [76.0, 29.0],
    "Rajasthan": [73.5, 26.5]
};

const TerritoryHeatmap: React.FC = () => {
    const { customers } = useApp();
    const [activeMetric, setActiveMetric] = useState<MetricType>('revenue');
    const [hoveredState, setHoveredState] = useState<string | null>(null);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const stateData = useMemo(() => {
        if (!customers) return {};

        const data: Record<string, { revenue: number; customerCount: number; prevRevenue: number; customers: Customer[]; totalProspects: number; penetration: number; hasAlert: boolean; alertMsg: string }> = {};

        customers.forEach(customer => {
            const state = customer.state?.trim() || 'Unknown';
            if (!data[state]) {
                data[state] = { revenue: 0, customerCount: 0, prevRevenue: 0, customers: [], totalProspects: 0, penetration: 0, hasAlert: false, alertMsg: '' };
            }
            data[state].revenue += customer.salesThisMonth || 0;
            data[state].prevRevenue += customer.avg6MoSales || 0; // Using avg as prev for mock
            data[state].customerCount += 1;
            data[state].customers.push(customer);
        });

        // Calculate prospects and alerts
        Object.keys(data).forEach(state => {
            const d = data[state];
            // Mock total prospects (e.g., active + some random based on state name)
            d.totalProspects = d.customerCount + (hashString(state) % 80) + 10;
            d.penetration = (d.customerCount / d.totalProspects) * 100;

            const growth = d.prevRevenue > 0 ? ((d.revenue - d.prevRevenue) / d.prevRevenue) * 100 : 0;
            
            // Smart Alerts Logic
            if (growth < -15) {
                d.hasAlert = true;
                d.alertMsg = `Revenue dropped by ${Math.abs(growth).toFixed(1)}%. Check account health.`;
            } else if (d.penetration < 10 && d.totalProspects > 50) {
                d.hasAlert = true;
                d.alertMsg = `High whitespace: ${d.totalProspects - d.customerCount} untapped prospects.`;
            }
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
        } else if (activeMetric === 'whitespace') {
            // High whitespace (low penetration) = red/orange, high penetration = blue
            maxVal = Math.max(...Object.values(stateData).map(d => d.penetration), 100);
            return scaleLinear<string>().domain([0, 50, 100]).range(["#FEF2F2", "#FCA5A5", "#EFF6FF"]); 
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
            <div className="card-base p-6 bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/50 flex flex-col h-[550px]">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] flex items-center gap-2">
                            Territory Intelligence
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">AI Powered</span>
                        </h3>
                        <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                            Geographic distribution & anomaly detection
                        </p>
                    </div>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {(['revenue', 'customers', 'growth', 'whitespace'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setActiveMetric(m)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeMetric === m ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {m === 'whitespace' ? 'White-Space' : m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 relative">
                    {/* Legend */}
                    {activeMetric === 'whitespace' && (
                        <div className="absolute bottom-4 left-4 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs flex items-center gap-2">
                            <span className="font-semibold">Penetration:</span>
                            <div className="w-4 h-4 bg-[#FEF2F2] rounded border border-slate-300" title="Low (High Whitespace)"></div>
                            <div className="w-4 h-4 bg-[#FCA5A5] rounded border border-slate-300" title="Medium"></div>
                            <div className="w-4 h-4 bg-[#EFF6FF] rounded border border-slate-300" title="High"></div>
                        </div>
                    )}

                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={PROJECTION_CONFIG}
                        className="w-full h-full outline-none"
                    >
                        <ZoomableGroup center={[78.9629, 22.5937]} zoom={1.3}>
                            <Geographies geography={INDIA_TOPO_JSON}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const stateName = geo.properties.NAME_1 || geo.properties.name;
                                        const cur = stateData[stateName] || stateData[stateName.toUpperCase()] || null;
                                        const hasData = cur && cur.customerCount > 0;
                                        
                                        let val = 0;
                                        if (cur) {
                                            if (activeMetric === 'revenue') val = cur.revenue;
                                            else if (activeMetric === 'customers') val = cur.customerCount;
                                            else if (activeMetric === 'whitespace') val = cur.penetration;
                                            else val = cur.prevRevenue > 0 ? ((cur.revenue - cur.prevRevenue)/cur.prevRevenue)*100 : 0;
                                        }

                                        // For whitespace, we want to color it even if we have 0 customers (if we simulate prospects)
                                        // But for this mock, states with no customers in CRM won't be in stateData. Let's color them neutral.
                                        const fill = hasData ? colorScale(val) : "#F8FAFC";

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={fill}
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

                            {/* Smart Alert Markers */}
                            {Object.entries(stateData).map(([state, data]) => {
                                if (data.hasAlert && STATE_CENTERS[state]) {
                                    return (
                                        <Marker key={`${state}-alert`} coordinates={STATE_CENTERS[state]}>
                                            <g
                                                fill="none"
                                                stroke="#EF4444"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                transform="translate(-12, -24)"
                                            >
                                                <circle cx="12" cy="12" r="10" fill="white" />
                                                <path d="M12 8v4" />
                                                <path d="M12 16h.01" />
                                            </g>
                                        </Marker>
                                    );
                                }
                                return null;
                            })}

                        </ZoomableGroup>
                    </ComposableMap>
                    
                    <Tooltip 
                        id="map-tooltip" 
                        isOpen={!!hoveredState}
                        className="!bg-slate-900/95 !backdrop-blur-md !p-4 !rounded-xl !shadow-2xl z-50 !border !border-slate-700/50"
                    >
                        {hoveredState && stateData[hoveredState] && (
                            <div className="min-w-[200px]">
                                <h4 className="font-bold text-white mb-2 pb-2 border-b border-slate-700/50 flex justify-between items-center">
                                    {hoveredState}
                                    {stateData[hoveredState].hasAlert && (
                                        <i className="fas fa-exclamation-circle text-red-400"></i>
                                    )}
                                </h4>
                                <div className="space-y-2">
                                    {stateData[hoveredState].hasAlert && (
                                        <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-xs p-2 rounded mb-3">
                                            {stateData[hoveredState].alertMsg}
                                        </div>
                                    )}
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Revenue</span>
                                        <span className="font-mono text-emerald-400 font-medium">₹{(stateData[hoveredState].revenue / 1000).toFixed(1)}k</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Active Customers</span>
                                        <span className="font-mono text-white font-medium">{stateData[hoveredState].customerCount}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Total Prospects</span>
                                        <span className="font-mono text-slate-300 font-medium">{stateData[hoveredState].totalProspects}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-sm">
                                        <span className="text-slate-400">Penetration Rate</span>
                                        <span className="font-mono text-white font-medium">{stateData[hoveredState].penetration.toFixed(1)}%</span>
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
