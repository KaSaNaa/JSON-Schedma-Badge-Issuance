# JSON Schema Badge Issuance Automation

This project automates the issuance of digital badges to users who complete the JSON Schema Tour. It integrates with Google Sheets to track user data and Badgr API to issue the badges.

## Features

- Reads completion data from a Google Spreadsheet
- Issues badges automatically through Badgr API
- Updates spreadsheet with badge issuance status
- Comprehensive error handling and logging
- Retry logic for API calls
- Detailed validation of inputs and environment

## Setup

### Prerequisites

- Node.js (v14 or higher)
- A Google Service Account with access to Google Sheets API
- A Badgr API token
- A Badgr Badge Class ID

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/JSON-Schedma-Badge-Issuance.git
   cd JSON-Schedma-Badge-Issuance
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   # Badgr API credentials
   BADGR_API_TOKEN=your_badgr_api_token
   BADGR_BADGE_CLASS_ID=your_badge_class_id
   BADGR_ISSUER_ID=your_issuer_id

   # Google Sheets credentials
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
   GOOGLE_SHEET_ID=your_google_sheet_id

   # Optional configuration
   BADGE_ISSUED_COLUMN=C
   BADGE_ID_COLUMN=D
   TIMESTAMP_COLUMN=E
   ERROR_COLUMN=F
   ```

4. Set up your Google Spreadsheet with at least these columns:
   - Column A: Name
   - Column B: Email
   - Column C: Badge Issued (will be populated with "Yes" after issuance)

### Google Service Account Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account
5. Create and download a JSON key file for the service account
6. Share your Google Sheet with the service account email address (with editor permissions)

## Usage

Run the script to process all entries in the spreadsheet:

```bash
node index.js
```

### Scheduled Runs

To run the script periodically, you can set up a cron job. Example for running daily at midnight:

```bash
0 0 * * * cd /path/to/JSON-Schedma-Badge-Issuance && node index.js >> /path/to/logfile.log 2>&1
```

## Logging

Logs are stored in the `logs` directory, with a new file created for each day. All operations and errors are logged for traceability.

## Error Handling

The application includes:
- Input validation for all functions
- Environment variable validation
- Retry logic for API calls
- Detailed error logging
- Status tracking in the spreadsheet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Resources

- [JSON Schema Tour](https://github.com/json-schema-org/tour)
- [Badgr API Documentation](https://api.badgr.io/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)