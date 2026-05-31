import React, { useMemo, useState } from 'react';
import { Customer, Invoice, CustomerTier } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface CrossSellMatrixProps {
    customers: Customer[];
    invoices: Invoice[];
}

const CrossSellMatrix: React.FC<CrossSellMatrixProps> = ({ customers, invoices }) => {
    const { openDetailModal } = useApp();
    const [selectedTier, setSelectedTier] = useState<CustomerTier | 'All'>('All');

    // Calculate cross-sell opportunities
    const crossSellData = useMemo(() => {
        if (!invoices || invoices.length === 0 || !customers || customers.length === 0) return { topProducts: [], opportunities: [] };

        // 1. Filter customers by tier if selected
        const targetCustomers = selectedTier === 'All' ? customers : customers.filter(c => c.tier === selectedTier);
        if (targetCustomers.length === 0) return { topProducts: [], opportunities: [] };
        const targetCustomerIds = new Set(targetCustomers.map(c => c.id));

        // 2. Find overall most popular products across these customers
        const productPopularity: Record<string, { count: number, revenue: number }> = {};
        
        invoices.forEach(inv => {
            if (targetCustomerIds.has(inv.customerId)) {
                inv.items.forEach(item => {
                    const name = item.productName.trim();
                    if (!productPopularity[name]) productPopularity[name] = { count: 0, revenue: 0 };
                    productPopularity[name].count += 1; // Count of invoices it appeared in
                    productPopularity[name].revenue += item.amount;
                });
            }
        });

        // Get Top 5 products by popularity (count)
        const topProducts = Object.entries(productPopularity)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(entry => entry[0]);

        if (topProducts.length === 0) return { topProducts: [], opportunities: [] };

        // 3. For each customer, check which top products they HAVEN'T bought
        const opps = targetCustomers.map(customer => {
            const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
            
            const productsBought = new Set<string>();
            customerInvoices.forEach(inv => {
                inv.items.forEach(item => productsBought.add(item.productName.trim()));
            });

            const missingProducts = topProducts.filter(p => !productsBought.has(p));
            
            return {
                customer,
                missingProducts,
                potentialValue: missingProducts.length * (customer.avg6MoSales > 0 ? customer.avg6MoSales * 0.1 : 1000) // Estimate value
            };
        });

        // Sort by highest potential value (customers who have high sales but missing top products)
        const sortedOpps = opps
            .filter(o => o.missingProducts.length > 0)
            .sort((a, b) => b.potentialValue - a.potentialValue)
            .slice(0, 10); // Show top 10 opportunities

        return {
            topProducts,
            opportunities: sortedOpps
        };

    }, [customers, invoices, selectedTier]);

    return (
        <div className="card-base p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border-indigo-100 dark:border-indigo-900/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                        <i className="fas fa-bullseye text-indigo-500"></i>
                        White-Space & Cross-Sell Matrix
                    </h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                        AI-driven product gap analysis. Discover what your top clients <span className="italic font-bold">should</span> be buying based on peer behavior.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">Filter Tier:</span>
                    <select 
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value as any)}
                        className="bg-white dark:bg-[#1e293b] border border-indigo-200 dark:border-indigo-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]"
                    >
                        <option value="All">All Tiers</option>
                        <option value="Platinum">Platinum</option>
                        <option value="Gold">Gold</option>
                        <option value="Silver">Silver</option>
                    </select>
                </div>
            </div>

            {crossSellData.opportunities.length === 0 ? (
                <div className="py-8 text-center bg-white/50 dark:bg-[#1e293b]/50 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                    <i className="fas fa-magic text-3xl text-indigo-300 mb-3"></i>
                    <p className="text-indigo-800 dark:text-indigo-200 font-medium">Need more invoice data to generate insights for {selectedTier} tier.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Top Products Legend */}
                    <div className="bg-white dark:bg-[#1e293b] p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm flex flex-wrap gap-2 items-center text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Top Products for {selectedTier}:</span>
                        {crossSellData.topProducts.map((p, i) => (
                            <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 rounded text-xs font-bold">
                                {p}
                            </span>
                        ))}
                    </div>

                    {/* Opportunities List */}
                    <div className="space-y-3">
                        {crossSellData.opportunities.map((opp, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h4 className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => openDetailModal(opp.customer)}>
                                                {opp.customer.firmName || opp.customer.name}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                opp.customer.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                                                opp.customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {opp.customer.tier}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2">
                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 mt-0.5">Missing:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {opp.missingProducts.map((p, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-full text-[10px] font-semibold flex items-center gap-1">
                                                        <i className="fas fa-plus text-[8px]"></i> {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Opportunity Value</p>
                                            <p className="font-bold text-indigo-600 dark:text-indigo-400">~₹{(opp.potentialValue / 1000).toFixed(1)}k <span className="text-xs font-normal">/mo</span></p>
                                        </div>
                                        <button 
                                            onClick={() => openDetailModal(opp.customer, 'actions')}
                                            className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white transition-colors flex items-center justify-center shadow-sm"
                                            title="Create Pitch Playbook"
                                        >
                                            <i className="fas fa-bolt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrossSellMatrix;
