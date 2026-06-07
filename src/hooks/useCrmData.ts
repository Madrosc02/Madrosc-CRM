// hooks/useCrmData.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../services/api';
import { Customer, Task, CustomerFormData, CustomerTier, Sale, Remark, UserSettings, HistoricalSnapshot, Product, ProductFormData } from '../types';

export interface Filters {
  tier: CustomerTier | '';
  state: string;
  sortBy: keyof Customer | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
}

export const useCrmData = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]); // To hold uploaded invoices
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [historicalSnapshots, setHistoricalSnapshots] = useState<HistoricalSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(true);
  const [crmError, setCrmError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({
    tier: '',
    state: '',
    sortBy: 'lastUpdated',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setIsAnalyticsLoading(true);
      try {
        // Load critical UI data first
        const [customersData, tasksData, productsData] = await Promise.all([
          api.fetchCustomers(),
          api.fetchTasks(),
          api.fetchProducts()
        ]);

        let settingsData = null;
        try {
          settingsData = await api.fetchUserSettings();
        } catch (err) {
          console.warn("Failed to fetch settings, using defaults.", err);
        }

        setCustomers(customersData);
        setProducts(productsData);
        setTasks(tasksData.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
        setUserSettings(settingsData);
        
        // Unblock the main UI immediately
        setLoading(false);

        // Fetch heavy analytics data in the background
        const [remarksData, salesData, invoicesData, paymentsData] = await Promise.all([
          api.fetchRemarks(),
          api.fetchAllSales(),
          api.fetchAllInvoices(),
          api.fetchAllPayments()
        ]);

        let snapshotsData: HistoricalSnapshot[] = [];
        try {
          snapshotsData = await api.fetchHistoricalSnapshots();
        } catch (err) {
          console.warn("Failed to fetch historical snapshots.", err);
        }

        setRemarks(remarksData);
        setSales(salesData);
        setInvoices(invoicesData);
        setAllPayments(paymentsData);
        setHistoricalSnapshots(snapshotsData);
        setIsAnalyticsLoading(false);

      } catch (error: any) {
        console.error("Failed to load CRM data", error);
        setCrmError(error.message || JSON.stringify(error));
        setLoading(false);
        setIsAnalyticsLoading(false);
      }
    };
    loadData();
  }, []);

  const setFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(customer => {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = customer.name.toLowerCase().includes(searchLower);
        const firmNameMatch = customer.firmName.toLowerCase().includes(searchLower);
        const personNameMatch = customer.personName.toLowerCase().includes(searchLower);
        const emailMatch = customer.email?.toLowerCase().includes(searchLower) || false;
        const contactMatch = customer.contact.toLowerCase().includes(searchLower);
        const stateMatch = customer.state.toLowerCase().includes(searchLower);
        const districtMatch = customer.district.toLowerCase().includes(searchLower);
        const tierMatch = filters.tier ? customer.tier === filters.tier : true;
        const filterStateMatch = filters.state ? customer.state === filters.state : true;

        return (nameMatch || firmNameMatch || personNameMatch || emailMatch || contactMatch || stateMatch || districtMatch) && tierMatch && filterStateMatch;
      })
      .sort((a, b) => {
        const field = filters.sortBy;
        const valA = a[field];
        const valB = b[field];

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          if (field === 'lastUpdated') {
            comparison = new Date(valB).getTime() - new Date(valA).getTime();
          } else {
            comparison = valA.localeCompare(valB);
          }
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valB - valA; // Default number sort is descending
        }

        return filters.sortOrder === 'asc' ? -comparison : comparison;
      });
  }, [customers, searchTerm, filters]);

  // --- MUTATION FUNCTIONS ---

  const addCustomer = useCallback(async (formData: CustomerFormData) => {
    try {
      const newCustomer = await api.addCustomer(formData);
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (customerId: string, updateData: Partial<CustomerFormData>) => {
    try {
      const updatedCustomer = await api.updateCustomer(customerId, updateData);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  }, [])

  const deleteCustomer = useCallback(async (customerId: string) => {
    try {
      await api.deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }, [])

  const deleteAllCustomers = useCallback(async () => {
    try {
      await api.deleteAllCustomers();
      setCustomers([]);
    } catch (error) {
      console.error("Error deleting all customers:", error);
      throw error;
    }
  }, [])

  const bulkAddCustomers = useCallback(async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]) => {
    try {
      const addedCustomers = await api.bulkAddCustomers(newCustomersData);
      setCustomers(prev => [...addedCustomers, ...prev]);
      return addedCustomers;
    } catch (error) {
      console.error("Error bulk adding customers:", error);
      throw error;
    }
  }, []);

  const addProduct = useCallback(async (formData: ProductFormData) => {
    try {
      const newProduct = await api.addProduct(formData);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (productId: string, updateData: Partial<ProductFormData>) => {
    try {
      const updatedProduct = await api.updateProduct(productId, updateData);
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  }, []);

  const bulkAddProducts = useCallback(async (productsData: ProductFormData[]) => {
    try {
      const addedProducts = await api.bulkAddProducts(productsData);
      setProducts(prev => [...addedProducts, ...prev]);
      return addedProducts;
    } catch (error) {
      console.error("Error bulk adding products:", error);
      throw error;
    }
  }, []);

  const addSale = useCallback(async (customerId: string, amount: number, date: string): Promise<Sale> => {
    try {
      const newSale = await api.addSale(customerId, amount, date);
      // Refetch customer to get updated sales figures
      const updatedCustomer = await api.fetchCustomerById(customerId);
      if (updatedCustomer) {
        setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      }
      // Also update sales list
      setSales(prev => [newSale, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      return newSale;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  }, [])

  const addRemark = useCallback(async (customerId: string, remarkText: string): Promise<Remark> => {
    try {
      const newRemark = await api.addRemark(customerId, remarkText);
      setRemarks(prev => [newRemark, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      return newRemark;
    } catch (error) {
      console.error("Error adding remark:", error);
      throw error;
    }
  }, [])

  const addPayment = useCallback(async (customerId: string, amount: number, date: string): Promise<Customer> => {
    try {
      const updatedCustomer = await api.addPayment(customerId, amount, date);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  }, [])

  const addBill = useCallback(async (customerId: string, amount: number): Promise<Customer> => {
    try {
      const updatedCustomer = await api.addBill(customerId, amount);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (error) {
      console.error("Error adding bill:", error);
      throw error;
    }
  }, [])

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'completed'>) => {
    try {
      const newTask = await api.addTask(taskData);
      setTasks(prev => [newTask, ...prev].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      throw error;
    }
  }, []);

  const toggleTaskComplete = useCallback(async (taskId: string) => {
    try {
      const updatedTask = await api.toggleTaskComplete(taskId);
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
      return updatedTask;
    } catch (error) {
      console.error("Error toggling task complete:", error);
      throw error;
    }
  }, []);

  const addInvoice = useCallback(async (invoice: any) => {
    try {
      const newInvoice = await api.addInvoiceRecord(invoice);
      setInvoices(prev => [newInvoice, ...prev]);

      // Refetch customer to reflect new balance
      const updatedCustomer = await api.fetchCustomerById(invoice.customerId);
      if (updatedCustomer) {
         setCustomers(prev => prev.map(c => c.id === invoice.customerId ? updatedCustomer : c));
      }
      
      // Auto-add a remark about this invoice
      await addRemark(invoice.customerId, `📄 Invoice ${invoice.invoiceNo} generated for ₹${invoice.totalAmount.toLocaleString('en-IN')}`);
      
      return newInvoice;
    } catch (error) {
      console.error("Error adding invoice:", error);
      throw error;
    }
  }, []);

  const addPaymentRecord = useCallback(async (payment: any) => {
    try {
      const newPayment = await api.addPaymentRecord(payment);
      
      // Refetch customer to reflect new balance
      const updatedCustomer = await api.fetchCustomerById(payment.customerId);
      if (updatedCustomer) {
         setCustomers(prev => prev.map(c => c.id === payment.customerId ? updatedCustomer : c));
      }

      await addRemark(payment.customerId, `💰 Payment of ₹${payment.amount.toLocaleString('en-IN')} received via ${payment.paymentMode}`);
      
      return newPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (target: number) => {
    try {
      const updated = await api.updateUserSettings(target);
      setUserSettings(updated);
      return updated;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }, []);

  const updateCustomerTags = useCallback(async (customerId: string, tags: string[]) => {
    try {
      await api.updateCustomerTags(customerId, tags);
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, tags } : c));
    } catch (error) {
      console.error("Error updating tags:", error);
      throw error;
    }
  }, []);

  const createSnapshot = useCallback(async () => {
    try {
      const activeCustomers = customers.filter(c => c.salesThisMonth > 0 || c.daysSinceLastOrder <= 30).length;
      const pendingOrders = tasks.filter(t => !t.completed).length; // Approximating pending orders from tasks for now
      const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
      const totalSalesThisMonth = customers.reduce((sum, c) => sum + (c.salesThisMonth || 0), 0);

      const newSnapshot = await api.addHistoricalSnapshot({
        totalCustomers: customers.length,
        activeCustomers,
        pendingOrders,
        totalOutstanding,
        totalSales: totalSalesThisMonth
      });
      setHistoricalSnapshots(prev => [...prev, newSnapshot].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      return newSnapshot;
    } catch (error) {
      console.error("Error creating snapshot:", error);
      throw error;
    }
  }, []);

  return {
    loading,
    isAnalyticsLoading,
    crmError,
    customers,
    products,
    tasks,
    remarks,
    sales,
    invoices, // Export invoices
    allPayments,
    userSettings,
    historicalSnapshots,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,

    // Actions
    addProduct,
    updateProduct,
    deleteProduct,
    bulkAddProducts,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    deleteAllCustomers,
    bulkAddCustomers,
    addSale,
    addRemark,
    addPayment,
    addBill,
    addTask,
    addInvoice, // Export addInvoice action
    toggleTaskComplete,
    updateSettings,
    createSnapshot,
    updateCustomerTags,
    addPaymentRecord,

    // Data Fetchers for Detail View
    getSalesForCustomer: api.fetchSalesForCustomer,
    getRemarksForCustomer: api.fetchRemarksForCustomer,
    getTasksForCustomer: api.fetchTasksForCustomer,
    getInvoicesForCustomer: api.fetchInvoices,
    getPaymentsForCustomer: api.fetchPayments,
    getAllSales: api.fetchAllSales,
    getGoalsForCustomer: api.fetchGoalsForCustomer,
    addGoal: api.addGoal,
    deleteGoal: api.deleteGoal,
    addMilestone: api.addMilestone,
    toggleMilestoneComplete: api.toggleMilestoneComplete,
    updateCustomerFlag: async (customerId: string, flag: 'Green' | 'Red' | null) => {
      try {
        const updatedCustomer = await api.updateCustomerFlag(customerId, flag);
        setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
        return updatedCustomer;
      } catch (error) {
        console.error("Error updating customer flag:", error);
        throw error;
      }
    },
  };
};
