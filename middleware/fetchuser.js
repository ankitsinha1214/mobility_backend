const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    // Get the token from the authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: "Token Not Found!" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        req.user = data.userId;
        console.log(req.user);
        next();
    } catch (error) {
        return res.status(401).json({ error: "Please Authenticate using a Valid Token." });
    }
};

module.exports = fetchUser;
