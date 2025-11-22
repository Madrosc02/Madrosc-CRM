import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    width?: string;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, width = 'max-w-2xl' }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={`relative w-full ${width} bg-white dark:bg-[var(--color-surface-dark)] h-full shadow-2xl flex flex-col animate-slide-in-right`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-light)] dark:border-[var(--color-border-dark)]">
                    <h2 className="text-xl font-semibold font-serif text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)]">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] transition-colors"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Drawer;
