'use client';

import React from 'react';

const productsData = [
  {
    rank: 1,
    name: 'Amoxicillin 500mg',
    units: '1,240 units sold',
    growth: '+12.3%',
    revenue: '₹8.4L'
  },
  {
    rank: 2,
    name: 'Paracetamol 650mg',
    units: '2,890 units sold',
    growth: '+5.1%',
    revenue: '₹6.2L'
  },
  {
    rank: 3,
    name: 'Metformin 500mg',
    units: '980 units sold',
    growth: '+18.7%',
    revenue: '₹5.8L'
  },
  {
    rank: 4,
    name: 'Atorvastatin 10mg',
    units: '720 units sold',
    growth: '-3.2%',
    revenue: '₹4.9L'
  },
  {
    rank: 5,
    name: 'Azithromycin 250mg',
    units: '860 units sold',
    growth: '+22.4%',
    revenue: '₹4.3L'
  }
];

export default function TopProductsByRevenue() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">Top Products by Revenue</h3>
          <p className="text-sm text-muted-foreground">MTD revenue in lakhs — sorted by contribution</p>
        </div>
        <span className="text-sm text-primary font-medium">7 SKUs</span>
      </div>

      <div className="space-y-4">
        {productsData.map((product) => (
          <div key={product.rank} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground w-6 text-center">
              {product.rank}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">{product.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{product.units}</p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
                  style={{
                    width: `${(product.rank === 1 ? 100 : product.rank === 2 ? 87 : product.rank === 3 ? 76 : product.rank === 4 ? 68 : 60)}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="text-right min-w-max">
              <p
                className={`text-xs font-medium mb-1 ${
                  product.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {product.growth}
              </p>
              <p className="text-sm font-semibold text-foreground">{product.revenue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
