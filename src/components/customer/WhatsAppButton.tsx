import React, { useState } from 'react';

interface WhatsAppButtonProps {
    phoneNumber: string;
    customerName: string;
    className?: string;
}

const TEMPLATES = [
    { label: 'Order Update', text: 'Hello [Name], your order has been dispatched. You will receive the LR number shortly.' },
    { label: 'Payment Reminder', text: 'Hello [Name], this is a gentle reminder regarding the outstanding balance of your account. Please clear it at your earliest convenience.' },
    { label: 'Visit Follow-up', text: 'Hello [Name], thank you for your time today. Let me know if you need any more samples or information.' },
    { label: 'General Greeting', text: 'Hello [Name], hope you are doing well.' }
];

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber, customerName, className = '' }) => {
    const [showTemplates, setShowTemplates] = useState(false);

    const handleClick = (templateText?: string) => {
        // Clean phone number: remove non-digits, ensure country code (defaulting to +91 for India if missing)
        let cleanNumber = phoneNumber.replace(/\D/g, '');
        if (cleanNumber.length === 10) {
            cleanNumber = '91' + cleanNumber;
        }

        const text = templateText ? templateText.replace('[Name]', customerName) : '';
        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setShowTemplates(false);
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`btn-secondary flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 ${className}`}
                title="Chat on WhatsApp"
            >
                <i className="fab fa-whatsapp text-lg"></i>
                <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {showTemplates && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 focus:outline-none animate-fade-in">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Select Template
                        </div>
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.label}
                                onClick={() => handleClick(template.text)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                role="menuitem"
                            >
                                {template.label}
                            </button>
                        ))}
                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                        <button
                            onClick={() => handleClick()}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            role="menuitem"
                        >
                            Open Chat (No Template)
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay to close dropdown when clicking outside */}
            {showTemplates && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTemplates(false)}
                ></div>
            )}
        </div>
    );
};

export default WhatsAppButton;
