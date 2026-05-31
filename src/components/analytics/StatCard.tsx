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
  onInfoClick?: (e: React.MouseEvent) => void;
  sparklineData?: { value: number }[];
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, label, value, prefix = '', suffix = '', decimals = 0, 
  gradient, trend, trendValue, className = '', onClick, onInfoClick, sparklineData
}) => {
  const animatedValue = useCountUp(value, 2000);

  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(animatedValue);

  // Default (Blue Theme)
  let colorTheme = 'text-blue-500 bg-blue-50/70';
  let badgeTheme = 'text-blue-600 bg-blue-50/80';
  let sparklineColor = '#3b82f6';
  
  if (gradient.includes('emerald') || gradient.includes('teal')) {
      colorTheme = 'text-amber-500 bg-amber-50/80'; 
      badgeTheme = 'text-amber-600 bg-amber-50/80';
      sparklineColor = '#f59e0b';
  } else if (gradient.includes('violet') || gradient.includes('purple')) {
      colorTheme = 'text-blue-500 bg-blue-50/70'; 
      badgeTheme = 'text-blue-600 bg-blue-50/80';
      sparklineColor = '#3b82f6';
  } else if (gradient.includes('rose') || gradient.includes('pink')) {
      colorTheme = 'text-purple-500 bg-purple-50/80'; 
      badgeTheme = 'text-purple-600 bg-purple-50/80';
      sparklineColor = '#a855f7';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[16px] border border-slate-200/70 p-4 pb-5 flex flex-col justify-between shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-md hover:border-slate-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-9 h-9 flex items-center justify-center rounded-[10px] ${colorTheme}`}>
          <i className={`fas ${icon} text-[15px]`}></i>
        </div>
        
        {/* Sparkline */}
        {sparklineData && (
          <div className="absolute right-6 top-1 w-20 h-10 pointer-events-none opacity-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={sparklineColor} 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {onInfoClick && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onInfoClick(e);
            }} 
            className="text-slate-400 hover:text-slate-600 transition-colors z-20 mt-1 mr-1 p-1 rounded-md hover:bg-slate-100 flex items-center gap-1"
            title="View Details"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider hidden sm:inline-block">View</span>
            <i className="far fa-list-alt text-[13px]"></i>
          </button>
        )}
      </div>

      <div className="relative z-10 mt-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</p>
        <h3 className="text-[26px] font-bold text-slate-800 mb-3 leading-none tracking-tight">
          {prefix}{formattedValue}{suffix}
        </h3>

        {trend && (
          <div className="flex items-center">
            <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/50 ${badgeTheme}`}>
              <i className={`fas ${trend === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'} text-[8px]`}></i>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;