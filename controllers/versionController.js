// CHECK Operation
exports.checkVersion = async (req, res) => {
    try {
        const { version } = req.query;

        if (!version) {
            return res.json({ status: false, message: 'Version parameter is required' });
        }
    
        const isMatch = version === process.env.APP_VERSION;
        var android_url = null;
        var iphone_url = null;
        // if(process.env.FORCE === 'true' && !isMatch){
        if(!isMatch){
            android_url = process.env.ANDROID_URL
            iphone_url = process.env.IPHONE_URL
        }
        return res.json({
            status: isMatch,
            force: process.env.FORCE === 'true',
            android_url,
            iphone_url
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