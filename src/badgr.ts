const axios = require('axios');
require('dotenv').config();

async function issueBadge(userName, userEmail) {
  const url = 'https://api.badgr.io/v2/issuers/yourIssuerId/badgeclasses/yourBadgeClassId/issue';  // Replace with your actual endpoint
  const data = {
    recipient: {
      identity: userEmail,
      type: 'email',
    },
    evidence: 'JSON Schema Tour completion',
    // Add other required fields per Badgr docs
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${process.env.BADGR_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error issuing badge:', error.response ? error.response.data : error);
    throw error;
  }
}

module.exports = { issueBadge };
