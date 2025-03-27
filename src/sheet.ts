const { google } = require('googleapis');
require('dotenv').config();

async function getSheetData() {
  const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A:D',  // Adjust the range as needed
  });
  return res.data.values;
}

async function updateSheet(row, col, value) {
  const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY });
  const range = `Sheet1!${col}${row}`;
  const resource = { values: [[value]] };

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource,
  });
}

module.exports = { getSheetData, updateSheet };
