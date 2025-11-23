import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}

const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverEffect = true,
    onClick,
    style
}) => {
    return (
        <div
            onClick={onClick}
            style={style}
            className={`
                glass-card p-6 relative overflow-hidden
                ${hoverEffect ? 'hover:shadow-xl hover:-translate-y-1' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
