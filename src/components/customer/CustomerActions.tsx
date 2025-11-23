import React, { useState } from 'react';
import { Customer } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import EmailDrafter from '../ai/EmailDrafter';
import WhatsAppButton from './WhatsAppButton';

const inputStyle = "block w-full px-3 py-2 rounded-md bg-card-bg-light dark:bg-card-bg-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark transition-colors shadow-sm focus:outline-none focus:border-primary-light dark:focus:border-primary-dark focus:ring-2 focus:ring-primary-light/30 dark:focus:ring-primary-dark/30";
const btnPrimary = "px-4 py-2 font-medium text-white bg-primary-light dark:bg-primary-dark rounded-md transition-colors hover:bg-primary-hover-light dark:hover:bg-primary-hover-dark disabled:opacity-60 disabled:cursor-not-allowed";

export const CustomerActions: React.FC<{ customer: Customer, onSave: () => void }> = ({ customer, onSave }) => {
    const { addSale, addPayment, addBill } = useApp();
    const { addToast } = useToast();
    const [saleAmount, setSaleAmount] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [billAmount, setBillAmount] = useState('');
    const today = new Date().toISOString().split('T')[0];
    const [saleDate, setSaleDate] = useState(today);
    const [paymentDate, setPaymentDate] = useState(today);
    const [isSubmitting, setIsSubmitting] = useState<'sale' | 'payment' | 'bill' | null>(null);
    const [isEmailDrafterOpen, setIsEmailDrafterOpen] = useState(false);

    const handleAction = async (action: 'sale' | 'payment' | 'bill') => {
        setIsSubmitting(action);
        try {
            if (action === 'sale') {
                if (!saleAmount || !saleDate) {
                    addToast("Amount and date are required.", "error");
                    setIsSubmitting(null);
                    return;
                }
                await addSale(customer.id, parseFloat(saleAmount), new Date(saleDate).toISOString());
                addToast("Sale added!", "success");
                setSaleAmount('');
                setSaleDate(today);
            } else if (action === 'payment') {
                if (!paymentAmount || !paymentDate) {
                    addToast("Amount and date are required.", "error");
                    setIsSubmitting(null);
                    return;
                }
                await addPayment(customer.id, parseFloat(paymentAmount), new Date(paymentDate).toISOString());
                addToast("Payment recorded!", "success");
                setPaymentAmount('');
                setPaymentDate(today);
            } else {
                if (!billAmount) return;
                await addBill(customer.id, parseFloat(billAmount));
                addToast("Bill added!", "success");
                setBillAmount('');
            }
            onSave();
        } catch (e) {
            addToast(`Failed to perform action.`, "error");
        } finally {
            setIsSubmitting(null);
        }
    }

    return (
        <div className="space-y-4">
            {/* AI Actions */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-semibold mb-2 text-lg flex items-center text-blue-800 dark:text-blue-200">
                    <i className="fas fa-magic mr-2"></i> AI Tools
                </h4>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsEmailDrafterOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-white/10 text-blue-600 dark:text-blue-300 font-medium rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-white/20 transition-colors flex items-center justify-center"
                    >
                        <i className="fas fa-envelope-open-text mr-2"></i> Draft Smart Email
                    </button>
                    <WhatsAppButton
                        phoneNumber={customer.contact}
                        customerName={customer.name}
                        className="w-full sm:w-auto justify-center"
                    />
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg flex-grow">
                    <h4 className="font-semibold mb-2 text-lg">Add Sale</h4>
                    <div className="flex flex-wrap gap-2">
                        <input type="number" value={saleAmount} onChange={e => setSaleAmount(e.target.value)} placeholder="Amount" className={`${inputStyle} flex-grow`} />
                        <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className={`${inputStyle} flex-grow`} />
                        <button onClick={() => handleAction('sale')} disabled={isSubmitting === 'sale'} className={`${btnPrimary} whitespace-nowrap flex-grow sm:flex-grow-0`}>{isSubmitting === 'sale' ? 'Adding...' : 'Add Sale'}</button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg flex-grow">
                    <h4 className="font-semibold mb-2 text-lg">Record Payment</h4>
                    <div className="flex flex-wrap gap-2">
                        <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="Amount" className={`${inputStyle} flex-grow`} />
                        <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className={`${inputStyle} flex-grow`} />
                        <button onClick={() => handleAction('payment')} disabled={isSubmitting === 'payment'} className={`${btnPrimary} whitespace-nowrap flex-grow sm:flex-grow-0`}>{isSubmitting === 'payment' ? 'Recording...' : 'Record Payment'}</button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg flex-grow">
                    <h4 className="font-semibold mb-2 text-lg">Add Bill (Outstanding)</h4>
                    <div className="flex gap-2">
                        <input type="number" value={billAmount} onChange={e => setBillAmount(e.target.value)} placeholder="Amount" className={`${inputStyle} w-full`} />
                        <button onClick={() => handleAction('bill')} disabled={isSubmitting === 'bill'} className={`${btnPrimary} whitespace-nowrap`}>{isSubmitting === 'bill' ? 'Adding...' : 'Add Bill'}</button>
                    </div>
                </div>
            </div>

            <EmailDrafter
                isOpen={isEmailDrafterOpen}
                onClose={() => setIsEmailDrafterOpen(false)}
                customer={customer}
            />
        </div>
    )
}
