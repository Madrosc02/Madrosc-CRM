import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../contexts/AppContext';

const GeographicHeatmap: React.FC = () => {
    const { customers } = useApp();

    const data = useMemo(() => {
        const stateMap = new Map<string, number>();

        customers.forEach(customer => {
            if (customer.salesThisMonth > 0) {
                const state = customer.state || 'Unknown';
                stateMap.set(state, (stateMap.get(state) || 0) + customer.salesThisMonth);
            }
        });

        // If no sales this month, fallback to outstanding balance or overall customer count to show SOMETHING
        if (stateMap.size === 0) {
             customers.forEach(customer => {
                const state = customer.state || 'Unknown';
                stateMap.set(state, (stateMap.get(state) || 0) + (customer.avg6MoSales || 1));
            });
        }

        const formattedData = Array.from(stateMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort descending

        return formattedData;
    }, [customers]);

    const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

    const CustomizedContent = (props: any) => {
        const { root, depth, x, y, width, height, index, name, value } = props;
        
        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: depth < 2 ? COLORS[index % COLORS.length] : 'rgba(255,255,255,0)',
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                    }}
                />
                {width > 50 && height > 30 && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={14}
                        fontWeight="bold"
                    >
                        {name}
                    </text>
                )}
            </g>
        );
    };

    return (
        <div className="card-base p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Regional Sales Distribution</h3>
            
            {data.length > 0 ? (
                <div className="flex-grow w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={data}
                            dataKey="value"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            content={<CustomizedContent />}
                        >
                            <Tooltip 
                                formatter={(value: any) => [`₹${value.toLocaleString('en-IN')}`, 'Sales Volume']}
                                contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    No regional data available yet.
                </div>
            )}
        </div>
    );
};

export default GeographicHeatmap;
