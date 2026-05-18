import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
    { month: 'Jun', sales: 80000 },
    { month: 'Jul', sales: 95000 },
    { month: 'Aug', sales: 88000 },
    { month: 'Sep', sales: 105000 },
    { month: 'Oct', sales: 98000 },
    { month: 'Nov', sales: 127000 },
];

const metrics = [
    {
        label: 'Outstanding',
        icon: '₹',
        bgColor: 'from-pink-50 to-rose-100',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-700',
    },
    {
        label: 'YTD Sales',
        icon: '📊',
        bgColor: 'from-blue-50 to-cyan-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
    },
    {
        label: 'Never Last Order',
        icon: '📦',
        bgColor: 'from-green-50 to-emerald-100',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
    },
    {
        label: 'VRW',
        icon: '✨',
        bgColor: 'from-purple-50 to-violet-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
    },
];

export const SalesTrend: React.FC = () => {
    return (
        <div className="space-y-4">
            {/* Sales Trend Header and Chart */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Sales Trend</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-3xl font-bold text-slate-900">₹127,000</span>
                            <span className="text-sm text-teal-600 font-medium bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                                +13% vs last period
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {['1M', '3M', '6M', '1Y'].map((period) => (
                            <button
                                key={period}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                    period === '6M'
                                        ? 'bg-white text-slate-700 border border-slate-200 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#f0f9ff',
                                    border: '1px solid #0ea5e9',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => `₹${value.toLocaleString()}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#0d9488"
                                strokeWidth={2}
                                dot={{ fill: '#0d9488', r: 4 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={true}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded-xl border bg-gradient-to-br ${metric.bgColor} border-l-4 ${metric.borderColor} hover:shadow-lg transition-all`}
                    >
                        <div className="space-y-3">
                            <div className="text-sm font-medium text-slate-600">{metric.label}</div>
                            <div className={`text-2xl font-bold ${metric.textColor}`}>
                                {metric.icon} {idx === 0 ? '₹0' : idx === 1 ? '₹0' : idx === 2 ? 'Never' : 'VRW'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
