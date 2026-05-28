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
  gradient, trend, trendValue, className = '', onClick, sparklineData 
}) => {
  const animatedValue = useCountUp(value, 2000);

  // Format the animated value
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(animatedValue);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${gradient} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 rounded-full bg-black opacity-5 blur-xl"></div>

      {sparklineData && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} dot={false} isAnimationActive={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">
            {prefix}{formattedValue}{suffix}
          </h3>

          {trend && (
            <div className="flex items-center mt-2 space-x-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-white/20 text-white' : 'bg-red-500/20 text-white'}`}>
                <i className={`fas fa-arrow-${trend} mr-1`}></i> {trendValue}
              </span>
              <span className="text-xs text-white/60">vs last month</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <i className={`fas ${icon} text-2xl text-white`}></i>
        </div>
      </div>
    </div>
  );
};

export default StatCard;