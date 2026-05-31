// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import TableSkeleton from './skeletons/TableSkeleton';
import { Customer } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import BulkActionModal from './BulkActionModal';

const CustomerRow: React.FC<{ 
    customer: Customer;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
}> = ({ customer, isSelected, onToggleSelect }) => {
    const { openDetailModal } = useApp();
    const TIER_STYLES: { [key in Customer['tier']]: string } = {
        Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        Silver: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        Bronze: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
        Dead: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const balance = customer.outstandingBalance || 0;
        const greeting = `Hi ${customer.personName || customer.firmName}, this is regarding your account.`;
        const paymentReminder = balance > 0 ? ` We noticed an outstanding balance of ₹${balance.toLocaleString('en-IN')}.` : '';
        const message = greeting + paymentReminder;
        const cleanPhone = customer.contact.replace(/\D/g, '');
        const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${customer.contact}`;
    };

    const sparklineData = useMemo(() => {
        // Interpolate points to show trend direction from average to current
        return [
            { value: customer.avg6MoSales * 0.9 },
            { value: customer.avg6MoSales },
            { value: customer.avg6MoSales * 1.1 },
            { value: (customer.avg6MoSales + customer.salesThisMonth) / 2 },
            { value: customer.salesThisMonth }
        ];
    }, [customer.avg6MoSales, customer.salesThisMonth]);
    
    const isTrendingUp = customer.salesThisMonth >= customer.avg6MoSales;
    const sparklineColor = isTrendingUp ? '#10b981' : '#ef4444';

    return (
        <tr
            className={`group border-b border-slate-200 dark:border-slate-800 transition-colors duration-150 cursor-pointer ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
            onClick={() => openDetailModal(customer)}
        >
            <td className="p-4 w-12" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    checked={isSelected}
                    onChange={() => onToggleSelect(customer.id)}
                    className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary dark:focus:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
                />
            </td>
            <td className="p-4">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" src={customer.avatar} alt={customer.firmName} />
                    <div className="ml-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{customer.firmName}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">{customer.personName}</p>
                            <div className="hidden group-hover:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={handleCall} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full" title="Call">
                                    <i className="fas fa-phone text-xs"></i>
                                </button>
                                <button onClick={handleWhatsApp} className="p-1 text-green-600 hover:bg-green-100 rounded-full" title="WhatsApp">
                                    <i className="fab fa-whatsapp text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{customer.contact} • {customer.district}, {customer.state}</p>
                        {customer.tags && customer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {customer.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${TIER_STYLES[customer.tier]}`}>
                    {customer.tier}
                </span>
            </td>
            <td className="p-4 text-right">
                <div className="flex flex-col items-end">
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        ₹{customer.salesThisMonth.toLocaleString('en-IN')}
                    </span>
                    <div className="h-6 w-16 mt-1 opacity-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparklineData}>
                                <Line type="monotone" dataKey="value" stroke={sparklineColor} strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </td>
            <td className="p-4 text-right font-mono text-slate-500 dark:text-slate-400">
                ₹{customer.avg6MoSales.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-right font-mono text-red-600 dark:text-red-400 font-medium">
                ₹{customer.outstandingBalance.toLocaleString('en-IN')}
            </td>
            <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                {customer.daysSinceLastOrder} days
            </td>
            <td className="p-4 text-center">
                <button
                    onClick={(e) => { e.stopPropagation(); openDetailModal(customer); }}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View Details
                </button>
            </td>
        </tr>
    );
};

type SortKey = 'name' | 'tier' | 'salesThisMonth' | 'avg6MoSales' | 'outstandingBalance' | 'daysSinceLastOrder';

const CustomerTable: React.FC = () => {
    const { filteredCustomers: customers, loading, kpiFilter, setKpiFilter, openBulkActionModal, closeBulkActionModal } = useApp();
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    
    // Bulk Selection State
    const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());

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
                return customers;
            case 'pending':
                return customers.filter(c => c.salesThisMonth === 0);
            case 'sales':
                return customers.filter(c => c.salesThisMonth > 0);
            case 'outstanding':
                return customers.filter(c => c.outstandingBalance > 0);
            case 'high-risk':
                return customers.filter(c => c.outstandingBalance > 0 && c.salesThisMonth === 0);
            case 'upsell':
                return customers.filter(c => c.outstandingBalance === 0 && c.salesThisMonth === 0);
            case 'platinum':
                return customers.filter(c => c.tier === 'Platinum');
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
        if (sortConfig?.key !== columnKey) return <i className="fas fa-sort text-slate-300 dark:text-slate-600 ml-1"></i>;
        return <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'} text-primary ml-1`}></i>;
    };

    const getFilterLabel = () => {
        switch (kpiFilter) {
            case 'total': return 'All Customers';
            case 'pending': return 'Customers with Pending Orders (No Sales This Month)';
            case 'sales': return 'Customers with Sales This Month';
            case 'outstanding': return 'Customers with Outstanding Balance';
            case 'high-risk': return 'High Risk (No Orders + High Balance)';
            case 'upsell': return 'Easy Upsell (No Balance + No Orders)';
            case 'platinum': return 'Platinum Tier Customers';
            case 'ai-search': return `AI Search Results (${sortedCustomers.length} found)`;
            default: return 'Customer Overview';
        }
    };

    // Pagination
    React.useEffect(() => {
        setCurrentPage(1);
        setSelectedCustomerIds(new Set()); // Reset selections on filter change
    }, [kpiFilter, sortConfig]);

    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedCustomers.slice(start, start + itemsPerPage);
    }, [sortedCustomers, currentPage]);

    const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);

    const handleExportCSV = () => {
        const headers = ['Firm Name', 'Contact Person', 'Contact', 'State', 'District', 'Tier', 'Month Sales', '6Mo Avg Sales', 'Outstanding Balance', 'Days Since Last Order'];
        const dataToExport = selectedCustomerIds.size > 0 
            ? sortedCustomers.filter(c => selectedCustomerIds.has(c.id))
            : sortedCustomers;
            
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(c => [
                `"${c.firmName}"`,
                `"${c.personName || ''}"`,
                `"${c.contact}"`,
                `"${c.state}"`,
                `"${c.district}"`,
                `"${c.tier}"`,
                c.salesThisMonth,
                c.avg6MoSales,
                c.outstandingBalance,
                c.daysSinceLastOrder
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCustomerIds(new Set(paginatedCustomers.map(c => c.id)));
        } else {
            setSelectedCustomerIds(new Set());
        }
    };

    const handleToggleSelect = (id: string) => {
        const newSet = new Set(selectedCustomerIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedCustomerIds(newSet);
    };

    const selectedCustomersObj = useMemo(() => {
        return sortedCustomers.filter(c => selectedCustomerIds.has(c.id));
    }, [sortedCustomers, selectedCustomerIds]);

    return (
        <div className="card-base p-4">
            <div className="flex justify-between items-center mb-4 px-2 h-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                    {selectedCustomerIds.size > 0 ? (
                        <span className="text-primary">{selectedCustomerIds.size} Selected</span>
                    ) : (
                        getFilterLabel()
                    )}
                </h3>
                <div className="flex items-center gap-4">
                    {selectedCustomerIds.size > 0 ? (
                        <>
                            <button
                                onClick={() => setSelectedCustomerIds(new Set())}
                                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={openBulkActionModal}
                                className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm"
                            >
                                <i className="fab fa-whatsapp"></i> Bulk Action Hub
                            </button>
                        </>
                    ) : (
                        <>
                            {kpiFilter && kpiFilter !== 'all' && (
                                <button
                                    onClick={() => setKpiFilter(null)}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                >
                                    <i className="fas fa-times"></i> Clear Filter
                                </button>
                            )}
                            <button 
                                onClick={handleExportCSV}
                                className="text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors font-medium"
                            >
                                <i className="fas fa-download"></i> Export CSV
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            {/* Quick Filter Pills (hide if selecting) */}
            {selectedCustomerIds.size === 0 && (
                <div className="flex flex-wrap gap-2 px-2 mb-4">
                    <button onClick={() => setKpiFilter('pending')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${kpiFilter === 'pending' ? 'bg-emerald-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'}`}>
                        ⏳ Pending Orders
                    </button>
                    <button onClick={() => setKpiFilter('high-risk')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${kpiFilter === 'high-risk' ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'}`}>
                        🚨 High Risk
                    </button>
                    <button onClick={() => setKpiFilter('upsell')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${kpiFilter === 'upsell' ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'}`}>
                        💎 Easy Upsell
                    </button>
                    <button onClick={() => setKpiFilter('platinum')} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${kpiFilter === 'platinum' ? 'bg-slate-800 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105'}`}>
                        ⭐ Platinum
                    </button>
                </div>
            )}

            <div className="overflow-x-auto pr-2">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="p-4 w-12">
                                <input 
                                    type="checkbox" 
                                    onChange={handleSelectAll}
                                    checked={paginatedCustomers.length > 0 && selectedCustomerIds.size === paginatedCustomers.length}
                                    className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary dark:focus:ring-offset-slate-900 focus:ring-2 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
                                />
                            </th>
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
                        {loading ? <TableSkeleton rows={5} cols={8} /> : paginatedCustomers.map(customer => (
                            <CustomerRow 
                                key={customer.id} 
                                customer={customer} 
                                isSelected={selectedCustomerIds.has(customer.id)}
                                onToggleSelect={handleToggleSelect}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && sortedCustomers.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 sm:px-6 mt-4">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedCustomers.length)}</span> of <span className="font-medium">{sortedCustomers.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-primary text-primary' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <span className="sr-only">Next</span>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
            {!loading && sortedCustomers.length === 0 && (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                    <i className="fas fa-users-slash text-4xl mb-3"></i>
                    <p className="font-medium">No customers found.</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                </div>
            )}
            <BulkActionModal 
                selectedCustomers={selectedCustomersObj} 
                onClose={closeBulkActionModal} 
            />
        </div>
    );
};

export default CustomerTable;
