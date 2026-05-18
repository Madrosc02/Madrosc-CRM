import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';

interface CustomerNavigatorProps {
    currentIndex: number;
    totalCustomers: number;
    handlePrevious: () => void;
    handleNext: () => void;
}

export const CustomerNavigator: React.FC<CustomerNavigatorProps> = ({
    currentIndex,
    totalCustomers,
    handlePrevious,
    handleNext
}) => {
    return (
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-center gap-4 z-[100] sticky bottom-0 w-full">
            <button 
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "h-10 w-10 text-white hover:bg-slate-700 hover:text-white"
                )}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
                <div className="text-center">
                    <div className="text-sm font-semibold tracking-wider">CUSTOMER</div>
                    <div className="text-lg font-bold">{currentIndex + 1} / {totalCustomers}</div>
                </div>
            </div>
            <button 
                onClick={handleNext}
                disabled={currentIndex === totalCustomers - 1}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "h-10 px-8 py-2 bg-green-600 text-white hover:bg-green-700 font-semibold shadow-sm"
                )}
            >
                Next
            </button>
            <button 
                onClick={handleNext}
                disabled={currentIndex === totalCustomers - 1}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    "h-10 w-10 text-white hover:bg-slate-700 hover:text-white"
                )}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};
