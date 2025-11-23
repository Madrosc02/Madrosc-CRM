import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Sale } from '../../types';
import { segmentCustomers, CustomerSegment } from '../../utils/segmentation';

const CustomerSegmentation: React.FC = () => {
    const { customers, getAllSales } = useApp();
    const [sales, setSales] = React.useState<Sale[]>([]);
    const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchSales = async () => {
            const data = await getAllSales();
            setSales(data);
        };
        fetchSales();
    }, [getAllSales]);

    const segments = useMemo(() => {
        return segmentCustomers(customers, sales);
    }, [customers, sales]);

    const selectedSegmentData = segments.find(s => s.id === selectedSegment);

    return (
        <div className="card-base p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                        Customer Segments
                    </h3>
                    <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-1">
                        RFM Analysis - Recency, Frequency, Monetary
                    </p>
                </div>
                <div className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    {segments.length} Active Segments
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {segments.map((segment) => (
                    <div
                        key={segment.id}
                        onClick={() => setSelectedSegment(segment.id === selectedSegment ? null : segment.id)}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedSegment === segment.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${segment.color} flex items-center justify-center text-white`}>
                                <i className={`fas ${segment.icon} text-lg`}></i>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                                    {segment.customers.length}
                                </div>
                                <div className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                                    customers
                                </div>
                            </div>
                        </div>

                        <h4 className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)] mb-1">
                            {segment.name}
                        </h4>
                        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mb-2">
                            {segment.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                                Revenue:
                            </span>
                            <span className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">
                                ₹{(segment.totalRevenue / 1000).toFixed(0)}k
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected Segment Details */}
            {selectedSegmentData && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                            {selectedSegmentData.name} - Customer List
                        </h4>
                        <button
                            onClick={() => setSelectedSegment(null)}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                            Close
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-blue-100 dark:bg-blue-900/40 sticky top-0">
                                <tr>
                                    <th className="text-left p-2 text-blue-900 dark:text-blue-100">Customer</th>
                                    <th className="text-right p-2 text-blue-900 dark:text-blue-100">This Month</th>
                                    <th className="text-right p-2 text-blue-900 dark:text-blue-100">Last Order</th>
                                    <th className="text-center p-2 text-blue-900 dark:text-blue-100">Tier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSegmentData.customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-blue-200 dark:border-blue-800">
                                        <td className="p-2 text-blue-900 dark:text-blue-100">{customer.firmName}</td>
                                        <td className="p-2 text-right text-blue-900 dark:text-blue-100">
                                            ₹{customer.salesThisMonth.toLocaleString('en-IN')}
                                        </td>
                                        <td className="p-2 text-right text-blue-900 dark:text-blue-100">
                                            {customer.daysSinceLastOrder}d ago
                                        </td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                    customer.tier === 'Silver' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                                                        customer.tier === 'Bronze' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {customer.tier}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerSegmentation;
