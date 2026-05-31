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
            <SheetContent side="right" className="w-full sm:max-w-4xl p-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                {customer && (
                    <>
                        <SheetHeader className="px-6 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center justify-between">
                                <SheetTitle className="text-xl font-bold text-slate-800 dark:text-white">
                                    {customer.name}
                                </SheetTitle>
                                <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center mr-8">
                                    <i className="fas fa-trash-alt mr-2"></i> Delete
                                </button>
                            </div>
                            
                            {/* Tabs */}
                            <div className="flex space-x-1 overflow-x-auto pt-4 pb-0 scrollbar-hide">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveTab(tab.id); setIsEditMode(false); }}
                                        className={`py-2.5 px-4 font-medium text-sm rounded-t-lg transition-all duration-200 flex-shrink-0 border-b-2 ${activeTab === tab.id
                                            ? 'border-primary text-primary bg-primary/5'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
                                    </button>
                                ))}
                            </div>
                        </SheetHeader>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Spinner />
                                </div>
                            ) : (
                                <div className="animate-in fade-in duration-300">
                                    {activeTab === 'overview' && !isEditMode && <CustomerOverview customer={customer} sales={sales} remarks={remarks} onEditMode={() => setIsEditMode(true)} />}
                                    {isEditMode && <EditDetailsForm customer={customer} onCancel={() => setIsEditMode(false)} onSave={handleSave} />}
                                    {activeTab === 'goals' && <GoalsTab customer={customer} sales={sales} />}
                                    {activeTab === 'sales' && <CustomerSales sales={sales} />}
                                    {activeTab === 'remarks' && <CustomerRemarks customer={customer} remarks={remarks} onRemarkAdded={fetchData} />}
                                    {activeTab === 'tasks' && <CustomerTasks customerId={customer.id} />}
                                    {activeTab === 'actions' && <CustomerActions customer={customer} onSave={fetchData} />}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CustomerDetailDrawer;

