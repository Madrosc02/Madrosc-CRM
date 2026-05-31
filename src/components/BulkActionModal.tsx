import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useApp } from '../contexts/AppContext';

interface BulkActionModalProps {
    selectedCustomers: Customer[];
    onClose: () => void;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({ selectedCustomers, onClose }) => {
    const { isBulkActionModalOpen } = useApp();
    const [messageTemplate, setMessageTemplate] = useState("Hi [Name], this is a gentle reminder regarding an outstanding balance of ₹[Balance] on your account. Please let us know when we can expect payment.");
    
    // Status tracking for each customer: 'pending', 'sent'
    const [sendStatuses, setSendStatuses] = useState<Record<string, 'pending' | 'sent'>>({});

    useEffect(() => {
        if (selectedCustomers.length > 0) {
            const initialStatuses: Record<string, 'pending' | 'sent'> = {};
            selectedCustomers.forEach(c => initialStatuses[c.id] = 'pending');
            setSendStatuses(initialStatuses);
        }
    }, [selectedCustomers]);

    if (!isBulkActionModalOpen) return null;

    const generateMessage = (customer: Customer) => {
        let msg = messageTemplate;
        msg = msg.replace(/\[Name\]/gi, customer.personName || customer.firmName);
        msg = msg.replace(/\[Balance\]/gi, customer.outstandingBalance.toLocaleString('en-IN'));
        msg = msg.replace(/\[Firm\]/gi, customer.firmName);
        return encodeURIComponent(msg);
    };

    const handleSendWhatsApp = (customer: Customer) => {
        const cleanPhone = customer.contact.replace(/\D/g, '');
        if (!cleanPhone) {
            alert(`No valid phone number for ${customer.name}`);
            return;
        }
        const message = generateMessage(customer);
        const url = `https://wa.me/91${cleanPhone}?text=${message}`;
        window.open(url, '_blank');
        
        setSendStatuses(prev => ({ ...prev, [customer.id]: 'sent' }));
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl z-10 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                        <i className="fab fa-whatsapp text-green-500 mr-2 text-xl"></i>
                        Bulk WhatsApp Action
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6">
                    {/* Left: Template Editor */}
                    <div className="w-full md:w-1/2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message Template</label>
                            <textarea
                                value={messageTemplate}
                                onChange={(e) => setMessageTemplate(e.target.value)}
                                rows={6}
                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Available variables: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">[Name]</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">[Balance]</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">[Firm]</code>
                            </p>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1"><i className="fas fa-info-circle mr-1"></i> How this works</h4>
                            <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                                Browsers block websites from opening 50 tabs at once to prevent spam. 
                                Review your message template above, then quickly click "Send" down the list on the right. 
                                Each click will open a new WhatsApp Web tab with the personalized message ready to send.
                            </p>
                        </div>
                    </div>

                    {/* Right: Selected Clients List */}
                    <div className="w-full md:w-1/2 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-medium text-sm text-slate-700 dark:text-slate-300 flex justify-between">
                            <span>Selected Clients ({selectedCustomers.length})</span>
                            <span className="text-xs text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                {Object.values(sendStatuses).filter(s => s === 'sent').length} / {selectedCustomers.length} Sent
                            </span>
                        </div>
                        <div className="overflow-y-auto flex-1 h-[300px]">
                            {selectedCustomers.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No clients selected.</div>
                            ) : (
                                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {selectedCustomers.map(c => {
                                        const isSent = sendStatuses[c.id] === 'sent';
                                        return (
                                            <li key={c.id} className={`p-3 flex items-center justify-between transition-colors ${isSent ? 'bg-green-50/50 dark:bg-green-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className={`text-sm font-medium truncate ${isSent ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                                        {c.firmName}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        Bal: ₹{c.outstandingBalance.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleSendWhatsApp(c)}
                                                    className={`shrink-0 px-3 py-1.5 rounded text-xs font-semibold flex items-center transition-all ${
                                                        isSent 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'bg-primary text-white hover:bg-primary-hover shadow-sm'
                                                    }`}
                                                >
                                                    {isSent ? (
                                                        <><i className="fas fa-check mr-1.5"></i> Sent</>
                                                    ) : (
                                                        <><i className="fas fa-paper-plane mr-1.5"></i> Send</>
                                                    )}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkActionModal;
