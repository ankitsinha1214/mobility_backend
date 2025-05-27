const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
        case "INR":
            return "₹";  // Indian Rupee symbol
        case "USD":
            return "$";  // Dollar symbol
        case "AED":
            return "د.إ ";  // AED symbol
        default:
            return "";  // Return an empty string if the currency is not INR or USD
    }
};

module.exports = {
    getCurrencySymbol,
};