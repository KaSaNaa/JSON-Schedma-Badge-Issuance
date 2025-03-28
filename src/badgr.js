const axios = require("axios");
require("dotenv").config();
const { logger } = require("./logger");

// Validate required environment variables
function validateEnvironment() {
  const requiredVars = [
    "BADGR_API_TOKEN",
    "BADGR_BADGE_CLASS_ID",
    "BADGR_ISSUER_ID",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function issueBadge(
  userName,
  userEmail,
  retryCount = 3,
  retryDelay = 1000
) {
  // Validate inputs
  if (!userName || typeof userName !== "string") {
    throw new Error("Invalid userName: must be a non-empty string");
  }

  if (!userEmail || !isValidEmail(userEmail)) {
    throw new Error(`Invalid userEmail: ${userEmail}`);
  }

  // Validate environment
  validateEnvironment();

  const url = `https://api.badgr.io/v2/badgeclasses/${process.env.BADGR_BADGE_CLASS_ID}/assertions`;
  logger.info({
    message: "Preparing badge issuance request",
    url,
    userName,
    userEmail: userEmail.substr(0, 3) + "***", // Log partial email for privacy
  });

  const data = {
    recipient: {
      identity: userEmail,
      type: "email",
      hashed: false,
    },
    issuedOn: new Date().toISOString(),
    narrative: `Badge issued to ${userName} for completing the JSON Schema Tour.`,
    evidence: [
      {
        type: ["Evidence"],
        narrative: "JSON Schema Tour completion",
      },
    ],
  };

  let lastError = null;

  // Retry logic
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${process.env.BADGR_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

      logger.info({
        message: "Badge issued successfully",
        userName,
        userEmail: userEmail.substr(0, 3) + "***",
        badgeId: response.data.result?.[0]?.entityId || "unknown",
      });

      return response.data;
    } catch (error) {
      lastError = error;

      // Enhanced error handling with detailed logging
      const errorDetails = {
        userName,
        userEmail: userEmail.substr(0, 3) + "***",
        timestamp: new Date().toISOString(),
        endpoint: url,
        attempt,
        maxAttempts: retryCount,
      };

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error({
          message: "Badgr API error response",
          status: error.response.status,
          data: error.response.data,
          ...errorDetails,
        });

        // Don't retry for client errors except rate limiting
        if (
          error.response.status >= 400 &&
          error.response.status < 500 &&
          error.response.status !== 429
        ) {
          break;
        }
      } else if (error.request) {
        // The request was made but no response was received
        logger.error({
          message: "Badgr API no response",
          ...errorDetails,
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error({
          message: "Badgr API request setup error",
          error: error.message,
          ...errorDetails,
        });
      }

      // If this isn't the last attempt, wait before retrying
      if (attempt < retryCount) {
        logger.info({
          message: `Retrying badge issuance (attempt ${
            attempt + 1
          }/${retryCount})`,
          delay: retryDelay,
          ...errorDetails,
        });
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        // Exponential backoff
        retryDelay *= 2;
      }
    }
  }

  // If we got here, all retries failed
  throw new Error(
    `Failed to issue badge to ${userEmail} after ${retryCount} attempts: ${lastError.message}`
  );
}

module.exports = { issueBadge, validateEnvironment, isValidEmail };
