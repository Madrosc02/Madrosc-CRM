import { ChevronDown, TrendingUp, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

interface InsightItem {
  id: string;
  name: string;
  location: string;
  metric: string;
}

const insights = [
  {
    id: '1',
    category: 'Engagement Opportunities',
    icon: TrendingUp,
    count: 8,
    items: [
      { id: 'a', name: '55ky Healthtech Nashik', location: 'Unknown', metric: 'Avg. ₹0' },
      { id: 'b', name: 'Aadinath Agency Surat', location: 'Unknown', metric: 'Avg. ₹0' },
      { id: 'c', name: 'Aakash Medical', location: 'Pune, MH', metric: 'Avg. ₹340' },
    ],
  },
  {
    category: 'No Sales This Month',
    icon: AlertTriangle,
    count: 136,
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    category: 'Sales Below Average',
    icon: AlertTriangle,
    count: 1,
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    category: 'Inactive (60+ Days)',
    icon: Clock,
    count: 0,
    badgeColor: 'bg-slate-100 text-slate-700',
  },
  {
    category: 'Potential Churn Risk',
    icon: AlertCircle,
    count: 6,
    badgeColor: 'bg-purple-100 text-purple-700',
  },
];

interface InsightCategoryProps {
  insight: typeof insights[0];
  expanded: boolean;
  onToggle: (category: string) => void;
}

function InsightCategory({ insight, expanded, onToggle }: InsightCategoryProps) {
  const Icon = insight.icon;

  return (
    <div key={insight.category} className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => onToggle(insight.category)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-slate-600" />
          <span className="font-semibold text-slate-900">{insight.category}</span>
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${insight.badgeColor || 'bg-blue-100 text-blue-700'}`}>
            {insight.count}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && insight.items && (
        <div className="bg-slate-50 px-6 py-4 space-y-3">
          {insight.items.map((item: InsightItem) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.location}</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.metric}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ActionableInsights: React.FC = () => {
  const [expanded, setExpanded] = useState<string>('Engagement Opportunities');

  const toggleExpanded = (category: string) => {
    setExpanded(expanded === category ? '' : category);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Actionable Insights</h3>
          <span className="text-xs text-slate-500">5 categories</span>
        </div>
      </div>

      <div>
        {insights.map((insight) => (
          <InsightCategory
            key={insight.category}
            insight={insight}
            expanded={expanded === insight.category}
            onToggle={toggleExpanded}
          />
        ))}
      </div>
    </div>
  );
};

export default ActionableInsights;