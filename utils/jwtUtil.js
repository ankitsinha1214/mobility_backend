const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Function to generate a random secret key
const generateRandomSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Function to generate a JWT token
const generateToken = (userId) => {
    // const secretKey = generateRandomSecret();
    const JWT_SECRET = process.env.JWT_SECRET;
    const token = jwt.sign({ userId }, JWT_SECRET );
    // const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
    return { token };
};

module.exports = { generateToken };
