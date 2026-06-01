import React from 'react';
import { BarChart3, DollarSign, Users, MapPin } from 'lucide-react';

export interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3, activeColor: 'text-indigo-700', activeBg: 'bg-indigo-100 ring-1 ring-indigo-200 shadow-sm', inactiveBg: 'bg-indigo-50/50 hover:bg-indigo-50', inactiveColor: 'text-indigo-600/70 hover:text-indigo-700' },
  { id: 'sales', label: 'Sales & Revenue', icon: DollarSign, activeColor: 'text-emerald-700', activeBg: 'bg-emerald-100 ring-1 ring-emerald-200 shadow-sm', inactiveBg: 'bg-emerald-50/50 hover:bg-emerald-50', inactiveColor: 'text-emerald-600/70 hover:text-emerald-700' },
  { id: 'customers', label: 'Clients & Risk', icon: Users, activeColor: 'text-rose-700', activeBg: 'bg-rose-100 ring-1 ring-rose-200 shadow-sm', inactiveBg: 'bg-rose-50/50 hover:bg-rose-50', inactiveColor: 'text-rose-600/70 hover:text-rose-700' },
  { id: 'territory', label: 'Territory & Performance', icon: MapPin, activeColor: 'text-purple-700', activeBg: 'bg-purple-100 ring-1 ring-purple-200 shadow-sm', inactiveBg: 'bg-purple-50/50 hover:bg-purple-50', inactiveColor: 'text-purple-600/70 hover:text-purple-700' },
];

export function AnalyticsTabs({ activeTab, setActiveTab }: AnalyticsTabsProps) {
  return (
    <div className="flex flex-wrap items-center p-2 bg-white border border-slate-100 rounded-2xl w-fit mb-6 gap-2 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              isActive
                ? `${tab.activeBg} ${tab.activeColor} scale-[1.02]`
                : `${tab.inactiveBg} ${tab.inactiveColor}`
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? tab.activeColor : 'opacity-70'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AnalyticsTabs;
