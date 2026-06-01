import React, { useMemo } from 'react';
import { Product } from '../../types';
import { ProductMetrics } from '../../utils/productAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Legend, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  products: Product[];
  metricsMap: Map<string, ProductMetrics>;
}

export const ProductAnalyticsDashboard: React.FC<Props> = ({ products, metricsMap }) => {
  // 1. Profitability Matrix Data (Scatter Plot: Margin vs Monthly Sales)
  const scatterData = useMemo(() => {
    return products.map(p => {
      const m = metricsMap.get(p.id);
      if (!m || m.averageMonthlySale === 0) return null;
      return {
        name: p.brandName,
        monthlySale: m.averageMonthlySale,
        margin: m.averageMarginPercent,
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

  // 3. Segment Performance (Pie Chart)
  const segmentData = useMemo(() => {
    const segmentMap = new Map<string, number>();
    products.forEach(p => {
      const m = metricsMap.get(p.id);
      if (!m || m.totalRevenue === 0) return;
      const seg = p.segment || 'General';
      segmentMap.set(seg, (segmentMap.get(seg) || 0) + m.totalRevenue);
    });
    
    return Array.from(segmentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
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

  // Find anomalies
  const totalAnomalies = Array.from(metricsMap.values()).reduce((sum, m) => sum + m.priceAnomalies, 0);

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-2">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-200" />
            <h3 className="font-semibold text-purple-100">Top Revenue Driver</h3>
          </div>
          <p className="text-2xl font-bold">{topPerformers[0]?.name || 'N/A'}</p>
          <p className="text-purple-200 text-sm mt-1">₹{topPerformers[0]?.revenue.toLocaleString() || '0'} lifetime revenue</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-slate-400" />
            <h3 className="font-semibold text-slate-300">Catalog Activity</h3>
          </div>
          <p className="text-2xl font-bold">{scatterData.length} active products</p>
          <p className="text-slate-400 text-sm mt-1">Selling across {segmentData.length} segments</p>
        </div>

        <div className={`rounded-2xl p-6 text-white shadow-lg ${totalAnomalies > 0 ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className={`w-6 h-6 ${totalAnomalies > 0 ? 'text-red-200' : 'text-emerald-200'}`} />
            <h3 className="font-semibold text-white/80">Price Anomalies</h3>
          </div>
          <p className="text-2xl font-bold">{totalAnomalies} instances</p>
          <p className="text-white/80 text-sm mt-1">
            {totalAnomalies > 0 ? 'Products sold below purchase rate!' : 'All sales have positive margin'}
          </p>
        </div>
      </div>

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
