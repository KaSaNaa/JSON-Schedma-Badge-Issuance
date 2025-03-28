const { getSheetData, updateSheet } = require('./src/sheet');
const { issueBadge } = require('./src/badgr');
const { logger } = require('./src/logger');
require('dotenv').config();

// Validate all environment variables at startup
function validateEnvironment() {
  try {
    // Import and run all validation functions
    require('./src/badgr').validateEnvironment();
    require('./src/sheet').validateEnvironment();
    logger.info('Environment validation passed');
    return true;
  } catch (error) {
    logger.error({
      message: 'Environment validation failed',
      error: error.message
    });
    return false;
  }
}

async function processBadges() {
  const startTime = new Date();
  logger.info({
    message: 'Starting badge issuance process',
    timestamp: startTime.toISOString()
  });
  
  // Statistics for reporting
  const stats = {
    total: 0,
    processed: 0,
    success: 0,
    alreadyIssued: 0,
    failed: 0,
    errors: []
  };
  
  try {
    // Validate environment variables first
    if (!validateEnvironment()) {
      throw new Error('Environment validation failed, exiting process');
    }
    
    // Get data from Google Sheet
    const rows = await getSheetData();
    
    // Skip header row
    stats.total = rows.length - 1;
    
    logger.info({
      message: `Found ${stats.total} entries in sheet`,
      issuedColumn: process.env.BADGE_ISSUED_COLUMN || 'C'
    });
    
    // Define which column contains the "badge issued" status
    const issuedColumn = process.env.BADGE_ISSUED_COLUMN || 'C';
    
    // Process each row starting from row 2 (after header)
    for (let i = 1; i < rows.length; i++) {
      // Ensure row has all required fields
      if (!rows[i] || rows[i].length < 3) {
        logger.warn({
          message: 'Skipping row with insufficient data',
          rowIndex: i,
          rowData: rows[i]
        });
        stats.failed++;
        stats.errors.push(`Row ${i+1}: Insufficient data`);
        continue;
      }
      
      const [name, email, badgeIssued] = rows[i];
      
      // Validate name and email
      if (!name || !email) {
        logger.warn({
          message: 'Skipping row with missing name or email',
          rowIndex: i,
          name: name || 'MISSING',
          hasEmail: !!email
        });
        stats.failed++;
        stats.errors.push(`Row ${i+1}: Missing name or email`);
        continue;
      }
      
      // Check if email is valid
      if (!require('./src/badgr').isValidEmail(email)) {
        logger.warn({
          message: 'Skipping row with invalid email',
          rowIndex: i,
          name,
          email
        });
        stats.failed++;
        stats.errors.push(`Row ${i+1}: Invalid email format`);
        continue;
      }
      
      // Increment processed count
      stats.processed++;
      
      if (!badgeIssued || badgeIssued.toLowerCase() !== 'yes') {
        logger.info({
          message: `Processing badge issuance`,
          name,
          email: email.substr(0, 3) + '***',
          rowIndex: i
        });
        
        try {
          // Issue the badge
          const result = await issueBadge(name, email);
          stats.success++;
          
          // Get the badge ID from the response for better logging
          const badgeId = result.result?.[0]?.entityId || 'unknown';
          
          logger.info({
            message: `Badge issued successfully`,
            name,
            email: email.substr(0, 3) + '***',
            badgeId,
            rowIndex: i
          });
          
          // Mark as issued
          await updateSheet(i + 1, issuedColumn, 'Yes');
          
          // Optional: Add badge ID to another column for reference
          if (process.env.BADGE_ID_COLUMN) {
            await updateSheet(i + 1, process.env.BADGE_ID_COLUMN, badgeId);
          }
          
          // Optional: Add timestamp to another column
          if (process.env.TIMESTAMP_COLUMN) {
            await updateSheet(i + 1, process.env.TIMESTAMP_COLUMN, new Date().toISOString());
          }
          
        } catch (badgeError) {
          stats.failed++;
          stats.errors.push(`Row ${i+1}: ${badgeError.message}`);
          
          logger.error({
            message: `Failed to issue badge`,
            name,
            email: email.substr(0, 3) + '***', 
            error: badgeError.message,
            rowIndex: i
          });
          
          // Mark as error in spreadsheet if configured
          if (process.env.ERROR_COLUMN) {
            try {
              await updateSheet(i + 1, process.env.ERROR_COLUMN, badgeError.message.substring(0, 255));
            } catch (updateError) {
              logger.error({
                message: 'Failed to update error status in sheet',
                originalError: badgeError.message,
                updateError: updateError.message
              });
            }
          }
        }
      } else {
        stats.alreadyIssued++;
        logger.info({
          message: `Badge already issued, skipping`,
          name,
          email: email.substr(0, 3) + '***',
          rowIndex: i
        });
      }
    }
  } catch (error) {
    logger.error({
      message: 'Error in badge processing',
      error: error.message,
      stack: error.stack
    });
  } finally {
    // Calculate duration
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    
    // Log summary statistics
    logger.info({
      message: 'Badge issuance process completed',
      statistics: stats,
      duration: `${duration.toFixed(2)} seconds`,
      timestamp: endTime.toISOString()
    });
  }
  
  return stats;
}

// If running directly (not imported)
if (require.main === module) {
  processBadges()
    .then(stats => {
      if (stats.failed > 0) {
        process.exit(1); // Exit with error code if any failures
      }
    })
    .catch(error => {
      logger.error({
        message: 'Fatal error in badge issuance process',
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    });
}

module.exports = { processBadges };
