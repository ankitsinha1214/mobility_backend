// loggerMiddleware.js
const logger = require('../logger');

const logRequest = (req, res, next) => {
  const { method, url } = req;
  const startTime = Date.now();

  res.on('finish', () => {
    const { statusCode } = res;
    const responseTime = Date.now() - startTime;
    const logMessage = `[${method}] ${url} - ${statusCode} [${responseTime}ms]`;

    if (statusCode >= 400 && statusCode < 600) {
        // const errorMessage = `[${method}] ${url} - ${statusCode}: ${err.message}`;
        // logger.error(errorMessage);
        logger.error(logMessage);
      } else {
        // Log other requests to combined.log
        logger.info(logMessage);
      }
    // Log details about the request
    // logger.info(`[${method}] ${url} - ${statusCode} [${responseTime}ms]`);
  });

  next();
};

module.exports = logRequest;
