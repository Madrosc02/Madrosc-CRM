// services/api.ts
import { supabase } from '../lib/supabase';
import { Customer, Sale, Remark, Task, CustomerFormData, Goal, Milestone, CustomerTerritory, UserSettings, HistoricalSnapshot, Invoice, InvoiceItem, Payment, Product, ProductFormData } from '../types';
import { analyzeRemarkSentiment } from './geminiService';

// --- HELPERS ---

// Map DB snake_case to frontend camelCase
const mapCustomer = (data: any): Customer => ({
    id: data.id,
    name: data.firm_name || data.name, // Use firm_name, fallback to name for backward compatibility
    firmName: data.firm_name || data.name,
    personName: data.person_name || '',
    email: data.email,
    contact: data.contact,
    alternateContact: data.alternate_contact,
    avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.id}`,
    tier: data.tier,
    monopolyStatus: data.monopoly_status || 'Non-Monopoly',
    state: data.state,
    district: data.district,
    salesThisMonth: Number(data.sales_this_month),
    avg6MoSales: Number(data.avg_6_mo_sales),
    outstandingBalance: Number(data.outstanding_balance),
    daysSinceLastOrder: Number(data.days_since_last_order),
    lastUpdated: data.last_updated,
    flag: data.flag,
    tags: data.tags || [],
});

const mapSale = (data: any): Sale => ({
    id: data.id,
    customerId: data.customer_id,
    amount: Number(data.amount),
    date: data.date,
});

const mapRemark = (data: any): Remark => ({
    id: data.id,
    customerId: data.customer_id,
    remark: data.remark,
    timestamp: data.timestamp,
    user: data.user || 'Sales Team',
    sentiment: data.sentiment,
});

const mapTask = (data: any): Task => ({
    id: data.id,
    customerId: data.customer_id,
    customerName: data.customer_name,
    task: data.task,
    dueDate: data.due_date,
    completed: data.completed,
});

const mapGoal = (data: any): Goal => ({
    id: data.id,
    customerId: data.customer_id,
    title: data.title,
    targetAmount: Number(data.target_amount),
    currentAmount: Number(data.current_amount),
    deadline: data.deadline,
    status: data.status,
});

const mapMilestone = (data: any): Milestone => ({
    id: data.id,
    goalId: data.goal_id,
    description: data.description,
    targetDate: data.target_date,
    completed: data.completed,
});

const mapUserSettings = (data: any): UserSettings => ({
    id: data.id,
    userId: data.user_id,
    monthlyRevenueTarget: Number(data.monthly_revenue_target),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
});

const mapHistoricalSnapshot = (data: any): HistoricalSnapshot => ({
    id: data.id,
    date: data.date,
    totalCustomers: Number(data.total_customers),
    activeCustomers: Number(data.active_customers),
    pendingOrders: Number(data.pending_orders),
    totalOutstanding: Number(data.total_outstanding),
    totalSales: Number(data.total_sales),
});

// --- CUSTOMER API ---

export const fetchCustomers = async (): Promise<Customer[]> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapCustomer);
};

export const fetchCustomerById = async (id: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return undefined;
    return mapCustomer(data);
};

export const addCustomer = async (formData: CustomerFormData): Promise<Customer> => {
    const { data, error } = await supabase
        .from('customers')
        .insert([{
            name: formData.firmName, // Keep for backward compatibility
            firm_name: formData.firmName,
            person_name: formData.personName,
            email: formData.email,
            contact: formData.contact,
            alternate_contact: formData.alternateContact,
            tier: formData.tier,
            monopoly_status: formData.monopolyStatus,
            state: formData.state,
            district: formData.district,
            tags: formData.tags || [],
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, // Temporary avatar logic
            last_updated: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return mapCustomer(data);
};

export const updateCustomer = async (customerId: string, updateData: Partial<CustomerFormData>): Promise<Customer> => {
    const dbUpdateData: any = {};
    if (updateData.firmName) {
        dbUpdateData.name = updateData.firmName; // Keep for backward compatibility
        dbUpdateData.firm_name = updateData.firmName;
    }
    if (updateData.personName) dbUpdateData.person_name = updateData.personName;
    if (updateData.email !== undefined) dbUpdateData.email = updateData.email;
    if (updateData.contact) dbUpdateData.contact = updateData.contact;
    if (updateData.alternateContact) dbUpdateData.alternate_contact = updateData.alternateContact;
    if (updateData.tier) dbUpdateData.tier = updateData.tier;
    if (updateData.monopolyStatus) dbUpdateData.monopoly_status = updateData.monopolyStatus;
    if (updateData.state) dbUpdateData.state = updateData.state;
    if (updateData.district) dbUpdateData.district = updateData.district;
    if (updateData.tags !== undefined) dbUpdateData.tags = updateData.tags;
    
    dbUpdateData.last_updated = new Date().toISOString();

    const { data, error } = await supabase
        .from('customers')
        .update(dbUpdateData)
        .eq('id', customerId)
        .select()
        .single();

    if (error) throw error;
    return mapCustomer(data);
};

export const deleteCustomer = async (customerId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

    if (error) throw error;
    return true;
};



export const deleteAllCustomers = async (): Promise<boolean> => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .not('id', 'is', null);

    if (error) throw error;
    return true;
};

export const bulkAddCustomers = async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]): Promise<Customer[]> => {
    const dbData = newCustomersData.map(c => ({
        name: c.firmName, // Keep for backward compatibility
        firm_name: c.firmName,
        person_name: c.personName,
        email: c.email,
        contact: c.contact,
        alternate_contact: c.alternateContact,
        tier: c.tier,
        monopoly_status: c.monopolyStatus,
        state: c.state,
        district: c.district,
        sales_this_month: c.salesThisMonth,
        avg_6_mo_sales: c.avg6MoSales,
        outstanding_balance: c.outstandingBalance,
        days_since_last_order: c.daysSinceLastOrder,
        last_updated: new Date().toISOString(),
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    }));

    const { data, error } = await supabase
        .from('customers')
        .insert(dbData)
        .select();

    if (error) throw error;
    return (data || []).map(mapCustomer);
};


// --- TRANSACTIONAL API ---

export const fetchSalesForCustomer = async (customerId: string): Promise<Sale[]> => {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSale);
};

export const fetchAllSales = async (): Promise<Sale[]> => {
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSale);
};

export const addSale = async (customerId: string, amount: number, date: string): Promise<Sale> => {
    // 1. Add Sale
    const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{ customer_id: customerId, amount, date }])
        .select()
        .single();

    if (saleError) throw saleError;

    // 2. Update Customer last_updated
    await supabase
        .from('customers')
        .update({ last_updated: new Date().toISOString() })
        .eq('id', customerId);

    return mapSale(saleData);
};

export const addPayment = async (customerId: string, amount: number, date: string): Promise<Customer> => {
    // 1. Fetch current balance
    const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('outstanding_balance')
        .eq('id', customerId)
        .single();

    if (fetchError) throw fetchError;

    const newBalance = (customer.outstanding_balance || 0) - amount;

    // 2. Update balance
    const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
            outstanding_balance: newBalance,
            last_updated: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();

    if (updateError) throw updateError;

    // 3. Add Remark
    await addRemark(customerId, `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${new Date(date).toLocaleDateString()}.`);

    return mapCustomer(updatedCustomer);
};

export const addBill = async (customerId: string, amount: number): Promise<Customer> => {
    // 1. Fetch current balance
    const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('outstanding_balance')
        .eq('id', customerId)
        .single();

    if (fetchError) throw fetchError;

    const newBalance = (customer.outstanding_balance || 0) + amount;

    // 2. Update balance
    const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
            outstanding_balance: newBalance,
            last_updated: new Date().toISOString()
        })
        .eq('id', customerId)
        .select()
        .single();

    if (updateError) throw updateError;

    // 3. Add Remark
    await addRemark(customerId, `Bill of ₹${amount.toLocaleString('en-IN')} added.`);

    return mapCustomer(updatedCustomer);
};


// --- REMARKS API ---

export const fetchRemarksForCustomer = async (customerId: string): Promise<Remark[]> => {
    const { data, error } = await supabase
        .from('remarks')
        .select('*')
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRemark);
};

export const fetchRemarks = async (): Promise<Remark[]> => {
    const { data, error } = await supabase
        .from('remarks')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500); // Limit to recent 500 remarks for performance

    if (error) throw error;
    return (data || []).map(mapRemark);
};

export const addRemark = async (customerId: string, remarkText: string): Promise<Remark> => {
    const sentimentResult = await analyzeRemarkSentiment(remarkText);

    const { data, error } = await supabase
        .from('remarks')
        .insert([{
            customer_id: customerId,
            remark: remarkText,
            sentiment: sentimentResult?.sentiment,
            user: 'Sales Team',
            timestamp: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return mapRemark(data);
};


// --- TASKS API ---

export const fetchTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapTask);
};

export const fetchTasksForCustomer = async (customerId: string): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('customer_id', customerId)
        .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapTask);
};

export const addTask = async (taskData: Omit<Task, 'id' | 'completed'>): Promise<Task> => {
    const { data, error } = await supabase
        .from('tasks')
        .insert([{
            customer_id: taskData.customerId,
            customer_name: taskData.customerName,
            task: taskData.task,
            due_date: taskData.dueDate,
            completed: false
        }])
        .select()
        .single();

    if (error) throw error;
    return mapTask(data);
};

export const toggleTaskComplete = async (taskId: string): Promise<Task | undefined> => {
    // 1. Get current status
    const { data: task, error: fetchError } = await supabase
        .from('tasks')
        .select('completed')
        .eq('id', taskId)
        .single();

    if (fetchError) throw fetchError;

    // 2. Toggle
    const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .select()
        .single();

    if (updateError) throw updateError;
    return mapTask(updatedTask);
};


// --- GOALS & MILESTONES API ---

export const fetchGoalsForCustomer = async (customerId: string): Promise<{ goals: Goal[], milestones: Milestone[] }> => {
    // Fetch goals
    const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('customer_id', customerId)
        .order('deadline', { ascending: false });

    if (goalsError) throw goalsError;

    const goals = (goalsData || []).map(mapGoal);
    const goalIds = goals.map(g => g.id);

    // Fetch milestones for these goals
    let milestones: Milestone[] = [];
    if (goalIds.length > 0) {
        const { data: milestonesData, error: milestonesError } = await supabase
            .from('milestones')
            .select('*')
            .in('goal_id', goalIds);

        if (milestonesError) throw milestonesError;
        milestones = (milestonesData || []).map(mapMilestone);
    }

    // Recalculate goal progress (simplified for now, ideally use DB aggregation or triggers)
    // For now, we trust the 'current_amount' in DB or recalculate if needed. 
    // Let's stick to DB value to keep it simple, assuming we update it on sales.
    // NOTE: In a real app, you'd want a trigger to update goal.current_amount on sales insert.

    return { goals, milestones };
};

export const addGoal = async (goalData: Omit<Goal, 'id' | 'currentAmount' | 'status'>): Promise<Goal> => {
    const { data, error } = await supabase
        .from('goals')
        .insert([{
            customer_id: goalData.customerId,
            title: goalData.title,
            target_amount: goalData.targetAmount,
            deadline: goalData.deadline,
            current_amount: 0,
            status: 'InProgress'
        }])
        .select()
        .single();

    if (error) throw error;
    return mapGoal(data);
};

export const updateCustomerTags = async (id: string, tags: string[]): Promise<void> => {
    const { error } = await supabase
        .from('customers')
        .update({ tags, last_updated: new Date().toISOString() })
        .eq('id', id);

    if (error) throw error;
};

export const deleteGoal = async (goalId: string): Promise<void> => {
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

    if (error) throw error;
};

export const addMilestone = async (milestoneData: Omit<Milestone, 'id' | 'completed'>): Promise<Milestone> => {
    const { data, error } = await supabase
        .from('milestones')
        .insert([{
            goal_id: milestoneData.goalId,
            description: milestoneData.description,
            target_date: milestoneData.targetDate,
            completed: false
        }])
        .select()
        .single();

    if (error) throw error;
    return mapMilestone(data);
};

export const toggleMilestoneComplete = async (milestoneId: string): Promise<Milestone | undefined> => {
    const { data: milestone, error: fetchError } = await supabase
        .from('milestones')
        .select('completed')
        .eq('id', milestoneId)
        .single();

    if (fetchError) throw fetchError;

    const { data: updatedMilestone, error: updateError } = await supabase
        .from('milestones')
        .update({ completed: !milestone.completed })
        .eq('id', milestoneId)
        .select()
        .single();

    if (updateError) throw updateError;
    return mapMilestone(updatedMilestone);
};


// --- TERRITORIES API ---

const mapTerritory = (data: any): CustomerTerritory => ({
    id: data.id,
    customerId: data.customer_id,
    state: data.state,
    district: data.district,
    monopolyStatus: data.monopoly_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
});

export const fetchTerritoriesForCustomer = async (customerId: string): Promise<CustomerTerritory[]> => {
    const { data, error } = await supabase
        .from('customer_territories')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapTerritory);
};

export const addTerritory = async (customerId: string, territory: Omit<CustomerTerritory, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>): Promise<CustomerTerritory> => {
    const { data, error } = await supabase
        .from('customer_territories')
        .insert([{
            customer_id: customerId,
            state: territory.state,
            district: territory.district,
            monopoly_status: territory.monopolyStatus,
        }])
        .select()
        .single();

    if (error) throw error;
    return mapTerritory(data);
};

export const updateTerritory = async (territoryId: string, updates: Partial<Omit<CustomerTerritory, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>): Promise<CustomerTerritory> => {
    const dbUpdates: any = {};
    if (updates.state) dbUpdates.state = updates.state;
    if (updates.district) dbUpdates.district = updates.district;
    if (updates.monopolyStatus) dbUpdates.monopoly_status = updates.monopolyStatus;

    const { data, error } = await supabase
        .from('customer_territories')
        .update(dbUpdates)
        .eq('id', territoryId)
        .select()
        .single();

    if (error) throw error;
    return mapTerritory(data);
};

export const deleteTerritory = async (territoryId: string): Promise<boolean> => {
    const { error } = await supabase
        .from('customer_territories')
        .delete()
        .eq('id', territoryId);

    if (error) throw error;
    return true;
};

export const updateCustomerFlag = async (customerId: string, flag: 'Green' | 'Red' | null): Promise<Customer> => {
    const { data, error } = await supabase
        .from('customers')
        .update({ flag, last_updated: new Date().toISOString() })
        .eq('id', customerId)
        .select()
        .single();

    if (error) throw error;
    return mapCustomer(data);
};

// --- SETTINGS API ---

export const fetchUserSettings = async (): Promise<UserSettings> => {
    // We get the single row for the authenticated user, or insert default if it doesn't exist
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) throw error;
    
    if (!data) {
        // Create default settings
        const { data: newData, error: insertError } = await supabase
            .from('user_settings')
            .insert([{ user_id: user.id, monthly_revenue_target: 2000 }])
            .select()
            .single();
        if (insertError) throw insertError;
        return mapUserSettings(newData);
    }
    
    return mapUserSettings(data);
};

export const updateUserSettings = async (target: number): Promise<UserSettings> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('user_settings')
        .update({ monthly_revenue_target: target, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) throw error;
    return mapUserSettings(data);
};

// --- HISTORICAL SNAPSHOTS API ---

export const fetchHistoricalSnapshots = async (): Promise<HistoricalSnapshot[]> => {
    const { data, error } = await supabase
        .from('historical_snapshots')
        .select('*')
        .order('date', { ascending: true }); // Chronological order

    if (error) throw error;
    return (data || []).map(mapHistoricalSnapshot);
};

export const addHistoricalSnapshot = async (snapshotData: Omit<HistoricalSnapshot, 'id' | 'date'>): Promise<HistoricalSnapshot> => {
    const { data, error } = await supabase
        .from('historical_snapshots')
        .insert([{
            total_customers: snapshotData.totalCustomers,
            active_customers: snapshotData.activeCustomers,
            pending_orders: snapshotData.pendingOrders,
            total_outstanding: snapshotData.totalOutstanding,
            total_sales: snapshotData.totalSales,
            date: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) throw error;
    return mapHistoricalSnapshot(data);
};

// --- INVOICE & PAYMENT API ---

export const uploadInvoicePdf = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `invoices/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
        .from('invoice_pdfs')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('invoice_pdfs')
        .getPublicUrl(filePath);

    return publicUrl;
};

const mapInvoiceItem = (dbData: any): InvoiceItem => ({
    id: dbData.id,
    invoiceId: dbData.invoice_id,
    productName: dbData.product_name,
    pack: dbData.pack,
    quantity: dbData.quantity,
    rate: dbData.rate,
    amount: dbData.amount
});

const mapInvoice = (dbData: any): Invoice => ({
    id: dbData.id,
    customerId: dbData.customer_id,
    invoiceNo: dbData.invoice_no,
    date: dbData.date,
    totalAmount: dbData.total_amount,
    pdfUrl: dbData.pdf_url,
    items: [],
    createdAt: dbData.created_at
});

export const addInvoiceRecord = async (invoice: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> => {
    const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([{
            customer_id: invoice.customerId,
            invoice_no: invoice.invoiceNo,
            date: invoice.date,
            total_amount: invoice.totalAmount,
            pdf_url: invoice.pdfUrl
        }])
        .select()
        .single();

    if (invError) throw invError;

    let itemsData: any[] = [];
    if (invoice.items && invoice.items.length > 0) {
        const itemsToInsert = invoice.items.map(item => ({
            invoice_id: invData.id,
            product_name: item.productName,
            pack: item.pack,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount
        }));

        const { data: insertedItems, error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert)
            .select();

        if (itemsError) throw itemsError;
        itemsData = insertedItems;
    }

    await addBill(invoice.customerId, invoice.totalAmount);

    return { ...mapInvoice(invData), items: itemsData.map(mapInvoiceItem) };
};

export const fetchInvoices = async (customerId: string): Promise<Invoice[]> => {
    const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

    if (invError) throw invError;

    return (invoicesData || []).map(inv => {
        const mapped = mapInvoice(inv);
        mapped.items = (inv.invoice_items || []).map(mapInvoiceItem);
        return mapped;
    });
};

const mapPaymentRecord = (dbData: any): Payment => ({
    id: dbData.id,
    customerId: dbData.customer_id,
    amount: dbData.amount,
    date: dbData.date,
    paymentMode: dbData.payment_mode,
    referenceNo: dbData.reference_no,
    createdAt: dbData.created_at
});

export const addPaymentRecord = async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    const { data, error } = await supabase
        .from('payments')
        .insert([{
            customer_id: payment.customerId,
            amount: payment.amount,
            date: payment.date,
            payment_mode: payment.paymentMode,
            reference_no: payment.referenceNo
        }])
        .select()
        .single();

    if (error) throw error;
    await addPayment(payment.customerId, payment.amount, payment.date);
    return mapPaymentRecord(data);
};

export const fetchPayments = async (customerId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', customerId)
        .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapPaymentRecord);
};

export const fetchAllInvoices = async (): Promise<Invoice[]> => {
    const { data: invoicesData, error: invError } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .order('date', { ascending: false });

    if (invError) throw invError;

    return (invoicesData || []).map(inv => {
        const mapped = mapInvoice(inv);
        mapped.items = (inv.invoice_items || []).map(mapInvoiceItem);
        return mapped;
    });
};

export const fetchAllPayments = async (): Promise<Payment[]> => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapPaymentRecord);
};

// --- PRODUCTS API (Mocked via LocalStorage for now) ---
const getLocalProducts = (): Product[] => {
    const data = localStorage.getItem('mock_products');
    return data ? JSON.parse(data) : [];
};

const setLocalProducts = (products: Product[]) => {
    localStorage.setItem('mock_products', JSON.stringify(products));
};

export const fetchProducts = async (): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(getLocalProducts()), 300);
    });
};

export const addProduct = async (formData: ProductFormData): Promise<Product> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = getLocalProducts();
            const newProduct: Product = {
                id: Math.random().toString(36).substring(2, 9),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setLocalProducts([newProduct, ...products]);
            resolve(newProduct);
        }, 300);
    });
};

export const bulkAddProducts = async (productsData: ProductFormData[]): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = getLocalProducts();
            const newProducts = productsData.map(data => ({
                id: Math.random().toString(36).substring(2, 9),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
            setLocalProducts([...newProducts, ...products]);
            resolve(newProducts);
        }, 500);
    });
};

export const updateProduct = async (id: string, updates: Partial<ProductFormData>): Promise<Product> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const products = getLocalProducts();
            const index = products.findIndex(p => p.id === id);
            if (index > -1) {
                products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
                setLocalProducts(products);
                resolve(products[index]);
            } else {
                reject(new Error("Product not found"));
            }
        }, 300);
    });
};

export const deleteProduct = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const products = getLocalProducts();
            setLocalProducts(products.filter(p => p.id !== id));
            resolve(true);
        }, 300);
    });
};
