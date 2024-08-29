const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    // Get the token from the authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({success: false, message: "Token Not Found!" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        req.user = data.userId;
        req.userid = data._id;
        req.phn = data.phoneNumber;
        // console.log(req);
        next();
    } catch (error) {
        return res.status(401).json({success:false, message: "Please Authenticate using a Valid Token." });
    }
};

module.exports = fetchUser;
