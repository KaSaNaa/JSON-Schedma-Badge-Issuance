import { getSheetData, updateSheet } from './src/sheet';
import { issueBadge } from './src/badgr';

type SheetRow = [string, string, string, ...any[]]; // [name, email, badgeIssued, ...restOfData]

async function processBadges(): Promise<void> {
    try {
        const rows: SheetRow[] = await getSheetData();
        // Assuming the header row is the first row
        // And columns: A = Name, B = Email, C = Badge Issued flag, D = any additional data
        for (let i = 1; i < rows.length; i++) {
            const [name, email, badgeIssued] = rows[i];
            if (!badgeIssued || badgeIssued.toLowerCase() !== 'yes') {
                console.log(`Issuing badge for ${name} (${email})...`);
                try {
                    const result = await issueBadge(name, email);
                    console.log(`Badge issued for ${email}:`, result);
                    // Mark as issued (assuming column C, row i+1)
                    await updateSheet(i + 1, 'C', 'Yes');
                } catch (badgeError: unknown) {
                    console.error(`Failed to issue badge for ${email}`, badgeError);
                    // Here, you could also add a mechanism to report errors to Slack.
                }
            } else {
                console.log(`Badge already issued for ${email}`);
            }
        }
    } catch (error: unknown) {
        console.error('Error processing badges:', error);
    }
}

processBadges();
