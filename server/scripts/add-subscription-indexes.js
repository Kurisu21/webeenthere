// scripts/add-subscription-indexes.js
// Migration script to add indexes for subscription_logs and payment_transactions tables
// This improves query performance, especially for user_id lookups

const { getDatabaseConnection } = require('../database/database');

async function addSubscriptionIndexes() {
  const connection = await getDatabaseConnection();
  
  try {
    console.log('🔄 Starting subscription indexes migration...');
    
    // Check and add indexes for subscription_logs table
    console.log('📊 Checking subscription_logs indexes...');
    
    // Index on user_id
    const [userIndexLogs] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subscription_logs' 
       AND INDEX_NAME = 'idx_user_id'`
    );
    
    if (userIndexLogs.length === 0) {
      console.log('➕ Adding idx_user_id index to subscription_logs...');
      await connection.execute(
        'ALTER TABLE subscription_logs ADD INDEX idx_user_id (user_id)'
      );
      console.log('✅ idx_user_id index added to subscription_logs');
    } else {
      console.log('ℹ️ idx_user_id index already exists on subscription_logs');
    }
    
    // Index on plan_id
    const [planIndexLogs] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subscription_logs' 
       AND INDEX_NAME = 'idx_plan_id'`
    );
    
    if (planIndexLogs.length === 0) {
      console.log('➕ Adding idx_plan_id index to subscription_logs...');
      await connection.execute(
        'ALTER TABLE subscription_logs ADD INDEX idx_plan_id (plan_id)'
      );
      console.log('✅ idx_plan_id index added to subscription_logs');
    } else {
      console.log('ℹ️ idx_plan_id index already exists on subscription_logs');
    }
    
    // Index on created_at for sorting
    const [createdIndexLogs] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subscription_logs' 
       AND INDEX_NAME = 'idx_created_at'`
    );
    
    if (createdIndexLogs.length === 0) {
      console.log('➕ Adding idx_created_at index to subscription_logs...');
      await connection.execute(
        'ALTER TABLE subscription_logs ADD INDEX idx_created_at (created_at)'
      );
      console.log('✅ idx_created_at index added to subscription_logs');
    } else {
      console.log('ℹ️ idx_created_at index already exists on subscription_logs');
    }
    
    // Composite index on user_id and created_at for common queries
    const [compositeIndexLogs] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'subscription_logs' 
       AND INDEX_NAME = 'idx_user_created'`
    );
    
    if (compositeIndexLogs.length === 0) {
      console.log('➕ Adding idx_user_created composite index to subscription_logs...');
      await connection.execute(
        'ALTER TABLE subscription_logs ADD INDEX idx_user_created (user_id, created_at DESC)'
      );
      console.log('✅ idx_user_created composite index added to subscription_logs');
    } else {
      console.log('ℹ️ idx_user_created composite index already exists on subscription_logs');
    }
    
    // Check and add indexes for payment_transactions table
    console.log('📊 Checking payment_transactions indexes...');
    
    // Index on user_id
    const [userIndexTrans] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'payment_transactions' 
       AND INDEX_NAME = 'idx_user_id'`
    );
    
    if (userIndexTrans.length === 0) {
      console.log('➕ Adding idx_user_id index to payment_transactions...');
      await connection.execute(
        'ALTER TABLE payment_transactions ADD INDEX idx_user_id (user_id)'
      );
      console.log('✅ idx_user_id index added to payment_transactions');
    } else {
      console.log('ℹ️ idx_user_id index already exists on payment_transactions');
    }
    
    // Index on plan_id
    const [planIndexTrans] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'payment_transactions' 
       AND INDEX_NAME = 'idx_plan_id'`
    );
    
    if (planIndexTrans.length === 0) {
      console.log('➕ Adding idx_plan_id index to payment_transactions...');
      await connection.execute(
        'ALTER TABLE payment_transactions ADD INDEX idx_plan_id (plan_id)'
      );
      console.log('✅ idx_plan_id index added to payment_transactions');
    } else {
      console.log('ℹ️ idx_plan_id index already exists on payment_transactions');
    }
    
    // Index on created_at for sorting
    const [createdIndexTrans] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'payment_transactions' 
       AND INDEX_NAME = 'idx_created_at'`
    );
    
    if (createdIndexTrans.length === 0) {
      console.log('➕ Adding idx_created_at index to payment_transactions...');
      await connection.execute(
        'ALTER TABLE payment_transactions ADD INDEX idx_created_at (created_at)'
      );
      console.log('✅ idx_created_at index added to payment_transactions');
    } else {
      console.log('ℹ️ idx_created_at index already exists on payment_transactions');
    }
    
    // Composite index on user_id and created_at for common queries
    const [compositeIndexTrans] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'payment_transactions' 
       AND INDEX_NAME = 'idx_user_created'`
    );
    
    if (compositeIndexTrans.length === 0) {
      console.log('➕ Adding idx_user_created composite index to payment_transactions...');
      await connection.execute(
        'ALTER TABLE payment_transactions ADD INDEX idx_user_created (user_id, created_at DESC)'
      );
      console.log('✅ idx_user_created composite index added to payment_transactions');
    } else {
      console.log('ℹ️ idx_user_created composite index already exists on payment_transactions');
    }
    
    // Index on status for filtering
    const [statusIndexTrans] = await connection.execute(
      `SELECT INDEX_NAME 
       FROM information_schema.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'payment_transactions' 
       AND INDEX_NAME = 'idx_status'`
    );
    
    if (statusIndexTrans.length === 0) {
      console.log('➕ Adding idx_status index to payment_transactions...');
      await connection.execute(
        'ALTER TABLE payment_transactions ADD INDEX idx_status (status)'
      );
      console.log('✅ idx_status index added to payment_transactions');
    } else {
      console.log('ℹ️ idx_status index already exists on payment_transactions');
    }
    
    console.log('🎉 Subscription indexes migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  addSubscriptionIndexes()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addSubscriptionIndexes };

