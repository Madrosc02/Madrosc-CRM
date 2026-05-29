import React from 'react';
import { BarChart3, DollarSign, Users, MapPin } from 'lucide-react';

export interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'sales', label: 'Sales & Revenue', icon: DollarSign },
  { id: 'customers', label: 'Clients & Risk', icon: Users },
  { id: 'territory', label: 'Territory & Performance', icon: MapPin },
];

export function AnalyticsTabs({ activeTab, setActiveTab }: AnalyticsTabsProps) {
  return (
    <div className="flex items-center p-1 bg-slate-100 rounded-lg w-fit mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              isActive
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AnalyticsTabs;
