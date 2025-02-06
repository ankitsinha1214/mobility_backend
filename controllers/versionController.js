// CHECK Operation
exports.checkVersion = async (req, res) => {
    try {
        const { version } = req.query;

        if (!version) {
            return res.json({ status: false, message: 'Version parameter is required' });
        }
    
        const isMatch = version === process.env.APP_VERSION;
    
        res.json({
            status: isMatch,
            force: process.env.FORCE === 'true'
        });
    } catch (error) {
        console.error('Error checking version:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to check version.',
            error: error.message
        });
    }
};