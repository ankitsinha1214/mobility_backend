const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require('../models/userModel');
const SandmUser = require('../models/userSandmModel');

const fetchUser = async(req, res, next) => {
    // Get the token from the authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: "Token Not Found!" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        req.user = data.role;
        req.userid = data._id;
        req.phn = data.phoneNumber;
        if (data.phoneNumber) {
            // Optional: Verify if the user exists in the database (based on the phoneNumber or ID)
            const user = await User.findOne({ phoneNumber: data.phoneNumber });
            if (!user) {
                return res.status(401).json({ success: false, message: "User not found or Inactive." });
            }
        }
        if (data.role) {
            // console.log('hi')
            // Optional: Verify if the user exists in the database (based on the ID)
            const userId = data._id;
            const userSandm = await SandmUser.findOne({ _id: userId });
            if (!userSandm) {
                return res.status(401).json({ success: false, message: "User not found or Inactive." });
            }
            console.log(userSandm);
        }
        // console.log(req);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Please Authenticate using a Valid Token." });
    }
};

module.exports = fetchUser;
