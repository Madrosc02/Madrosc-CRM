import React, { useState, useMemo } from 'react';
import { Package, Plus, Upload, Search, Filter, MoreVertical, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { calculateProductMetrics } from '../../utils/productAnalytics';
import { ProductAnalyticsDashboard } from './ProductAnalyticsCharts';

const ProductsPage: React.FC = () => {
    const { products, invoices, customers, openAddProductModal, openBulkImportProductsModal, deleteProduct } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('All');
    const [activeCategory, setActiveCategory] = useState('All');
    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    // Calculate advanced metrics
    const metricsMap = useMemo(() => {
        return calculateProductMetrics(products, invoices || [], customers || [], dateRange);
    }, [products, invoices, customers, dateRange]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.brandName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  p.composition.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSegment = segmentFilter === 'All' || p.segment === segmentFilter;
            const matchesCategory = activeCategory === 'All' || metricsMap.get(p.id)?.category === activeCategory;
            return matchesSearch && matchesSegment && matchesCategory;
        });
    }, [products, searchTerm, segmentFilter, activeCategory, metricsMap]);

    const allSegments = useMemo(() => {
        const segments = new Set(products.map(p => p.segment).filter(Boolean));
        return ['All', ...Array.from(segments)];
    }, [products]);

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'Active').length;
    const uniqueSegments = new Set(products.map(p => p.segment)).size;

    return (
        <div className="font-sans antialiased p-8 max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Product Catalog</h1>
                    <p className="text-slate-500 font-medium">Manage your pharmaceutical inventory, prices, and segments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={openBulkImportProductsModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-semibold shadow-sm hover:shadow"
                    >
                        <Upload className="w-4 h-4" />
                        Import CSV
                    </button>
                    <button 
                        onClick={openAddProductModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Performance Analytics</h2>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                        <div className="pl-3 pr-2 flex items-center gap-2 text-slate-400 border-r border-slate-100">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-semibold text-slate-600">Period</span>
                        </div>
                        <input 
                            type="date" 
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="text-sm font-medium border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer pl-3 pr-1"
                        />
                        <span className="text-slate-300 px-1">-</span>
                        <input 
                            type="date" 
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="text-sm font-medium border-none focus:ring-0 text-slate-700 bg-transparent cursor-pointer pl-1 pr-3"
                        />
                    </div>
                </div>
                <ProductAnalyticsDashboard 
                    products={products} 
                    metricsMap={metricsMap} 
                    activeCategory={activeCategory}
                    onCategoryClick={setActiveCategory}
                />
            </div>

            {/* Catalog Overview KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 flex items-center gap-5 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Package className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Total Catalog</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{totalProducts}</p>
                            <span className="text-xs font-medium text-slate-400">Products</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 flex items-center gap-5 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-100 opacity-0 group-hover:opacity-50 transition-opacity" />
                        <div className="w-7 h-7 border-2 border-emerald-600 rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Active Products</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{activeProducts}</p>
                            <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">Live</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 flex items-center gap-5 group cursor-default">
                    <div className="w-14 h-14 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Filter className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Segments</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{uniqueSegments}</p>
                            <span className="text-xs font-medium text-slate-400">Categories</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-t-2xl border border-b-0 border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by brand or composition..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">Segment:</span>
                    <select 
                        value={segmentFilter}
                        onChange={(e) => setSegmentFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        {allSegments.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Grid */}
            <div className="bg-white border border-slate-200 rounded-b-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Brand Name & Comp.</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Segment</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pricing & Margin</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sales Velocity</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                                const m = metricsMap.get(product.id);
                                const isExpanded = expandedProduct === product.id;
                                return (
                                <React.Fragment key={product.id}>
                                <tr 
                                    className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50' : ''}`}
                                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                            {product.brandName}
                                            {m?.priceAnomalies && m.priceAnomalies > 0 ? (
                                                <span title="Sold below cost!" className="text-red-500"><AlertTriangle className="w-3 h-3" /></span>
                                            ) : null}
                                        </div>
                                        <div className="text-xs text-slate-500 truncate max-w-[250px] ml-6" title={product.composition}>
                                            {product.composition}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                            {product.segment || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">MRP: ₹{product.mrp?.toFixed(2)}</div>
                                        <div className="text-xs text-slate-500">PTR: ₹{product.purchaseRate?.toFixed(2)}</div>
                                        {m?.averageMarginPercent !== null && m?.averageMarginPercent !== undefined ? (
                                            <div className="text-xs font-bold text-emerald-600 mt-0.5">Avg Margin: {m.averageMarginPercent.toFixed(1)}%</div>
                                        ) : (
                                            <div className="text-xs font-bold text-slate-400 mt-0.5">Avg Margin: N/A</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-800">{Math.round(m?.averageMonthlySale || 0)}/mo</span>
                                            {m?.trend === 'up' && <span title={`Up ${m.trendPercentage.toFixed(0)}%`}><ArrowUpRight className="w-4 h-4 text-emerald-500" /></span>}
                                            {m?.trend === 'down' && <span title={`Down ${m.trendPercentage.toFixed(0)}%`}><ArrowDownRight className="w-4 h-4 text-red-500" /></span>}
                                            {m?.trend === 'flat' && <span title="Stable"><Minus className="w-4 h-4 text-slate-400" /></span>}
                                        </div>
                                        <div className="text-xs text-slate-500">Total Sold: {m?.totalSoldQty || 0}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            m?.category === 'Top Selling' ? 'bg-emerald-100 text-emerald-700' :
                                            m?.category === 'Slow Moving' ? 'bg-orange-100 text-orange-700' :
                                            m?.category === 'Declining' ? 'bg-red-100 text-red-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            {m?.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Are you sure you want to delete this product?')) {
                                                        deleteProduct(product.id);
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {isExpanded && m && (
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <td colSpan={7} className="px-12 py-6">
                                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                                    <h4 className="font-semibold text-slate-800 text-sm">Client Purchase History</h4>
                                                    <span className="text-xs text-slate-500 font-medium">Selected Date Range</span>
                                                </div>
                                                {m.buyers.length > 0 ? (
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                                                            <tr>
                                                                <th className="px-4 py-2">Client Name</th>
                                                                <th className="px-4 py-2 text-right">Qty Purchased</th>
                                                                <th className="px-4 py-2 text-right">Total Revenue</th>
                                                                <th className="px-4 py-2 text-right">Avg Margin</th>
                                                                <th className="px-4 py-2 text-right">Last Purchase</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {m.buyers.map(b => (
                                                                <tr key={b.customerId} className="hover:bg-slate-50">
                                                                    <td className="px-4 py-2 font-medium text-slate-800">{b.customerName}</td>
                                                                    <td className="px-4 py-2 text-right text-slate-600">{b.quantity} units</td>
                                                                    <td className="px-4 py-2 text-right text-slate-600 font-medium">₹{b.revenue.toLocaleString()}</td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <span className={`font-semibold ${b.averageMargin > 20 ? 'text-emerald-600' : b.averageMargin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                                                            {b.averageMargin.toFixed(1)}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right text-slate-500">{new Date(b.lastPurchaseDate).toLocaleDateString()}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-8 text-center text-slate-500 text-sm">
                                                        No sales data found for this product in the selected date range.
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                <Package className="w-10 h-10 text-indigo-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">No products found</h3>
                                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                                Get started by adding your first product manually or bulk importing your existing catalog via CSV to see the magic happen.
                                            </p>
                                            <button 
                                                onClick={openAddProductModal}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm hover:shadow hover:-translate-y-0.5 hover:bg-indigo-700 transition-all"
                                            >
                                                Add Your First Product
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
