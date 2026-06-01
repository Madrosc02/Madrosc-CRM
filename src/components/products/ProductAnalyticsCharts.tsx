import React, { useMemo } from 'react';
import { Product } from '../../types';
import { ProductMetrics } from '../../utils/productAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, TrendingDown, PackageMinus, Zap, Filter } from 'lucide-react';

interface Props {
  products: Product[];
  metricsMap: Map<string, ProductMetrics>;
  activeCategory: string;
  onCategoryClick: (category: string) => void;
}

export const ProductAnalyticsDashboard: React.FC<Props> = ({ products, metricsMap, activeCategory, onCategoryClick }) => {
  
  const categoryCounts = useMemo(() => {
    const counts = {
      'Top Selling': 0,
      'Slow Moving': 0,
      'Declining': 0,
      'Untapped': 0,
    };
    Array.from(metricsMap.values()).forEach(m => {
      if (counts[m.category as keyof typeof counts] !== undefined) {
        counts[m.category as keyof typeof counts]++;
      }
    });
    return counts;
  }, [metricsMap]);

  // 1. Profitability Matrix Data (Scatter Plot: Margin vs Monthly Sales)
  const scatterData = useMemo(() => {
    return products.map(p => {
      const m = metricsMap.get(p.id);
      if (!m || m.averageMonthlySale === 0) return null;
      return {
        name: p.brandName,
        monthlySale: m.averageMonthlySale,
        margin: m.averageMarginPercent || 0,
        revenue: m.totalRevenue,
        segment: p.segment || 'General'
      };
    }).filter(Boolean);
  }, [products, metricsMap]);

  // 2. Top Performers (Bar Chart)
  const topPerformers = useMemo(() => {
    return Array.from(metricsMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(m => {
        const p = products.find(prod => prod.id === m.productId);
        return {
          name: p?.brandName || 'Unknown',
          revenue: m.totalRevenue
        };
      }).filter(d => d.revenue > 0);
  }, [products, metricsMap]);

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="font-bold text-slate-800">{data.name}</p>
          <p className="text-sm text-slate-600">Monthly Sales: <span className="font-semibold">{Math.round(data.monthlySale)} units</span></p>
          <p className="text-sm text-slate-600">Avg Margin: <span className="font-semibold">{data.margin?.toFixed(1)}%</span></p>
          <p className="text-sm text-slate-600">Total Revenue: <span className="font-semibold">₹{data.revenue?.toLocaleString()}</span></p>
        </div>
      );
    }
    return null;
  };

  const totalAnomalies = Array.from(metricsMap.values()).reduce((sum, m) => sum + m.priceAnomalies, 0);

  const categories = [
    { name: 'Top Selling', icon: Zap, count: categoryCounts['Top Selling'], color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    { name: 'Slow Moving', icon: PackageMinus, count: categoryCounts['Slow Moving'], color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    { name: 'Declining', icon: TrendingDown, count: categoryCounts['Declining'], color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    { name: 'Untapped', icon: Filter, count: categoryCounts['Untapped'], color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
  ];

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-2">
      
      {/* Category Filter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(isActive ? 'All' : cat.name)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                isActive 
                  ? `ring-2 ring-offset-2 ring-${cat.color.split('-')[1]}-500 ${cat.bg} ${cat.border} shadow-md` 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${cat.bg}`}>
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <span className={`text-2xl font-bold ${isActive ? cat.color : 'text-slate-700'}`}>
                  {cat.count}
                </span>
              </div>
              <h3 className={`font-semibold ${isActive ? cat.color : 'text-slate-600'}`}>{cat.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Click to filter table</p>
            </button>
          );
        })}
      </div>

      {totalAnomalies > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-red-700">
            <span className="font-bold">Price Anomalies Detected: </span>
            {totalAnomalies} products were sold below purchase rate. Expand rows with warnings below to investigate.
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Profitability Matrix</h3>
          <p className="text-sm text-slate-500 mb-6">Volume (Monthly Sales) vs Margin (%)</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" dataKey="monthlySale" name="Monthly Sales" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis type="number" dataKey="margin" name="Margin" unit="%" tick={{fontSize: 12}} stroke="#94a3b8" />
                <ZAxis type="number" dataKey="revenue" range={[50, 400]} name="Revenue" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Products" data={scatterData} fill="#8B5CF6">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-1">Top Performers by Revenue</h3>
          <p className="text-sm text-slate-500 mb-6">Highest grossing products across all time</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 500, fill: '#475569'}} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24}>
                  {topPerformers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
