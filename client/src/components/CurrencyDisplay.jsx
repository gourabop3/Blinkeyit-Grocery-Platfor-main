import React from 'react';
import { DisplayPriceInRupees, DisplayPriceWithCustomSymbol } from '../utils/DisplayPriceInRupees';
import '../utils/CurrencyStyles.css';

const CurrencyDisplay = ({ price, variant = 'default', className = '' }) => {
    const numericPrice = Number(price) || 0;

    const renderCurrency = () => {
        switch (variant) {
            case 'highlight':
                return (
                    <span className={`currency-symbol-highlight ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
            
            case 'large':
                return (
                    <span className={`currency-inr-large ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
            
            case 'small':
                return (
                    <span className={`currency-inr-small ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
            
            case 'accent':
                return (
                    <span className={`currency-symbol-accent ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
            
            case 'bold':
                return (
                    <span className={`currency-symbol-bold ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
            
            case 'custom-after':
                return (
                    <span className={`currency-price-container ${className}`}>
                        {DisplayPriceWithCustomSymbol(numericPrice, { symbolPosition: 'after' })}
                    </span>
                );
            
            case 'no-decimals':
                return (
                    <span className={`currency-inr ${className}`}>
                        {DisplayPriceInRupees(numericPrice, { maximumFractionDigits: 0 })}
                    </span>
                );
            
            case 'with-decimals':
                return (
                    <span className={`currency-inr ${className}`}>
                        {DisplayPriceInRupees(numericPrice, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                );
            
            default:
                return (
                    <span className={`currency-inr ${className}`}>
                        {DisplayPriceInRupees(numericPrice)}
                    </span>
                );
        }
    };

    return renderCurrency();
};

// Example usage component
export const CurrencyExamples = () => {
    const samplePrice = 1250.50;

    return (
        <div className="p-6 space-y-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">INR Currency Display Examples</h3>
            
            <div className="grid gap-3">
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Default:</span>
                    <CurrencyDisplay price={samplePrice} />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Highlighted:</span>
                    <CurrencyDisplay price={samplePrice} variant="highlight" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Large:</span>
                    <CurrencyDisplay price={samplePrice} variant="large" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Small:</span>
                    <CurrencyDisplay price={samplePrice} variant="small" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Accent:</span>
                    <CurrencyDisplay price={samplePrice} variant="accent" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Bold:</span>
                    <CurrencyDisplay price={samplePrice} variant="bold" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">Symbol After:</span>
                    <CurrencyDisplay price={samplePrice} variant="custom-after" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">No Decimals:</span>
                    <CurrencyDisplay price={samplePrice} variant="no-decimals" />
                </div>
                
                <div className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="text-gray-600">With Decimals:</span>
                    <CurrencyDisplay price={samplePrice} variant="with-decimals" />
                </div>
            </div>
        </div>
    );
};

export default CurrencyDisplay;