// // logger.js
// const { createLogger, format, transports } = require('winston');
// const { combine, timestamp, printf, colorize } = format;

// // Custom log format
// const logFormat = printf(({ level, message, timestamp }) => {
//     return `${timestamp} ${level}: ${message}`;
// });

// // Create a Winston logger
// const logger = createLogger({
//     level: 'info', // Default log level
//     format: combine(
//         timestamp(), // Add timestamps to log messages
//         colorize(),  // Add color based on log level
//         logFormat    // Use custom log format
//     ),
//     transports: [
//         new transports.Console(), // Log to the console
//         new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to error.log
//         new transports.File({ filename: 'logs/combined.log' }) // Log all levels to combined.log
//     ],
// });

// module.exports = logger;

const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json, simple } = format;

// Ensure logs folder exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Custom log format for console
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
    level: 'info',
    format: combine(timestamp(), json()), // file format (JSON for structure)
    transports: [
        new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDir, 'combined.log') })
    ]
});

// Add colorized console logs only in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combine(colorize(), timestamp(), simple(), logFormat)
    }));
}

// Override console.log and others to use winston
console.log = (...args) => {
    logger.info(args.map(String).join(' '));
};
console.error = (...args) => {
    logger.error(args.map(String).join(' '));
};
console.warn = (...args) => {
    logger.warn(args.map(String).join(' '));
};
console.info = (...args) => {
    logger.info(args.map(String).join(' '));
};

module.exports = logger;
