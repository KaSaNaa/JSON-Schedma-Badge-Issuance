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

- Node.js (v16.x) - Specific version required
- A Google Service Account with access to Google Sheets API
- A Badgr API token
- A Badgr Badge Class ID

### Node.js Installation

#### Windows

1. Download the Node.js v16.x installer from [official Node.js website](https://nodejs.org/dist/latest-v16.x/)
2. Run the installer and follow the installation wizard
3. Verify installation by opening Command Prompt and typing:

   ```bash
   node --version
   npm --version
   ```

#### Linux (Ubuntu/Debian)

```bash
# Using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# Or using apt
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Linux (RHEL/CentOS/Fedora)

```bash
# Using NVM (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 16
nvm use 16

# Or using yum/dnf
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
```

### Google Service Account Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account
5. Create and download a JSON key file for the service account
6. Share your Google Sheet with the service account email address (with editor permissions)

### Project Installation

1. Clone this repository:

   ```bash
   # For Windows
   git clone https://github.com/KaSaNaa/JSON-Schedma-Badge-Issuance.git
   cd JSON-Schedma-Badge-Issuance
   
   # For Linux
   git clone https://github.com/KaSaNaa/JSON-Schedma-Badge-Issuance.git
   cd JSON-Schedma-Badge-Issuance
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   # Badgr API credentials
   BADGR_API_TOKEN=your_badgr_api_token
   BADGR_BADGE_CLASS_ID=your_badge_class_id
   BADGR_ISSUER_ID=your_issuer_id

   # Google Sheets credentials
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service_account_key.json
   GOOGLE_SHEET_ID=your_google_sheet_id

   # Optional configuration

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
