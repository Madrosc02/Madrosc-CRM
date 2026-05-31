// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Sale, Remark, CustomerFormData } from '../types';
import Spinner from './ui/Spinner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import GoalsTab from './GoalsTab';
import { CustomerOverview, EditDetailsForm } from './customer/CustomerOverview';
import { CustomerSales } from './customer/CustomerSales';
import { CustomerTasks } from './customer/CustomerTasks';
import { CustomerRemarks } from './customer/CustomerRemarks';
import { CustomerActions } from './customer/CustomerActions';
import { CustomerInvoicesTab } from './customer/CustomerInvoicesTab';

export const CustomerDetailDrawer: React.FC = () => {
    const { detailModalCustomer, closeDetailModal, getSalesForCustomer, getRemarksForCustomer, updateCustomer, deleteCustomer, customers, detailModalInitialTab } = useApp();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState('overview');
    const [isEditMode, setIsEditMode] = useState(false);
    const [sales, setSales] = useState<Sale[]>([]);
    const [remarks, setRemarks] = useState<Remark[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Derive customer from the main list to prevent stale data after updates.
    const customer = useMemo(() => {
        if (!detailModalCustomer) return null;
        return customers.find(c => c.id === detailModalCustomer.id) || detailModalCustomer;
    }, [customers, detailModalCustomer]);

    const fetchData = useCallback(async () => {
        if (!customer) return;
        setIsLoading(true);
        try {
            const [salesData, remarksData] = await Promise.all([
                getSalesForCustomer(customer.id),
                getRemarksForCustomer(customer.id),
            ]);
            setSales(salesData);
            setRemarks(remarksData);
        } catch (error) {
            console.error("Failed to fetch customer details", error);
            addToast("Could not load customer details.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [customer, getSalesForCustomer, getRemarksForCustomer, addToast]);

    useEffect(() => {
        if (customer) {
            fetchData();
        }
        if (detailModalCustomer?.id !== customer?.id) {
            setIsEditMode(false);
            // Set active tab from context, default to overview
            setActiveTab(detailModalInitialTab || 'overview');
        } else {
            // If customer is same (re-render), ensure tab is updated if it changed in context
            setActiveTab(detailModalInitialTab || 'overview');
        }
    }, [customer, detailModalCustomer, fetchData, detailModalInitialTab]);

    const handleSave = async (data: CustomerFormData) => {
        if (!customer) return;
        try {
            await updateCustomer(customer.id, data);
            addToast("Customer details updated!", "success");
            setIsEditMode(false);
        } catch (e) {
            addToast("Failed to update details.", "error");
        }
    }

    const handleDelete = async () => {
        if (!customer) return;
        if (window.confirm(`Are you sure you want to delete ${customer.name}? This action cannot be undone.`)) {
            try {
                await deleteCustomer(customer.id);
                addToast("Customer deleted.", "success");
                closeDetailModal();
            } catch (e) {
                addToast("Failed to delete customer.", "error");
            }
        }
    }

    const TABS = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
        { id: 'invoices', label: 'Invoices & Payments', icon: 'fa-file-invoice-dollar' },
        { id: 'goals', label: 'Goals', icon: 'fa-bullseye' },
        { id: 'sales', label: 'Sales History', icon: 'fa-chart-area' },
        { id: 'remarks', label: 'Remarks', icon: 'fa-comments' },
        { id: 'tasks', label: 'Tasks', icon: 'fa-tasks' },
        { id: 'actions', label: 'Quick Actions', icon: 'fa-bolt' },
    ];

    return (
        <Sheet
            open={!!detailModalCustomer}
            onOpenChange={(open) => !open && closeDetailModal()}
        >
            <SheetContent side="right" className="w-full sm:max-w-[600px] p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <SheetHeader className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <SheetTitle className="flex items-center gap-4">
                        <img src={customer?.avatar} alt={customer?.name} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-800 shadow-sm object-cover" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{customer?.firmName}</span>
                                {customer?.tier && (
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                        customer.tier === 'Platinum' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' :
                                        customer.tier === 'Gold' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                                        customer.tier === 'Silver' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' :
                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    }`}>
                                        {customer.tier}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">{customer?.personName}</span>
                        </div>
                    </SheetTitle>
                    
                    {/* TABS HEADER */}
                    <div className="flex gap-1 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-blue-600 text-white shadow-sm' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                <i className={`fas ${tab.icon}`}></i> {tab.label}
                            </button>
                        ))}
                    </div>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                        {customer && (
                            <>
                                {activeTab === 'overview' && (
                                    isEditMode ? (
                                        <EditDetailsForm customer={customer} onSave={handleSave} onCancel={() => setIsEditMode(false)} />
                                    ) : (
                                        <CustomerOverview customer={customer} sales={sales} remarks={remarks} onEdit={() => setIsEditMode(true)} onDelete={handleDelete} />
                                    )
                                )}
                                {activeTab === 'invoices' && <CustomerInvoicesTab customer={customer} />}
                                {activeTab === 'goals' && <GoalsTab customer={customer} sales={sales} />}
                                {activeTab === 'sales' && <CustomerSales customer={customer} sales={sales} />}
                                {activeTab === 'remarks' && <CustomerRemarks customer={customer} remarks={remarks} onRemarkAdded={fetchData} />}
                                {activeTab === 'tasks' && <CustomerTasks customer={customer} />}
                                {activeTab === 'actions' && <CustomerActions customer={customer} />}
                            </>
                        )}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CustomerDetailDrawer;

