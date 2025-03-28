const { google } = require('googleapis');
const { logger } = require('./logger');
require('dotenv').config();

// Set global timeout at the Google API client level
google.options({
  timeout: 10000 // 10 seconds
});

// Validate required environment variables
function validateEnvironment() {
  const requiredVars = [
    "GOOGLE_SERVICE_ACCOUNT_KEY_PATH",
    "GOOGLE_SHEET_ID"
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

async function getAuth() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth;
  } catch (error) {
    logger.error({
      message: 'Error initializing Google auth',
      error: error.message
    });
    throw error;
  }
}

async function getSheetData(maxAttempts = 3) {
  let attempt = 1;
  
  while (attempt <= maxAttempts) {
    try {
      logger.info({
        message: 'Fetching sheet data',
        sheetId: process.env.GOOGLE_SHEET_ID,
        attempt
      });
      
      const auth = await getAuth();
      const sheets = google.sheets({ version: 'v4', auth });
      
      // IMPORTANT: Don't include timeout here - it's already set globally
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'Sheet1!A:D',  // Adjust the range as needed
      });
      
      return res.data.values;
    } catch (error) {
      logger.error({
        message: 'Error fetching sheet data',
        attempt,
        maxAttempts,
        error: error.message
      });
      
      if (attempt === maxAttempts) {
        throw new Error(`Failed to fetch sheet data after ${maxAttempts} attempts: ${error.message}`);
      }
      
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function updateSheet(row, col, value) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const range = `Sheet1!${col}${row}`;
    
    logger.info({
      message: 'Updating sheet',
      range,
      valueLength: value ? value.length : 0
    });
    
    const resource = { values: [[value]] };
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'RAW',
      resource,
    });
    
    return true;
  } catch (error) {
    logger.error({
      message: 'Error updating sheet',
      row,
      col,
      error: error.message
    });
    throw error;
  }
}

module.exports = { getSheetData, updateSheet, validateEnvironment };