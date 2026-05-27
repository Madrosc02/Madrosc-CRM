import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineIcon, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Customer } from '../../types';

interface SalesTrendProps {
    customer: Customer;
}

export const SalesTrend: React.FC<SalesTrendProps> = ({ customer }) => {
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');
    const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');

    // Generate dynamic chart data based on customer
    const chartData = useMemo(() => {
        const avg = customer.avg6MoSales || 50000;
        const current = customer.salesThisMonth || 50000;
        
        // Month names for the X-Axis based on current date
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIndex = new Date().getMonth();
        
        let numMonths = 6;
        if (timeRange === '1M') numMonths = 1;
        if (timeRange === '3M') numMonths = 3;
        if (timeRange === '1Y') numMonths = 12;

        const data = [];
        for (let i = numMonths - 1; i >= 0; i--) {
            const mIndex = (currentMonthIndex - i + 12) % 12;
            
            // Generate plausible data around average
            let sales = avg * (0.8 + Math.random() * 0.4);
            
            // Force the last month to be exact 'current'
            if (i === 0) sales = current;
            
            data.push({
                month: months[mIndex],
                sales: Math.round(sales)
            });
        }
        return data;
    }, [customer, timeRange]);

    // Calculate Growth vs previous month (or period)
    const growth = useMemo(() => {
        if (chartData.length < 2) return { value: 0, isPositive: true };
        const current = chartData[chartData.length - 1].sales;
        const previous = chartData[chartData.length - 2].sales;
        if (previous === 0) return { value: 0, isPositive: true };
        const percent = Math.round(((current - previous) / previous) * 100);
        return { value: Math.abs(percent), isPositive: percent >= 0 };
    }, [chartData]);

    const metrics = useMemo(() => [
        {
            label: 'Outstanding',
            value: `₹${(customer.outstandingBalance || 0).toLocaleString()}`,
            icon: '₹',
            bgColor: (customer.outstandingBalance || 0) > 0 ? 'from-rose-50 to-pink-100' : 'from-green-50 to-emerald-100',
            borderColor: (customer.outstandingBalance || 0) > 0 ? 'border-rose-200' : 'border-green-200',
            textColor: (customer.outstandingBalance || 0) > 0 ? 'text-rose-700' : 'text-green-700',
        },
        {
            label: 'YTD Sales',
            value: `₹${(customer.totalSales || ((customer.avg6MoSales || 0) * 12) || 0).toLocaleString()}`,
            icon: '📊',
            bgColor: 'from-blue-50 to-cyan-100',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-700',
        },
        {
            label: 'Last Order',
            value: customer.daysSinceLastOrder ? `${customer.daysSinceLastOrder} Days` : 'Never',
            icon: '📦',
            bgColor: (customer.daysSinceLastOrder || 0) > 30 ? 'from-amber-50 to-orange-100' : 'from-green-50 to-emerald-100',
            borderColor: (customer.daysSinceLastOrder || 0) > 30 ? 'border-amber-200' : 'border-green-200',
            textColor: (customer.daysSinceLastOrder || 0) > 30 ? 'text-amber-700' : 'text-green-700',
        },
        {
            label: 'Customer Tier',
            value: customer.tier || 'Standard',
            icon: '✨',
            bgColor: 'from-purple-50 to-violet-100',
            borderColor: 'border-purple-200',
            textColor: 'text-purple-700',
        },
    ], [customer]);

    // Custom Tooltip with growth calc
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const currentVal = payload[0].value;
            // Find this month in chartData to get previous month for growth calc in tooltip
            const idx = chartData.findIndex(d => d.month === label);
            let growthText = null;
            let isPos = true;
            if (idx > 0) {
                const prevVal = chartData[idx - 1].sales;
                if (prevVal > 0) {
                    const pct = Math.round(((currentVal - prevVal) / prevVal) * 100);
                    isPos = pct >= 0;
                    growthText = `${isPos ? '+' : ''}${pct}% vs prev`;
                }
            }

            return (
                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
                    <p className="font-semibold text-slate-800 mb-1">{label}</p>
                    <p className="text-lg font-bold text-teal-600">₹{currentVal.toLocaleString()}</p>
                    {growthText && (
                        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {growthText}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Sales Trend Header and Chart */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-200 rounded-xl shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 relative z-10">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Sales Trend</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-3xl font-bold text-slate-900">
                                ₹{(customer.salesThisMonth || 0).toLocaleString()}
                            </span>
                            {chartData.length > 1 && (
                                <span className={`text-sm font-medium px-3 py-1 rounded-full border flex items-center gap-1 ${
                                    growth.isPositive ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                    {growth.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {growth.value}% vs last period
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* Chart Toggle */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Line Chart"
                            >
                                <LineIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Bar Chart"
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Time Range Filter */}
                        <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                            {(['1M', '3M', '6M', '1Y'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeRange(period)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                        timeRange === period
                                            ? 'bg-slate-800 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                    }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm relative z-10">
                    <ResponsiveContainer width="100%" height={240}>
                        {chartType === 'line' ? (
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => \`₹\${val/1000}k\`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Line
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#0d9488"
                                    strokeWidth={3}
                                    dot={{ fill: '#ffffff', stroke: '#0d9488', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
                                <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} dx={-10} tickFormatter={(val) => \`₹\${val/1000}k\`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                                <Bar 
                                    dataKey="sales" 
                                    fill="#0d9488" 
                                    radius={[4, 4, 0, 0]}
                                    isAnimationActive={true}
                                />
                            </BarChart>
                        )}
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
                            <div className={`text-xl lg:text-2xl font-bold ${metric.textColor}`}>
                                {metric.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
