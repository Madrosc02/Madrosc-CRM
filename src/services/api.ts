// services/api.ts
import { supabase } from '../lib/supabase';
import { Customer, Sale, Remark, Task, CustomerFormData, Goal, Milestone } from '../types';
import { analyzeRemarkSentiment } from './geminiService';

// --- HELPERS ---

// Map DB snake_case to frontend camelCase
const mapCustomer = (data: any): Customer => ({
    id: data.id,
    name: data.name,
    contact: data.contact,
    alternateContact: data.alternate_contact,
    avatar: data.avatar || `https://i.pravatar.cc/150?u=${data.id}`,
    tier: data.tier,
    state: data.state,
    district: data.district,
    salesThisMonth: Number(data.sales_this_month),
    avg6MoSales: Number(data.avg_6_mo_sales),
    outstandingBalance: Number(data.outstanding_balance),
    daysSinceLastOrder: Number(data.days_since_last_order),
    lastUpdated: data.last_updated,
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
            name: formData.name,
            contact: formData.contact,
            alternate_contact: formData.alternateContact,
            tier: formData.tier,
            state: formData.state,
            district: formData.district,
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
    if (updateData.name) dbUpdateData.name = updateData.name;
    if (updateData.contact) dbUpdateData.contact = updateData.contact;
    if (updateData.alternateContact) dbUpdateData.alternate_contact = updateData.alternateContact;
    if (updateData.tier) dbUpdateData.tier = updateData.tier;
    if (updateData.state) dbUpdateData.state = updateData.state;
    if (updateData.district) dbUpdateData.district = updateData.district;
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

export const bulkAddCustomers = async (newCustomersData: Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>[]): Promise<Customer[]> => {
    const dbData = newCustomersData.map(c => ({
        name: c.name,
        contact: c.contact,
        alternate_contact: c.alternateContact,
        tier: c.tier,
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
