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
    { 
      name: 'Top Selling', 
      desc: 'High volume & healthy margin',
      icon: Zap, 
      count: categoryCounts['Top Selling'], 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      iconBg: 'bg-emerald-100',
      border: 'border-emerald-200/60',
      ring: 'ring-emerald-500',
      shadow: 'shadow-emerald-900/5'
    },
    { 
      name: 'Slow Moving', 
      desc: 'Low monthly sales volume',
      icon: PackageMinus, 
      count: categoryCounts['Slow Moving'], 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      iconBg: 'bg-amber-100',
      border: 'border-amber-200/60',
      ring: 'ring-amber-500',
      shadow: 'shadow-amber-900/5'
    },
    { 
      name: 'Declining', 
      desc: 'Sales dropping vs last 30 days',
      icon: TrendingDown, 
      count: categoryCounts['Declining'], 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      iconBg: 'bg-rose-100',
      border: 'border-rose-200/60',
      ring: 'ring-rose-500',
      shadow: 'shadow-rose-900/5'
    },
    { 
      name: 'Untapped', 
      desc: 'Zero sales recorded yet',
      icon: Filter, 
      count: categoryCounts['Untapped'], 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      iconBg: 'bg-indigo-100',
      border: 'border-indigo-200/60',
      ring: 'ring-indigo-500',
      shadow: 'shadow-indigo-900/5'
    },
  ];

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-2">
      
      {/* Category Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(isActive ? 'All' : cat.name)}
              className={`group relative overflow-hidden p-6 rounded-2xl border text-left transition-all duration-300 ease-out ${cat.bg} ${cat.border} ${
                isActive 
                  ? `ring-2 ring-offset-2 ${cat.ring} shadow-lg ${cat.shadow} scale-[1.02] z-10` 
                  : `shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-opacity-100`
              }`}
            >
              {/* Decorative background blob */}
              <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-60 blur-3xl ${cat.iconBg} transition-opacity duration-300 ${isActive ? 'opacity-100' : ''}`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 ${cat.iconBg}`}>
                    <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  </div>
                  <span className={`text-4xl font-extrabold tracking-tight ${cat.color} opacity-90`}>
                    {cat.count}
                  </span>
                </div>
                <h3 className={`text-lg font-bold tracking-tight ${cat.color}`}>
                  {cat.name}
                </h3>
                <p className={`text-sm font-medium mt-1 ${cat.color} opacity-75`}>
                  {cat.desc}
                </p>
                <div className={`mt-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${cat.color}`}>
                  <span>{isActive ? 'Clear Filter' : 'Filter Table'}</span>
                  <span className="text-lg leading-none">&rarr;</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {totalAnomalies > 0 && (
        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-red-800 pt-0.5">
            <h4 className="font-bold text-base mb-1 tracking-tight">Price Anomalies Detected</h4>
            <p className="text-sm text-red-700/90 leading-relaxed">
              We found <strong>{totalAnomalies}</strong> instances where products were sold below their purchase rate. 
              Expand the rows with warning icons in the table below to investigate these transactions.
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Profitability Matrix</h3>
            <p className="text-sm font-medium text-slate-500">Monthly Volume vs Average Margin (%)</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" dataKey="monthlySale" name="Monthly Sales" tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis type="number" dataKey="margin" name="Margin" unit="%" tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} axisLine={false} tickLine={false} tickMargin={10} />
                <ZAxis type="number" dataKey="revenue" range={[60, 500]} name="Revenue" />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                <Scatter name="Products" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Top Performers by Revenue</h3>
            <p className="text-sm font-medium text-slate-500">Highest grossing products across selected time</p>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPerformers} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 13, fontWeight: 600, fill: '#334155'}} width={110} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={28}>
                  {topPerformers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
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
