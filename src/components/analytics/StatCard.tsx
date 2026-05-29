import React from 'react';
import { useCountUp } from '../../hooks/useCountUp';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
  sparklineData?: { value: number }[];
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, label, value, prefix = '', suffix = '', decimals = 0, 
  gradient, trend, trendValue, className = '', onClick 
}) => {
  const animatedValue = useCountUp(value, 2000);

  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(animatedValue);

  // Extract color from gradient string for the icon background
  // Example gradient prop: "from-blue-500 to-blue-600" -> we just want a soft blue
  let colorTheme = 'text-indigo-600 bg-indigo-50';
  let badgeTheme = 'text-indigo-700 bg-indigo-50';
  if (gradient.includes('emerald') || gradient.includes('teal')) {
      colorTheme = 'text-orange-500 bg-orange-50'; // Warning color for pending orders
      badgeTheme = 'text-orange-700 bg-orange-50';
  } else if (gradient.includes('violet') || gradient.includes('purple')) {
      colorTheme = 'text-blue-500 bg-blue-50'; // Sales
      badgeTheme = 'text-blue-700 bg-blue-50';
  } else if (gradient.includes('rose') || gradient.includes('pink')) {
      colorTheme = 'text-purple-600 bg-purple-50'; // Outstanding
      badgeTheme = 'text-purple-700 bg-purple-50';
  }

  // Override trend badge based on trend direction
  if (trend === 'down') {
      badgeTheme = 'text-orange-700 bg-orange-50';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm transition-all duration-300 hover:shadow-md ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorTheme}`}>
          <i className={`fas ${icon} text-lg`}></i>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <i className="fas fa-info-circle"></i>
        </button>
      </div>

      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 mb-4">
          {prefix}{formattedValue}{suffix}
        </h3>

        {trend && (
          <div className="flex items-center">
            <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${badgeTheme}`}>
              <i className={`fas ${trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;