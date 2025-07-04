export const DisplayPriceInRupees = (price, options = {}) => {
    // Ensure we have a valid number
    const numericPrice = Number(price) || 0;
    
    // Default formatting options
    const defaultOptions = {
        style: 'currency',
        currency: 'INR',
        currencyDisplay: 'symbol', // This ensures ₹ symbol is used
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        ...options
    };
    
    // Format with Indian locale to get proper ₹ symbol and number formatting
    const formatted = new Intl.NumberFormat('en-IN', defaultOptions).format(numericPrice);
    
    return formatted;
}

// Alternative function for custom ₹ symbol placement
export const DisplayPriceWithCustomSymbol = (price, options = {}) => {
    const numericPrice = Number(price) || 0;
    const { 
        symbolPosition = 'before', // 'before' or 'after'
        showSymbol = true,
        decimalPlaces = 0,
        thousandSeparator = true
    } = options;
    
    let formattedNumber;
    
    if (thousandSeparator) {
        formattedNumber = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces
        }).format(numericPrice);
    } else {
        formattedNumber = numericPrice.toFixed(decimalPlaces);
    }
    
    if (!showSymbol) {
        return formattedNumber;
    }
    
    return symbolPosition === 'before' 
        ? `₹${formattedNumber}`
        : `${formattedNumber} ₹`;
}