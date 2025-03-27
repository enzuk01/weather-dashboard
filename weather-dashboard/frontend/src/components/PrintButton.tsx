import React from 'react';
import { printDashboard } from '../utils/printUtils';
import { PrinterIcon } from '@heroicons/react/24/solid';

interface PrintButtonProps {
    title?: string;
    className?: string;
    iconOnly?: boolean;
}

const PrintButton: React.FC<PrintButtonProps> = ({
    title = "Weather Dashboard",
    className = "",
    iconOnly = false
}) => {
    const handlePrint = () => {
        printDashboard(title);
    };

    return (
        <button
            onClick={handlePrint}
            className={`p-2 rounded-full transition-colors bg-white/10 hover:bg-white/20 text-white ${className}`}
            aria-label="Print dashboard"
            title="Print dashboard"
        >
            {/* Fallback to emoji if heroicons isn't working */}
            {/* <PrinterIcon className="w-6 h-6" /> */}
            <span className="text-lg">🖨️</span>
            {!iconOnly && <span className="ml-2">Print</span>}
        </button>
    );
};

export default PrintButton;