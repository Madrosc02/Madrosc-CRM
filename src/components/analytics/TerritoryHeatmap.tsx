import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { Tooltip } from 'react-tooltip';
import { useApp } from '../../contexts/AppContext';
import DrillDownModal from './DrillDownModal';
import { Customer } from '../../types';

// India TopoJSON URL
const INDIA_TOPO_JSON = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json";

const PROJECTION_CONFIG = {
    scale: 1000,
    center: [78.9629, 22.5937] as [number, number] // Center of India
};

const TerritoryHeatmap: React.FC = () => {
    const { customers, openDetailModal } = useApp();
    const [tooltipContent, setTooltipContent] = useState("");
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Aggregate sales by state
    const stateData = useMemo(() => {
        if (!customers) return {};

        const data: Record<string, { sales: number; customerCount: number; customers: Customer[] }> = {};

        customers.forEach(customer => {
            const state = customer.state;
            if (!state) return;

            // Normalize state name if needed (simple trim/case for now)
            const normalizedState = state.trim();

            if (!data[normalizedState]) {
                data[normalizedState] = { sales: 0, customerCount: 0, customers: [] };
            }

            data[normalizedState].sales += customer.salesThisMonth || 0; // Or use avg6MoSales for broader view? Let's use salesThisMonth for "Current Performance"
            data[normalizedState].customerCount += 1;
            data[normalizedState].customers.push(customer);
        });

        return data;
    }, [customers]);

    // Color scale
    const colorScale = useMemo(() => {
        const maxSales = Math.max(...Object.values(stateData).map(d => d.sales), 1000); // Min 1000 to avoid div by zero issues

        return scaleLinear<string>()
            .domain([0, maxSales])
            .range(["#E0E7FF", "#4338CA"]); // Indigo-50 to Indigo-700
    }, [stateData]);

    const handleStateClick = (stateName: string) => {
        if (stateData[stateName]?.customerCount > 0) {
            setSelectedState(stateName);
            setIsModalOpen(true);
        }
    };

    const handleCustomerClick = (customer: Customer) => {
        setIsModalOpen(false);
        openDetailModal(customer);
    };

    return (
        <>
            <div className="card-base p-6 bg-white dark:bg-gray-800 border-indigo-100 dark:border-indigo-900/50">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                            Territory Performance
                        </h3>
                        <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                            Sales distribution across states (Click to drill down)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-[#E0E7FF] rounded-sm"></div>
                        <span>Low</span>
                        <div className="w-3 h-3 bg-[#4338CA] rounded-sm ml-2"></div>
                        <span>High</span>
                    </div>
                </div>

                <div className="h-[400px] w-full border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50 relative">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={PROJECTION_CONFIG}
                        className="w-full h-full"
                    >
                        <ZoomableGroup center={[78.9629, 22.5937]} zoom={1}>
                            <Geographies geography={INDIA_TOPO_JSON}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        // Match GeoJSON state name with our data
                                        // Note: GeoJSON names might differ slightly from user input. 
                                        // Real-world apps need a robust mapping dictionary.
                                        // We'll try direct match first.
                                        const stateName = geo.properties.NAME_1 || geo.properties.name;
                                        const cur = stateData[stateName] || stateData[stateName.toUpperCase()] || { sales: 0, customerCount: 0, customers: [] };

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={cur.sales > 0 ? colorScale(cur.sales) : "#F1F5F9"}
                                                stroke="#CBD5E1"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: "#F59E0B", outline: "none", cursor: "pointer" }, // Amber-500 on hover
                                                    pressed: { outline: "none" },
                                                }}
                                                onClick={() => handleStateClick(stateName)}
                                                onMouseEnter={() => {
                                                    setTooltipContent(`${stateName}: ₹${cur.sales.toLocaleString()} (${cur.customerCount} customers)`);
                                                }}
                                                onMouseLeave={() => {
                                                    setTooltipContent("");
                                                }}
                                                data-tooltip-id="map-tooltip"
                                                data-tooltip-content={tooltipContent}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                    <Tooltip id="map-tooltip" />
                </div>
            </div>

            <DrillDownModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedState ? `Customers in ${selectedState}` : 'State Details'}
                customers={selectedState ? (stateData[selectedState]?.customers || []) : []}
                onCustomerClick={handleCustomerClick}
            />
        </>
    );
};

export default TerritoryHeatmap;
