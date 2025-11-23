
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import TableSkeleton from './skeletons/TableSkeleton';
import { Customer } from '../types';

const CustomerRow: React.FC<{ customer: Customer }> = ({ customer }) => {
    const { openDetailModal } = useApp();
    const TIER_STYLES: { [key in Customer['tier']]: string } = {
        Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        Silver: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        Bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
        Dead: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const message = `Hi ${customer.name}, checking in regarding your recent order.`;
        const url = `https://wa.me/91${customer.contact}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${customer.contact}`;
    };

    return (
        <tr
            className="group border-b border-[var(--border-light)] dark:border-[var(--border-dark)] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150 cursor-pointer"
            onClick={() => openDetailModal(customer)}
        >
            <td className="p-4">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800" src={customer.avatar} alt={customer.name} />
                    <div className="ml-4">
                        <p className="font-semibold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{customer.name}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">{customer.contact}</p>
                            {/* Quick Actions (Visible on Hover) */}
                            <div className="hidden group-hover:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={handleCall} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full" title="Call">
                                    <i className="fas fa-phone text-xs"></i>
                                </button>
                                <button onClick={handleWhatsApp} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="WhatsApp">
                                    <i className="fab fa-whatsapp text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] mt-0.5">{customer.district}, {customer.state}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TIER_STYLES[customer.tier]}`}>
                    {customer.tier}
                </span>
            </td>
            <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">
                ₹{customer.salesThisMonth.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-right font-mono text-blue-600 dark:text-blue-400">
                ₹{customer.avg6MoSales.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-right font-mono text-red-600 dark:text-red-400">
                ₹{customer.outstandingBalance.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-center text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                {customer.daysSinceLastOrder} days
            </td>
            <td className="p-4 text-center">
                <button
                    className="text-sm font-medium text-[var(--primary-light)] dark:text-[var(--primary-dark)] hover:underline"
                >
                    View Details
                </button>
            </td>
        </tr>
    );
};

type SortKey = 'name' | 'tier' | 'salesThisMonth' | 'avg6MoSales' | 'outstandingBalance' | 'daysSinceLastOrder';

const CustomerTable: React.FC = () => {
    const { filteredCustomers: customers, loading, kpiFilter, setKpiFilter } = useApp();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Apply KPI filter
    const kpiFilteredCustomers = useMemo(() => {
        if (!kpiFilter || kpiFilter === 'all') return customers;

        // Handle AI search results
        if (kpiFilter === 'ai-search') {
            const aiResults = sessionStorage.getItem('aiSearchResults');
            if (aiResults) {
                const matchingIds = JSON.parse(aiResults) as string[];
                return customers.filter(c => matchingIds.includes(c.id));
            }
            return customers;
        }

        switch (kpiFilter) {
            case 'total':
                return customers; // Show all customers
            case 'pending':
                return customers.filter(c => c.salesThisMonth === 0); // No orders this month
            case 'sales':
                return customers.filter(c => c.salesThisMonth > 0); // Has sales this month
            case 'outstanding':
                return customers.filter(c => c.outstandingBalance > 0); // Has outstanding balance
            default:
                return customers;
        }
    }, [customers, kpiFilter]);

    const sortedCustomers = useMemo(() => {
        if (!sortConfig) return kpiFilteredCustomers;
        return [...kpiFilteredCustomers].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [kpiFilteredCustomers, sortConfig]);

    const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
        if (sortConfig?.key !== columnKey) return <i className="fas fa-sort text-gray-300 ml-1"></i>;
        return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-blue-500 ml-1`}></i>;
    };

    const getFilterLabel = () => {
        switch (kpiFilter) {
            case 'total': return 'All Customers';
            case 'pending': return 'Customers with Pending Orders (No Sales This Month)';
            case 'sales': return 'Customers with Sales This Month';
            case 'outstanding': return 'Customers with Outstanding Balance';
            case 'ai-search': return `AI Search Results (${sortedCustomers.length} found)`;
            default: return 'Customer Overview';
        }
    };

    return (
        <div className="card-base p-4">
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-bold text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]">{getFilterLabel()}</h3>
                {kpiFilter && kpiFilter !== 'all' && (
                    <button
                        onClick={() => setKpiFilter(null)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                        <i className="fas fa-times"></i> Clear Filter
                    </button>
                )}
            </div>
            <div className="overflow-x-auto pr-2">
                <table className="w-full text-sm text-left text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-white/5">
                        <tr>
                            <th scope="col" className="p-4 font-semibold min-w-[280px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>
                                Customer <SortIcon columnKey="name" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-center min-w-[100px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('tier')}>
                                Tier <SortIcon columnKey="tier" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-right min-w-[120px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('salesThisMonth')}>
                                Month's Sales <SortIcon columnKey="salesThisMonth" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-right min-w-[120px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('avg6MoSales')}>
                                6-Mo Avg <SortIcon columnKey="avg6MoSales" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-right min-w-[120px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('outstandingBalance')}>
                                Balance <SortIcon columnKey="outstandingBalance" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-center min-w-[100px] cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('daysSinceLastOrder')}>
                                Last Order <SortIcon columnKey="daysSinceLastOrder" />
                            </th>
                            <th scope="col" className="p-4 font-semibold text-center min-w-[120px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <TableSkeleton rows={5} cols={7} /> : sortedCustomers.map(customer => (
                            <CustomerRow key={customer.id} customer={customer} />
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && sortedCustomers.length === 0 && (
                <div className="text-center py-16 text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)]">
                    <i className="fas fa-users-slash text-4xl mb-3"></i>
                    <p className="font-medium">No customers found.</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;