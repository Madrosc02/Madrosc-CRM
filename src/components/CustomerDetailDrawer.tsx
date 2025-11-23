import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Sale, Remark, CustomerFormData } from '../types';
import Spinner from './ui/Spinner';
import Drawer from './ui/Drawer';
import GoalsTab from './GoalsTab';
import { CustomerOverview, EditDetailsForm } from './customer/CustomerOverview';
import { CustomerSales } from './customer/CustomerSales';
import { CustomerTasks } from './customer/CustomerTasks';
import { CustomerRemarks } from './customer/CustomerRemarks';
import { CustomerActions } from './customer/CustomerActions';

export const CustomerDetailDrawer: React.FC = () => {
    const { detailModalCustomer, closeDetailModal, getSalesForCustomer, getRemarksForCustomer, updateCustomer, deleteCustomer, customers } = useApp();
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
            setActiveTab('overview');
        }
    }, [customer, detailModalCustomer, fetchData]);

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

    if (!customer) return null;

    const TABS = [
        { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
        { id: 'goals', label: 'Goals', icon: 'fa-bullseye' },
        { id: 'sales', label: 'Sales History', icon: 'fa-chart-area' },
        { id: 'remarks', label: 'Remarks', icon: 'fa-comments' },
        { id: 'tasks', label: 'Tasks', icon: 'fa-tasks' },
        { id: 'actions', label: 'Quick Actions', icon: 'fa-bolt' },
    ];

    return (
        <Drawer
            isOpen={!!detailModalCustomer}
            onClose={closeDetailModal}
            title={customer.name}
            width="max-w-4xl"
        >
            <div className="flex flex-col">
                {/* Header Actions */}
                <div className="flex justify-end mb-4">
                    <button onClick={handleDelete} className="text-sm text-red-500 hover:underline flex items-center">
                        <i className="fas fa-trash-alt mr-2"></i> Delete Customer
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] mb-6">
                    <div className="flex space-x-1 overflow-x-auto pb-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsEditMode(false); }}
                                className={`py-2 px-4 font-medium text-sm rounded-t-md transition-colors duration-200 flex-shrink-0 border-b-2 ${activeTab === tab.id
                                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                    : 'border-transparent text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] hover:text-[var(--color-text-primary-light)] dark:hover:text-[var(--color-text-primary-dark)] hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <i className={`fas ${tab.icon} mr-2`}></i>{tab.label}
                            </button>
                        ))}
                    </div>
                </div>


                {/* Body */}
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Spinner />
                        </div>
                    ) : (
                        <div className="animate-fade-in">
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
            </div>
        </Drawer>
    );
};

export default CustomerDetailDrawer;
