import React, { useMemo } from 'react';
import { Package, TrendingDown, Sparkles } from 'lucide-react';
import { Customer, Invoice } from '../../types';

interface InsightsGridProps {
    customer: Customer;
    invoices: Invoice[];
}

export const InsightsGrid: React.FC<InsightsGridProps> = ({ customer, invoices }) => {
    
    // Calculate product aggregates and declining trends
    const productStats = useMemo(() => {
        const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
        const stats: Record<string, { quantity: number, amount: number }> = {};
        
        // Setup for declining products
        const now = new Date();
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        
        const recentStats: Record<string, number> = {};
        const oldStats: Record<string, number> = {};
        
        customerInvoices.forEach(inv => {
            const invDate = new Date(inv.date);
            
            inv.items.forEach(item => {
                // Total stats
                if (!stats[item.productName]) {
                    stats[item.productName] = { quantity: 0, amount: 0 };
                }
                stats[item.productName].quantity += item.quantity;
                stats[item.productName].amount += item.amount;
                
                // Trend stats
                if (invDate >= ninetyDaysAgo) {
                    recentStats[item.productName] = (recentStats[item.productName] || 0) + item.quantity;
                } else if (invDate >= oneEightyDaysAgo) {
                    oldStats[item.productName] = (oldStats[item.productName] || 0) + item.quantity;
                }
            });
        });

        // Calculate declining
        const decliningProducts: Array<{ name: string, drop: number }> = [];
        Object.keys(oldStats).forEach(product => {
            const oldQty = oldStats[product];
            const recentQty = recentStats[product] || 0;
            if (oldQty > 0 && recentQty < oldQty * 0.5) {
                // Dropped by more than 50%
                decliningProducts.push({
                    name: product,
                    drop: Math.round(((oldQty - recentQty) / oldQty) * 100)
                });
            }
        });
        
        decliningProducts.sort((a, b) => b.drop - a.drop);

        const sortedProducts = Object.entries(stats).sort((a, b) => b[1].quantity - a[1].quantity);
        return {
            totalUnique: sortedProducts.length,
            topProducts: sortedProducts.slice(0, 5), // Top 5
            decliningProducts: decliningProducts.slice(0, 4), // Top 4 declining
            all: sortedProducts
        };
    }, [customer.id, invoices]);

    const hasData = productStats.totalUnique > 0;
    const hasDeclining = productStats.decliningProducts.length > 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            <div className="rounded-xl border bg-blue-50 border-blue-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-200 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Top Selling Products</h3>
                        <p className="text-sm text-slate-600">Based on recent uploaded invoices</p>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                        <div className="text-2xl font-bold text-slate-900">{productStats.totalUnique}</div>
                        <div className="text-xs text-slate-500">Unique Products</div>
                    </div>
                </div>
                {hasData && (
                    <div className="mt-4 space-y-2 border-t border-blue-100 pt-4">
                        {productStats.topProducts.map(([name, data]) => (
                            <div key={name} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700 truncate max-w-[150px]">{name}</span>
                                <span className="text-blue-700 font-bold">{data.quantity} units</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-xl border bg-red-50 border-red-200 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-200 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Declining Products</h3>
                        <p className="text-sm text-slate-600">Volume dropped &gt;50% in last 3 months</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{productStats.decliningProducts.length}</div>
                        {hasDeclining && <div className="text-xs text-red-600 font-medium">Needs Action</div>}
                    </div>
                </div>
                
                <div className="mt-4 border-t border-red-100 pt-4 space-y-2">
                    {hasDeclining ? (
                        productStats.decliningProducts.map((prod) => (
                            <div key={prod.name} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700 truncate max-w-[150px]">{prod.name}</span>
                                <span className="text-red-600 font-bold">-{prod.drop}%</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-600 italic">No declining products detected in recent invoices.</p>
                    )}
                </div>
            </div>

            <div className="rounded-xl border bg-purple-50 border-purple-200 p-6 shadow-sm h-full flex flex-col justify-start">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-200 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">AI Suggested Schemes</h3>
                            <span className="bg-purple-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">AI</span>
                        </div>
                        <p className="text-sm text-slate-600">Personalized offers based on behavior</p>
                    </div>
                </div>
                {hasData && (
                    <div className="mt-4 border-t border-purple-100 pt-4 space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <p className="text-xs font-bold text-purple-600 mb-1">BUNDLE OFFER</p>
                            <p className="text-sm text-slate-800">Buy 50 {productStats.topProducts[0][0]}, Get 10% off next order.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
