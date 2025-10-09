// Token cleanup utility - can be run as a cron job
const TokenStorage = require('./services/TokenStorage');

async function cleanupExpiredTokens() {
  try {
    console.log('🧹 Starting token cleanup...');
    
    const tokenStorage = new TokenStorage();
    await tokenStorage.initialize();
    
    const statsBefore = tokenStorage.getStats();
    console.log('📊 Tokens before cleanup:', statsBefore);
    
    await tokenStorage.cleanup();
    
    const statsAfter = tokenStorage.getStats();
    console.log('📊 Tokens after cleanup:', statsAfter);
    
    const cleanedCount = statsBefore.totalTokens - statsAfter.totalTokens;
    console.log(`✅ Cleaned up ${cleanedCount} expired tokens`);
    
  } catch (error) {
    console.error('❌ Error during token cleanup:', error);
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupExpiredTokens().then(() => {
    console.log('🎉 Token cleanup completed');
    process.exit(0);
  }).catch(err => {
    console.error('💥 Token cleanup failed:', err);
    process.exit(1);
  });
}

module.exports = cleanupExpiredTokens;

