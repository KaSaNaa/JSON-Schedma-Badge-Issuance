const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Simple logger with file and console output
const logger = {
  info: (data) => {
    const logEntry = formatLogEntry('INFO', data);
    console.log(logEntry);
    appendToLogFile(logEntry);
  },
  
  error: (data) => {
    const logEntry = formatLogEntry('ERROR', data);
    console.error(logEntry);
    appendToLogFile(logEntry);
  },
  
  warn: (data) => {
    const logEntry = formatLogEntry('WARN', data);
    console.warn(logEntry);
    appendToLogFile(logEntry);
  }
};

function formatLogEntry(level, data) {
  const timestamp = new Date().toISOString();
  if (typeof data === 'string') {
    return `[${timestamp}] ${level}: ${data}`;
  } else {
    const { message, ...rest } = data;
    return `[${timestamp}] ${level}: ${message} ${JSON.stringify(rest)}`;
  }
}

function appendToLogFile(logEntry) {
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `badge-issuance-${today}.log`);
  
  try {
    fs.appendFileSync(logFile, logEntry + '\n');
  } catch (error) {
    console.error(`Failed to write to log file: ${error.message}`);
  }
}

module.exports = { logger };
