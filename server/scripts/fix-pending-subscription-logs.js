// Script to fix pending subscription logs that have payment references
// Run this to update any existing logs that have payment_reference but are still marked as pending

const { getDatabaseConnection } = require('../database/database');

async function fixPendingSubscriptionLogs() {
  const db = await getDatabaseConnection();
  
  try {
    console.log('🔍 Checking for pending subscription logs with payment references...');
    
    // Find all logs that have a payment_reference but are still marked as pending
    const [rows] = await db.execute(
      `SELECT id, payment_reference, action, plan_id, user_id 
       FROM subscription_logs 
       WHERE payment_status = 'pending' 
       AND payment_reference IS NOT NULL 
       AND payment_reference != '' 
       AND payment_reference NOT LIKE 'TXN_%' 
       AND payment_reference NOT LIKE 'ADMIN_ASSIGNED_%' 
       AND payment_reference NOT LIKE 'CANCELLED_%'`
    );
    
    if (rows.length === 0) {
      console.log('✅ No pending logs with payment references found.');
      return;
    }
    
    console.log(`📋 Found ${rows.length} pending logs with payment references.`);
    
    // Update them to completed
    const [updateResult] = await db.execute(
      `UPDATE subscription_logs 
       SET payment_status = 'completed' 
       WHERE payment_status = 'pending' 
       AND payment_reference IS NOT NULL 
       AND payment_reference != '' 
       AND payment_reference NOT LIKE 'TXN_%' 
       AND payment_reference NOT LIKE 'ADMIN_ASSIGNED_%' 
       AND payment_reference NOT LIKE 'CANCELLED_%'`
    );
    
    console.log(`✅ Updated ${updateResult.affectedRows} subscription logs from pending to completed.`);
    
    // Show details of updated logs
    if (rows.length > 0) {
      console.log('\n📝 Updated logs:');
      rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Log ID: ${row.id}, Payment Ref: ${row.payment_reference}, Action: ${row.action}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error fixing pending subscription logs:', error);
    throw error;
  } finally {
    await db.end();
  }
}

// Run the script
if (require.main === module) {
  fixPendingSubscriptionLogs()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixPendingSubscriptionLogs };

