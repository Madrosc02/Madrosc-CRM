import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateSalesForecast, ForecastData } from '../../services/forecastService';
import { Sale } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const SalesForecast: React.FC = () => {
    const { getAllSales } = useApp();
    const [forecast, setForecast] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [historicalData, setHistoricalData] = useState<{ name: string; amount: number; type: 'actual' | 'predicted' }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const sales = await getAllSales();

            // Generate forecast
            const forecastData = await generateSalesForecast(sales);
            setForecast(forecastData);

            // Prepare chart data (Last 6 months + Next 3 months)
            const chartData = [];
            const now = new Date();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Last 6 months actuals
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = months[d.getMonth()];

                const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
                const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

                const total = sales
                    .filter(s => {
                        const saleDate = new Date(s.date);
                        return saleDate >= monthStart && saleDate <= monthEnd;
                    })
                    .reduce((sum, s) => sum + s.amount, 0);

                chartData.push({ name: monthName, amount: total, type: 'actual' as const });
            }

            // Next 3 months predictions
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            chartData.push({
                name: months[nextMonth.getMonth()],
                amount: forecastData.next30Days.predicted,
                type: 'predicted' as const
            });

            const month2 = new Date(now.getFullYear(), now.getMonth() + 2, 1);
            chartData.push({
                name: months[month2.getMonth()],
                amount: forecastData.next60Days.predicted - forecastData.next30Days.predicted,
                type: 'predicted' as const
            });

            const month3 = new Date(now.getFullYear(), now.getMonth() + 3, 1);
            chartData.push({
                name: months[month3.getMonth()],
                amount: forecastData.next90Days.predicted - forecastData.next60Days.predicted,
                type: 'predicted' as const
            });

            setHistoricalData(chartData);
            setLoading(false);
        };

        fetchData();
    }, [getAllSales]);

    if (loading || !forecast) {
        return (
            <div className="card-base p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                        <i className="fas fa-crystal-ball text-purple-500 mr-2"></i>
                        AI Sales Forecast
                    </h3>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">
                        Predicted revenue for upcoming months
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${forecast.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        forecast.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {forecast.trend === 'up' ? '📈 Trending Up' : forecast.trend === 'down' ? '📉 Trending Down' : '➡️ Stable'}
                    {forecast.growthRate !== 0 && ` (${forecast.growthRate > 0 ? '+' : ''}${forecast.growthRate.toFixed(1)}%)`}
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary-light)', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-secondary-light)', fontSize: 12 }}
                            tickFormatter={(value) => `₹${value / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: 'var(--hover-bg)' }}
                            contentStyle={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)',
                                borderRadius: '0.5rem',
                                color: 'var(--text-primary-light)'
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        />
                        <ReferenceLine x="Sep" stroke="var(--text-secondary-light)" strokeDasharray="3 3" />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {historicalData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.type === 'actual' ? '#3b82f6' : '#8b5cf6'}
                                    fillOpacity={entry.type === 'predicted' ? 0.6 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <div className="text-sm text-purple-600 dark:text-purple-300 mb-1">Next 30 Days</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        ₹{(forecast.next30Days.predicted / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">
                        Range: ₹{(forecast.next30Days.range[0] / 1000).toFixed(0)}k - ₹{(forecast.next30Days.range[1] / 1000).toFixed(0)}k
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <div className="text-sm text-indigo-600 dark:text-indigo-300 mb-1">Next 60 Days</div>
                    <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                        ₹{(forecast.next60Days.predicted / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                        Cumulative Forecast
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">Next 90 Days</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        ₹{(forecast.next90Days.predicted / 1000).toFixed(1)}k
                    </div>
                    <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                        Confidence: {(forecast.next90Days.confidence * 100).toFixed(0)}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesForecast;