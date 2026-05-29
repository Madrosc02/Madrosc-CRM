import React from 'react';
import { Button } from '@/components/ui/button';

const clients = [
  {
    rank: 1,
    name: 'Rajesh Pharma',
    location: 'Mumbai',
    amount: '₹4.2k',
  },
  {
    rank: 2,
    name: 'Sunrise Medicals',
    location: 'Delhi',
    amount: '₹3.8k',
  },
  {
    rank: 3,
    name: 'Aakash Medical',
    location: 'Pune',
    amount: '₹2.1k',
  },
];

export function TopClients() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Top Clients</h3>
        <Button variant="link" className="text-indigo-600 p-0 h-auto font-semibold text-sm">
          View All →
        </Button>
      </div>

      <div className="space-y-4">
        {clients.map((client) => (
          <div
            key={client.rank}
            className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center font-bold text-yellow-700 text-sm">
                {client.rank}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{client.name}</p>
                <p className="text-xs text-slate-500">{client.location}</p>
              </div>
            </div>
            <p className="font-bold text-slate-900">{client.amount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopClients;
