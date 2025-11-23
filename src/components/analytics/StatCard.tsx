import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient, trend, trendValue, className = '' }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${gradient} ${className}`}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white opacity-10 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 rounded-full bg-black opacity-5 blur-xl"></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>

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