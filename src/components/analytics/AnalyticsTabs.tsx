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
    <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-1 py-4 font-medium border-b-2 transition-all ${
              isActive
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default AnalyticsTabs;
