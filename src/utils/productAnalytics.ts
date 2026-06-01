import { Product, Invoice, Customer } from '../types';

export interface BuyerInfo {
  customerId: string;
  customerName: string;
  quantity: number;
  revenue: number;
  averageMargin: number;
  lastPurchaseDate: string;
}

export interface ProductMetrics {
  productId: string;
  totalSoldQty: number;
  totalRevenue: number;
  averageMarginPercent: number | null; // null if never sold
  averageMonthlySale: number;
  trend: 'up' | 'down' | 'flat';
  trendPercentage: number;
  category: 'Top Selling' | 'Slow Moving' | 'Declining' | 'Stable' | 'Untapped';
  priceAnomalies: number; // Count of times sold below PTR
  lastSoldDate: string | null;
  buyers: BuyerInfo[];
}

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export function calculateProductMetrics(
  products: Product[], 
  invoices: Invoice[], 
  customers: Customer[],
  dateRange?: { start: string; end: string }
): Map<string, ProductMetrics> {
  const metricsMap = new Map<string, ProductMetrics>();
  
  // Initialize metrics for all products
  products.forEach(p => {
    metricsMap.set(p.id, {
      productId: p.id,
      totalSoldQty: 0,
      totalRevenue: 0,
      averageMarginPercent: null,
      averageMonthlySale: 0,
      trend: 'flat',
      trendPercentage: 0,
      category: 'Untapped',
      priceAnomalies: 0,
      lastSoldDate: null,
      buyers: []
    });
  });

  // Filter invoices by date range if provided
  const filteredInvoices = dateRange 
    ? invoices.filter(inv => {
        const d = new Date(inv.date);
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        // Set hours to include the full end day
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      })
    : invoices;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Temporary structures for calculations
  const productMargins: { [id: string]: number[] } = {};
  const recentSales: { [id: string]: number } = {}; // 0-30 days
  const previousSales: { [id: string]: number } = {}; // 30-60 days
  
  // Buyer tracking: productId -> customerId -> BuyerInfo
  const buyerTracking: { [pid: string]: { [cid: string]: { qty: number, rev: number, margins: number[], lastDate: string } } } = {};

  // Helper to find matching product
  const productLookup = products.map(p => ({
    ...p,
    normalizedName: normalizeName(p.brandName)
  }));

  const findProduct = (invoiceItemName: string) => {
    const norm = normalizeName(invoiceItemName);
    // Exact match first
    let match = productLookup.find(p => p.normalizedName === norm);
    if (match) return match;
    // Includes match
    match = productLookup.find(p => norm.includes(p.normalizedName) || p.normalizedName.includes(norm));
    return match;
  };

  // Process all filtered invoices
  filteredInvoices.forEach(invoice => {
    const invDate = new Date(invoice.date);
    
    invoice.items.forEach(item => {
      const product = findProduct(item.productName);
      if (!product) return; // Unmatched product
      
      const pid = product.id;
      const metrics = metricsMap.get(pid)!;
      
      // Update totals
      metrics.totalSoldQty += item.quantity;
      metrics.totalRevenue += item.amount;
      
      // Update last sold date
      if (!metrics.lastSoldDate || new Date(metrics.lastSoldDate) < invDate) {
        metrics.lastSoldDate = invoice.date;
      }

      // Check for price anomaly (Sold below Purchase Rate)
      if (item.rate < product.purchaseRate) {
        metrics.priceAnomalies += 1;
      }

      // Calculate margin strictly on GST rate vs Cost
      let margin = 0;
      if (item.rate > 0 && product.purchaseRate > 0) {
        margin = ((item.rate - product.purchaseRate) / item.rate) * 100;
        if (!productMargins[pid]) productMargins[pid] = [];
        productMargins[pid].push(margin);
      }

      // Track buyer
      if (!buyerTracking[pid]) buyerTracking[pid] = {};
      if (!buyerTracking[pid][invoice.customerId]) {
        buyerTracking[pid][invoice.customerId] = { qty: 0, rev: 0, margins: [], lastDate: invoice.date };
      }
      
      const bTracker = buyerTracking[pid][invoice.customerId];
      bTracker.qty += item.quantity;
      bTracker.rev += item.amount;
      if (margin !== 0) bTracker.margins.push(margin);
      if (new Date(invoice.date) > new Date(bTracker.lastDate)) {
        bTracker.lastDate = invoice.date;
      }

      // Trends
      if (invDate >= thirtyDaysAgo) {
        recentSales[pid] = (recentSales[pid] || 0) + item.quantity;
      } else if (invDate >= sixtyDaysAgo && invDate < thirtyDaysAgo) {
        previousSales[pid] = (previousSales[pid] || 0) + item.quantity;
      }
    });
  });

  // Determine earliest invoice date to calculate monthly average accurately
  const earliestDate = filteredInvoices.reduce((min, inv) => {
    const d = new Date(inv.date);
    return d < min ? d : min;
  }, now);
  
  const daysActive = Math.max(1, (now.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthsActive = daysActive / 30;

  // Finalize metrics
  metricsMap.forEach((metrics, pid) => {
    // Average Margin (Strict)
    const margins = productMargins[pid];
    if (margins && margins.length > 0) {
      metrics.averageMarginPercent = margins.reduce((a, b) => a + b, 0) / margins.length;
    } else {
      metrics.averageMarginPercent = null; // Removed MRP fallback
    }

    // Assign buyers list
    if (buyerTracking[pid]) {
      const pidBuyers = buyerTracking[pid];
      metrics.buyers = Object.keys(pidBuyers).map(cid => {
        const b = pidBuyers[cid];
        const cust = customers.find(c => c.id === cid);
        const avgMargin = b.margins.length > 0 ? b.margins.reduce((x, y) => x + y, 0) / b.margins.length : 0;
        return {
          customerId: cid,
          customerName: cust ? cust.firmName : 'Unknown Client',
          quantity: b.qty,
          revenue: b.rev,
          averageMargin: avgMargin,
          lastPurchaseDate: b.lastDate
        };
      }).sort((a, b) => b.quantity - a.quantity);
    }

    // Monthly Average
    metrics.averageMonthlySale = metrics.totalSoldQty / Math.max(1, monthsActive);

    // Trend Calculation
    const recent = recentSales[pid] || 0;
    const previous = previousSales[pid] || 0;
    
    if (previous === 0 && recent > 0) {
      metrics.trend = 'up';
      metrics.trendPercentage = 100;
    } else if (previous === 0 && recent === 0) {
      metrics.trend = 'flat';
      metrics.trendPercentage = 0;
    } else {
      const diff = ((recent - previous) / previous) * 100;
      metrics.trendPercentage = diff;
      if (diff > 10) metrics.trend = 'up';
      else if (diff < -10) metrics.trend = 'down';
      else metrics.trend = 'flat';
    }

    // Categorization
    if (metrics.totalSoldQty === 0) {
      metrics.category = 'Untapped';
    } else if (metrics.averageMonthlySale > 50 && metrics.trend !== 'down') { // Assuming >50 units/mo is Top Selling
      metrics.category = 'Top Selling';
    } else if (metrics.trend === 'down' && metrics.totalSoldQty > 0) {
      metrics.category = 'Declining';
    } else if (metrics.averageMonthlySale > 0 && metrics.averageMonthlySale < 10) {
      metrics.category = 'Slow Moving';
    } else {
      metrics.category = 'Stable';
    }
  });

  return metricsMap;
}
