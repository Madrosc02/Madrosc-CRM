import React from 'react';
import { Customer } from '../../types';

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    customers: Customer[];
    onCustomerClick: (customer: Customer) => void;
}

const DrillDownModal: React.FC<DrillDownModalProps> = ({ isOpen, onClose, title, customers, onCustomerClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {customers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No customers found in this segment.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {customers.map(customer => (
                                <div
                                    key={customer.id}
                                    onClick={() => onCustomerClick(customer)}
                                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                                >
                                    <img
                                        src={customer.avatar}
                                        alt={customer.name}
                                        className="w-10 h-10 rounded-full object-cover mr-4"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                            {customer.firmName || customer.name}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {customer.personName} • {customer.district}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                                            ₹{customer.salesThisMonth.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            This Month
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl text-right">
                    <span className="text-sm text-gray-500">
                        {customers.length} Customer{customers.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DrillDownModal;
