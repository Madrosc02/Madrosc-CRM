import { MapPin, UserX, Award, IndianRupee, TrendingUp, ShoppingBag, Sparkles, Calendar, BarChart3, LineChart, User } from 'lucide-react';
import { useState } from 'react';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Customer } from '../types';

interface ClientProfileProps {
    customer: Customer;
    lastInteractionDate?: string;
    salesData?: { name: string; sales: number }[];
    onCall?: () => void;
    onWhatsApp?: () => void;
    onTask?: () => void;
}

export function ClientProfile({
    customer,
    lastInteractionDate,
    salesData = [],
    onCall,
    onWhatsApp,
    onTask
}: ClientProfileProps) {
    const [chartType, setChartType] = useState<'line' | 'bar'>('line');

    // Adapt data from CallMode (name) to component (month) if needed, or just use name
    const chartData = salesData.map(d => ({
        month: d.name,
        sales: d.sales
    }));

    // Calculate total sales from the graph data for the "6-Month Sales Trend" total
    const totalGraphSales = chartData.reduce((acc, curr) => acc + curr.sales, 0);

    const metrics = [
        {
            label: 'Outstanding',
            value: `₹${customer.outstandingBalance?.toLocaleString() || '0'}`,
            icon: IndianRupee,
            color: 'bg-pink-50',
            iconColor: 'text-pink-600',
        },
        {
            label: 'YTD Sales',
            value: `₹${customer.totalSales?.toLocaleString() || '0'}`,
            icon: TrendingUp,
            color: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Last Order',
            value: customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never',
            icon: ShoppingBag,
            color: 'bg-green-50',
            iconColor: 'text-green-600',
        },
        {
            label: 'AI Prediction',
            value: 'VRW', // This seems to be a placeholder or specific metric not yet in Customer type
            icon: Sparkles,
            color: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{customer.firmName || customer.name}</h2>
                        <div className="flex items-center gap-4 text-indigo-100">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{customer.town || customer.district || 'Unknown Location'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {customer.personName ? <User className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                <span className="text-sm">{customer.personName || 'No Contact Person'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                <span className="text-sm uppercase">{customer.tier}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onTask}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                                title="Create Task"
                            >
                                <span className="sr-only">Create Task</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="m9 15 2 2 4-4" /></svg>
                            </button>
                            <button
                                onClick={onWhatsApp}
                                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                                title="WhatsApp"
                            >
                                <span className="sr-only">WhatsApp</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16.95 7.05a10 10 0 1 0-9.9 9.9 10 10 0 0 0 9.9-9.9Z" /><path d="M10 10l4 4m0-4l-4 4" /></svg>
                            </button>
                            <button
                                onClick={onCall}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg font-bold shadow-lg hover:bg-indigo-50 transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                Call Now
                            </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-100">
                            <span className="text-xs">Last Interaction:</span>
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-sm font-medium text-white">{lastInteractionDate ? new Date(lastInteractionDate).toLocaleDateString() : 'None'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((metric) => {
                        const Icon = metric.icon;
                        return (
                            <div
                                key={metric.label}
                                className="p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:shadow-sm transition-all"
                            >
                                <div className={`w-10 h-10 ${metric.color} rounded-lg flex items-center justify-center mb-3`}>
                                    <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                                </div>
                                <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                                <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* 6-Month Sales Section with Graph */}
                <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">6-Month Sales Trend</p>
                            <div className="flex items-baseline gap-3">
                                <p className="text-3xl font-bold text-gray-900">₹{totalGraphSales.toLocaleString()}</p>
                                <div className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    +13% vs last period
                                </div>
                            </div>
                        </div>

                        {/* Chart Type Toggle */}
                        <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-2 rounded-md transition-all ${chartType === 'line'
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <LineChart className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-2 rounded-md transition-all ${chartType === 'bar'
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <BarChart3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-lg border border-green-100 p-4">
                        <ResponsiveContainer width="100%" height={200} minHeight={200}>
                            {chartType === 'line' ? (
                                <RechartsLine data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </RechartsLine>
                            ) : (
                                <RechartsBar data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Sales']}
                                    />
                                    <Bar
                                        dataKey="sales"
                                        fill="#10b981"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </RechartsBar>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
