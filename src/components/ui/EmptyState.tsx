import React from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon = 'fa-box-open', action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-[var(--color-border-light)] dark:border-[var(--color-border-dark)] rounded-lg bg-gray-50/50 dark:bg-white/5">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mb-4">
                <i className={`fas ${icon} text-3xl text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] opacity-50`}></i>
            </div>
            <h3 className="text-lg font-medium text-[var(--color-text-primary-light)] dark:text-[var(--color-text-primary-dark)] mb-1">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-[var(--color-text-secondary-light)] dark:text-[var(--color-text-secondary-dark)] max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
