import { useMemo } from 'react';
import { Customer, Invoice } from '../types';

export interface AIAction {
    priority: string;
    priorityColor: string;
    priorityBg: string;
    priorityIconBg: string;
    iconColor: string;
    title: string;
    desc: string;
    suggested: string;
    scriptSnippet: string;
}

export const useAIActions = (customer: Customer | undefined | null, invoices: Invoice[]) => {
    return useMemo(() => {
        if (!customer) return [];
        const actions: AIAction[] = [];

        // 1. Overdue Follow-up Trigger
        if (customer.daysSinceLastOrder && customer.daysSinceLastOrder > 30) {
            actions.push({
                priority: 'HIGH PRIORITY',
                priorityColor: 'text-red-600',
                priorityBg: 'bg-red-50 border-red-100',
                priorityIconBg: 'bg-red-100',
                iconColor: 'text-red-500',
                title: 'Overdue Follow-up',
                desc: `Customer hasn't ordered in ${customer.daysSinceLastOrder} days. Ask if they need a restock.`,
                suggested: 'Today, 2:00 PM',
                scriptSnippet: `Hi ${customer.name}, I noticed it's been about a month since your last order. How are your current stock levels looking?`
            });
        }

        // 2. Outstanding Balance Trigger
        if (customer.outstandingBalance && customer.outstandingBalance > 50000) {
            actions.push({
                priority: 'URGENT',
                priorityColor: 'text-rose-600',
                priorityBg: 'bg-rose-50 border-rose-100',
                priorityIconBg: 'bg-rose-100',
                iconColor: 'text-rose-500',
                title: 'High Outstanding Balance',
                desc: `Balance is ₹${customer.outstandingBalance.toLocaleString()}. Push for partial payment collection today.`,
                suggested: 'Immediate',
                scriptSnippet: `Hi ${customer.name}, just touching base regarding the outstanding balance of ₹${customer.outstandingBalance.toLocaleString()}. Can we expect a partial payment this week?`
            });
        }

        // 3. Cross-sell Trigger based on Invoices
        const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
        const boughtProducts = new Set();
        customerInvoices.forEach(inv => inv.items.forEach(item => boughtProducts.add(item.productName)));
        
        if (boughtProducts.has('MADRO CHARGE') && !boughtProducts.has('MADROSIP-LS')) {
            actions.push({
                priority: 'GROWTH OPPORTUNITY',
                priorityColor: 'text-purple-600',
                priorityBg: 'bg-purple-50 border-purple-100',
                priorityIconBg: 'bg-purple-100',
                iconColor: 'text-purple-500',
                title: 'Cross-Sell MADROSIP-LS',
                desc: `High volume of MADRO CHARGE detected. Pitch MADROSIP-LS with a 10% bundle discount.`,
                suggested: 'On Call',
                scriptSnippet: `Since you do so well with MADRO CHARGE, I'd highly recommend adding MADROSIP-LS to your lineup. I can offer a 10% bundle discount today.`
            });
        }

        // Fallback generic action if no specific triggers hit
        if (actions.length === 0) {
             actions.push({
                priority: 'MEDIUM PRIORITY',
                priorityColor: 'text-amber-600',
                priorityBg: 'bg-amber-50 border-amber-100',
                priorityIconBg: 'bg-amber-100',
                iconColor: 'text-amber-500',
                title: 'Routine Check-in',
                desc: `Check if they need any assistance with recent products.`,
                suggested: 'This week',
                scriptSnippet: `Hi ${customer.name}, just a quick routine check-in to see if you need any assistance or have questions about our latest products.`
            });
        }

        return actions.slice(0, 3);
    }, [customer, invoices]);
};
