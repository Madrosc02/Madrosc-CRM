import React from 'react';
import { BarChart3, DollarSign, Users, MapPin } from 'lucide-react';

export interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, activeColor: 'text-indigo-700', activeBg: 'bg-indigo-50', activeRing: 'ring-indigo-200/50' },
  { id: 'sales', label: 'Sales & Revenue', icon: DollarSign, activeColor: 'text-emerald-700', activeBg: 'bg-emerald-50', activeRing: 'ring-emerald-200/50' },
  { id: 'customers', label: 'Clients & Risk', icon: Users, activeColor: 'text-rose-700', activeBg: 'bg-rose-50', activeRing: 'ring-rose-200/50' },
  { id: 'territory', label: 'Territory & Performance', icon: MapPin, activeColor: 'text-purple-700', activeBg: 'bg-purple-50', activeRing: 'ring-purple-200/50' },
];

export function AnalyticsTabs({ activeTab, setActiveTab }: AnalyticsTabsProps) {
  return (
    <div className="flex flex-wrap items-center p-1.5 bg-slate-50/80 border border-slate-200/60 rounded-xl w-fit mb-6 gap-1 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
              isActive
                ? `${tab.activeBg} ${tab.activeColor} shadow-sm ring-1 ring-inset ${tab.activeRing} scale-[1.02]`
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? tab.activeColor : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AnalyticsTabs;
