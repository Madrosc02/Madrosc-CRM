import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useApp } from '../../contexts/AppContext';

const RevenueGoalWidget: React.FC = () => {
    const { customers } = useApp();
    const MONTHLY_GOAL = 5000000; // 50 Lakhs default

    const currentSales = useMemo(() => {
        return customers.reduce((sum, c) => sum + (c.salesThisMonth || 0), 0);
    }, [customers]);

    const percentage = Math.min(100, Math.round((currentSales / MONTHLY_GOAL) * 100));
    const remaining = Math.max(0, MONTHLY_GOAL - currentSales);

    const data = [
        { name: 'Achieved', value: currentSales },
        { name: 'Remaining', value: remaining }
    ];

    return (
        <div className="card-base p-6 h-full flex flex-col relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Monthly Goal</h3>
            <div className="w-full flex-grow relative min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={75}
                            outerRadius={95}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.name === 'Remaining' ? 'rgba(156, 163, 175, 0.2)' : '#3b82f6'} 
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']}
                            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{percentage}%</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Achieved</span>
                </div>
            </div>
            
            <div className="w-full mt-4 flex justify-between text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Current Sales</p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-lg">₹{(currentSales / 100000).toFixed(2)}L</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-0.5">Target</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg">₹{(MONTHLY_GOAL / 100000).toFixed(2)}L</p>
                </div>
            </div>
        </div>
    );
};

export default RevenueGoalWidget;
