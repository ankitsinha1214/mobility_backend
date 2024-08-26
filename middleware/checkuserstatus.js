const UserServiceAndMaintenance = require('../models/userSandmModel'); // Adjust the path as needed

// Middleware to check if user status is active
const checkUserStatus = async (req, res, next) => {
    const { userId } = req.body; // or from req.user if you're using authentication middleware

    try {
        const user = await UserServiceAndMaintenance.findById(userId);

        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        if (user.status !== 'Active') {
            return res.json({ status: false, message: 'User is Inactive' });
        }

        next();
    } catch (error) {
        console.error('Error checking user status:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

module.exports = checkUserStatus;
