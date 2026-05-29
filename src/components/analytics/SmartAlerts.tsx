import React from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SmartAlerts() {
  return (
    <div className="space-y-4">
      {/* Smart Alerts Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Smart Alerts
          </h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
            2 Active
          </span>
        </div>

        {/* Overdue Tasks Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm mb-1">Overdue Tasks</p>
              <p className="text-xs text-slate-600 mb-3">
                You have 2 overdue tasks requiring attention.
              </p>
              <Button variant="link" className="text-orange-600 p-0 h-auto font-semibold text-xs">
                View Tasks →
              </Button>
            </div>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full whitespace-nowrap">
              2 New
            </span>
          </div>
        </div>

        {/* New Customers Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">👥</div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-sm mb-1">New Customers</p>
              <p className="text-xs text-slate-600 mb-3">
                134 new customers added recently.
              </p>
              <Button variant="link" className="text-blue-600 p-0 h-auto font-semibold text-xs">
                Onboard Now →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Powered Insights */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">AI Powered Insights</h3>
        </div>
        <p className="text-sm text-indigo-100 mb-6">
          Generate AI-powered recommendations from your live data.
        </p>
        <Button className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Insights
        </Button>
      </div>
    </div>
  );
}

export default SmartAlerts;
