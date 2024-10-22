// logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create a Winston logger
const logger = createLogger({
    level: 'info', // Default log level
    format: combine(
        timestamp(), // Add timestamps to log messages
        colorize(),  // Add color based on log level
        logFormat    // Use custom log format
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to error.log
        new transports.File({ filename: 'logs/combined.log' }) // Log all levels to combined.log
    ],
});

module.exports = logger;
