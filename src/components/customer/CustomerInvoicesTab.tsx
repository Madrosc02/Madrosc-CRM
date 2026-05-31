import React, { useState, useEffect } from 'react';
import { Customer, Invoice, Payment } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { FileText, Plus, DollarSign, UploadCloud, RefreshCw } from 'lucide-react';
import { InvoiceUploadModal } from '../call-mode/InvoiceUploadModal';
import Spinner from '../ui/Spinner';

interface Props {
    customer: Customer;
}

export const CustomerInvoicesTab: React.FC<Props> = ({ customer }) => {
    const { getInvoicesForCustomer, getPaymentsForCustomer, addPaymentRecord } = useApp();
    const { addToast } = useToast();
    
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Add Manual Bill State
    const [isAddBillOpen, setIsAddBillOpen] = useState(false);
    const [billAmount, setBillAmount] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Add Payment State
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [invs, payms] = await Promise.all([
                getInvoicesForCustomer(customer.id),
                getPaymentsForCustomer(customer.id)
            ]);
            setInvoices(invs);
            setPayments(payms);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer.id]);

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addPaymentRecord({
                customerId: customer.id,
                amount: Number(paymentAmount),
                paymentMode,
                date: paymentDate
            });
            addToast("Payment recorded successfully", "success");
            setIsAddPaymentOpen(false);
            fetchData(); // refresh list
        } catch (e) {
            addToast("Failed to record payment", "error");
        }
    };

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { addInvoiceRecord } = await import('../../services/api');
            await addInvoiceRecord({
                customerId: customer.id,
                invoiceNo: `MANUAL-${Date.now().toString().slice(-4)}`,
                totalAmount: Number(billAmount),
                date: billDate,
                items: []
            });
            addToast("Manual bill recorded successfully", "success");
            setIsAddBillOpen(false);
            fetchData(); // refresh list
        } catch (e) {
            addToast("Failed to record manual bill", "error");
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">₹{customer.outstandingBalance.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => { setIsAddPaymentOpen(true); setIsAddBillOpen(false); }}
                        className="w-full flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
                    >
                        <DollarSign className="w-4 h-4" /> Receive Payment
                    </button>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setIsAddBillOpen(true); setIsAddPaymentOpen(false); }}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs font-semibold py-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Manual Bill
                        </button>
                        <button 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-semibold py-2 shadow-sm"
                        >
                            <UploadCloud className="w-4 h-4" /> PDF Invoice
                        </button>
                        <button 
                            onClick={fetchData}
                            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isAddBillOpen && (
                <form onSubmit={handleAddBill} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Add Manual Outstanding Bill</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                required
                                value={billAmount}
                                onChange={e => setBillAmount(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                value={billDate}
                                onChange={e => setBillDate(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700" 
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddBillOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md">Save Outstanding</button>
                    </div>
                </form>
            )}

            {isAddPaymentOpen && (
                <form onSubmit={handleAddPayment} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Record Payment Received</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                required
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Mode</label>
                            <select 
                                value={paymentMode}
                                onChange={e => setPaymentMode(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700"
                            >
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Bank Transfer</option>
                                <option>Cheque</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                value={paymentDate}
                                onChange={e => setPaymentDate(e.target.value)}
                                className="w-full p-2 border border-slate-200 rounded-md dark:bg-slate-800 dark:border-slate-700" 
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAddPaymentOpen(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-3 py-1.5 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-md">Save Payment</button>
                    </div>
                </form>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8"><Spinner /></div>
            ) : (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        Billing & Payment History
                    </h3>
                    
                    <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                        {/* Combine and sort Invoices and Payments */}
                        {[...invoices.map(i => ({...i, type: 'invoice'})), ...payments.map(p => ({...p, type: 'payment'}))]
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((item, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${item.type === 'invoice' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                                        {item.type === 'invoice' ? (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded uppercase">Billed</span>
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Invoice #{item.invoiceNo}</h4>
                                                    </div>
                                                    <p className="font-bold text-red-600">₹{item.totalAmount.toLocaleString()}</p>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-3">{new Date(item.date).toLocaleDateString()}</p>
                                                {item.pdfUrl && (
                                                    <a href={item.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm inline-flex items-center gap-1">
                                                        <FileText className="w-4 h-4" /> View PDF
                                                    </a>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded uppercase">Payment Received</span>
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mt-1">Via {item.paymentMode}</h4>
                                                    </div>
                                                    <p className="font-bold text-emerald-600">₹{item.amount.toLocaleString()}</p>
                                                </div>
                                                <p className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        }
                        
                        {invoices.length === 0 && payments.length === 0 && (
                            <p className="text-slate-500 text-sm italic pl-6">No billing history found.</p>
                        )}
                    </div>
                </div>
            )}
            
            <InvoiceUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => { setIsUploadModalOpen(false); fetchData(); }} 
                customerId={customer.id} 
            />
        </div>
    );
};
