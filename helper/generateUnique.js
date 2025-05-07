const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

module.exports = {
    generateUniqueId,
};