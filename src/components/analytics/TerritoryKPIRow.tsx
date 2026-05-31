import React, { useMemo } from 'react';
import { Customer } from '../../types';

interface TerritoryKPIRowProps {
    customers: Customer[];
}

const TerritoryKPIRow: React.FC<TerritoryKPIRowProps> = ({ customers }) => {
    
    const kpis = useMemo(() => {
        const stateData: Record<string, { revenue: number, prevRevenue: number, customers: number }> = {};
        
        customers.forEach(c => {
            const state = c.state || 'Unknown';
            if (!stateData[state]) stateData[state] = { revenue: 0, prevRevenue: 0, customers: 0 };
            stateData[state].revenue += c.salesThisMonth || 0;
            stateData[state].prevRevenue += c.avg6MoSales || 0;
            stateData[state].customers += 1;
        });

        let topRevenue = { state: '-', value: 0 };
        let topGrowth = { state: '-', value: 0 };
        let untapped = { state: '-', customers: 0, aov: Infinity };

        Object.entries(stateData).forEach(([state, data]) => {
            if (data.revenue > topRevenue.value) topRevenue = { state, value: data.revenue };
            
            const growth = data.prevRevenue > 0 ? ((data.revenue - data.prevRevenue) / data.prevRevenue) * 100 : 0;
            if (growth > topGrowth.value) topGrowth = { state, value: growth };

            const aov = data.customers > 0 ? data.revenue / data.customers : 0;
            if (data.customers > 5 && aov < untapped.aov) {
                untapped = { state, customers: data.customers, aov };
            }
        });

        return { topRevenue, topGrowth, untapped };
    }, [customers]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-base p-6 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white border-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <i className="fas fa-crown text-6xl"></i>
                </div>
                <div className="relative z-10">
                    <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider mb-2">Top Revenue Region</p>
                    <h3 className="text-2xl font-bold mb-1">{kpis.topRevenue.state}</h3>
                    <div className="text-3xl font-mono font-bold text-white">
                        ₹{(kpis.topRevenue.value / 1000).toFixed(1)}k
                    </div>
                </div>
            </div>

            <div className="card-base p-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <i className="fas fa-chart-line text-6xl"></i>
                </div>
                <div className="relative z-10">
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Fastest Growing</p>
                    <h3 className="text-2xl font-bold mb-1">{kpis.topGrowth.state}</h3>
                    <div className="text-3xl font-mono font-bold text-white">
                        +{kpis.topGrowth.value.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div className="card-base p-6 bg-gradient-to-br from-amber-500 to-amber-700 text-white border-0 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <i className="fas fa-bullseye text-6xl"></i>
                </div>
                <div className="relative z-10">
                    <p className="text-amber-100 text-sm font-medium uppercase tracking-wider mb-2">Untapped Potential</p>
                    <h3 className="text-2xl font-bold mb-1">{kpis.untapped.state === '-' ? 'N/A' : kpis.untapped.state}</h3>
                    <div className="text-sm text-amber-50">
                        {kpis.untapped.customers} customers but lowest AOV (₹{Math.round(kpis.untapped.aov).toLocaleString('en-IN')})
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerritoryKPIRow;
