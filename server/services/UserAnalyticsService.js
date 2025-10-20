const { getDatabaseConnection } = require('../database/database');
const databaseActivityLogger = require('./DatabaseActivityLogger');

class UserAnalyticsService {
  constructor() {
    this.activityLogger = databaseActivityLogger;
  }

  async getConnection() {
    return await getDatabaseConnection();
  }

  /**
   * Track user activity
   */
  async trackUserActivity(userId, action, details = {}) {
    try {
      await this.activityLogger.logActivity({
        userId,
        action,
        details
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
      throw error;
    }
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(userId) {
    const connection = await this.getConnection();
    
    try {
      // User's total activities
      const [totalActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ?',
        [userId]
      );

      // Activities in last 30 days
      const [recentActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        [userId]
      );

      // Activities in last 7 days
      const [weekActivities] = await connection.execute(
        'SELECT COUNT(*) as count FROM activity_logs WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
        [userId]
      );

      // Most frequent actions
      const [topActions] = await connection.execute(
        'SELECT action, COUNT(*) as count FROM activity_logs WHERE user_id = ? GROUP BY action ORDER BY count DESC LIMIT 5',
        [userId]
      );

      // Activity pattern (activities per day in last 30 days)
      const [activityPattern] = await connection.execute(
        `SELECT DATE(timestamp) as date, COUNT(*) as count
         FROM activity_logs 
         WHERE user_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DATE(timestamp)
         ORDER BY date ASC`,
        [userId]
      );

      // User's websites
      const [userWebsites] = await connection.execute(
        'SELECT COUNT(*) as count FROM websites WHERE user_id = ? AND is_active = true',
        [userId]
      );

      // Published websites
      const [publishedWebsites] = await connection.execute(
        'SELECT COUNT(*) as count FROM websites WHERE user_id = ? AND is_published = true AND is_active = true',
        [userId]
      );

      return {
        totalActivities: totalActivities[0].count,
        recentActivities: recentActivities[0].count,
        weekActivities: weekActivities[0].count,
        topActions: topActions,
        activityPattern: activityPattern,
        websites: {
          total: userWebsites[0].count,
          published: publishedWebsites[0].count
        }
      };
    } catch (error) {
      console.error('Error getting user engagement:', error);
      throw error;
    }
  }

  /**
   * Calculate user retention rates
   */
  async getUserRetention() {
    const connection = await this.getConnection();
    
    try {
      // Users who registered in last 12 months
      const [registeredUsers] = await connection.execute(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           COUNT(*) as registered_count
         FROM users 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // Users who were active in their first month
      const [firstMonthActive] = await connection.execute(
        `SELECT 
           DATE_FORMAT(u.created_at, '%Y-%m') as month,
           COUNT(DISTINCT u.id) as active_count
         FROM users u
         INNER JOIN activity_logs a ON u.id = a.user_id
         WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         AND a.timestamp BETWEEN u.created_at AND DATE_ADD(u.created_at, INTERVAL 1 MONTH)
         GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // Users who were active in their second month
      const [secondMonthActive] = await connection.execute(
        `SELECT 
           DATE_FORMAT(u.created_at, '%Y-%m') as month,
           COUNT(DISTINCT u.id) as active_count
         FROM users u
         INNER JOIN activity_logs a ON u.id = a.user_id
         WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
         AND a.timestamp BETWEEN DATE_ADD(u.created_at, INTERVAL 1 MONTH) AND DATE_ADD(u.created_at, INTERVAL 2 MONTH)
         GROUP BY DATE_FORMAT(u.created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // Calculate retention rates
      const retentionData = registeredUsers.map(reg => {
        const firstMonth = firstMonthActive.find(fm => fm.month === reg.month);
        const secondMonth = secondMonthActive.find(sm => sm.month === reg.month);
        
        return {
          month: reg.month,
          registered: reg.registered_count,
          firstMonthActive: firstMonth ? firstMonth.active_count : 0,
          secondMonthActive: secondMonth ? secondMonth.active_count : 0,
          firstMonthRetention: firstMonth ? (firstMonth.active_count / reg.registered_count * 100).toFixed(2) : 0,
          secondMonthRetention: secondMonth ? (secondMonth.active_count / reg.registered_count * 100).toFixed(2) : 0
        };
      });

      return retentionData;
    } catch (error) {
      console.error('Error calculating user retention:', error);
      throw error;
    }
  }

  /**
   * Track user growth over time
   */
  async getUserGrowth() {
    const connection = await this.getConnection();
    
    try {
      // Monthly user growth
      const [monthlyGrowth] = await connection.execute(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%m') as month,
           COUNT(*) as new_users,
           SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as cumulative_users
         FROM users 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 MONTH)
         GROUP BY DATE_FORMAT(created_at, '%Y-%m')
         ORDER BY month ASC`
      );

      // Weekly user growth (last 12 weeks)
      const [weeklyGrowth] = await connection.execute(
        `SELECT 
           DATE_FORMAT(created_at, '%Y-%u') as week,
           COUNT(*) as new_users
         FROM users 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 WEEK)
         GROUP BY DATE_FORMAT(created_at, '%Y-%u')
         ORDER BY week ASC`
      );

      // Daily user growth (last 30 days)
      const [dailyGrowth] = await connection.execute(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as new_users
         FROM users 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      );

      return {
        monthly: monthlyGrowth,
        weekly: weeklyGrowth,
        daily: dailyGrowth
      };
    } catch (error) {
      console.error('Error tracking user growth:', error);
      throw error;
    }
  }

  /**
   * Segment users by behavior
   */
  async getUserSegments() {
    const connection = await this.getConnection();
    
    try {
      // Power users (high activity)
      const [powerUsers] = await connection.execute(
        `SELECT 
           u.id,
           u.username,
           u.email,
           COUNT(a.id) as activity_count,
           COUNT(w.id) as website_count
         FROM users u
         LEFT JOIN activity_logs a ON u.id = a.user_id
         LEFT JOIN websites w ON u.id = w.user_id AND w.is_active = true
         WHERE u.is_active = true
         GROUP BY u.id, u.username, u.email
         HAVING activity_count > 50 OR website_count > 3
         ORDER BY activity_count DESC
         LIMIT 20`
      );

      // New users (registered in last 30 days)
      const [newUsers] = await connection.execute(
        `SELECT 
           u.id,
           u.username,
           u.email,
           u.created_at,
           COUNT(a.id) as activity_count
         FROM users u
         LEFT JOIN activity_logs a ON u.id = a.user_id
         WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND u.is_active = true
         GROUP BY u.id, u.username, u.email, u.created_at
         ORDER BY u.created_at DESC`
      );

      // Inactive users (no activity in last 30 days)
      const [inactiveUsers] = await connection.execute(
        `SELECT 
           u.id,
           u.username,
           u.email,
           u.created_at,
           MAX(a.timestamp) as last_activity
         FROM users u
         LEFT JOIN activity_logs a ON u.id = a.user_id
         WHERE u.is_active = true
         AND u.created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
         GROUP BY u.id, u.username, u.email, u.created_at
         HAVING last_activity IS NULL OR last_activity < DATE_SUB(NOW(), INTERVAL 30 DAY)
         ORDER BY last_activity ASC
         LIMIT 50`
      );

      // Users with published websites
      const [publishers] = await connection.execute(
        `SELECT 
           u.id,
           u.username,
           u.email,
           COUNT(w.id) as published_count
         FROM users u
         INNER JOIN websites w ON u.id = w.user_id
         WHERE w.is_published = true AND w.is_active = true
         AND u.is_active = true
         GROUP BY u.id, u.username, u.email
         ORDER BY published_count DESC`
      );

      return {
        powerUsers: powerUsers,
        newUsers: newUsers,
        inactiveUsers: inactiveUsers,
        publishers: publishers,
        summary: {
          powerUsersCount: powerUsers.length,
          newUsersCount: newUsers.length,
          inactiveUsersCount: inactiveUsers.length,
          publishersCount: publishers.length
        }
      };
    } catch (error) {
      console.error('Error segmenting users:', error);
      throw error;
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId, days = 30) {
    const connection = await this.getConnection();
    
    try {
      const [timeline] = await connection.execute(
        `SELECT 
           DATE(timestamp) as date,
           COUNT(*) as activity_count,
           GROUP_CONCAT(DISTINCT action) as actions
         FROM activity_logs 
         WHERE user_id = ? 
         AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(timestamp)
         ORDER BY date ASC`,
        [userId, days]
      );

      return timeline;
    } catch (error) {
      console.error('Error getting user activity timeline:', error);
      throw error;
    }
  }

  /**
   * Get user comparison metrics
   */
  async getUserComparisonMetrics() {
    const connection = await this.getConnection();
    
    try {
      // Average activities per user
      const [avgActivities] = await connection.execute(
        `SELECT 
           AVG(activity_count) as avg_activities_per_user,
           MAX(activity_count) as max_activities,
           MIN(activity_count) as min_activities
         FROM (
           SELECT user_id, COUNT(*) as activity_count
           FROM activity_logs
           WHERE user_id IS NOT NULL
           GROUP BY user_id
         ) user_activities`
      );

      // Average websites per user
      const [avgWebsites] = await connection.execute(
        `SELECT 
           AVG(website_count) as avg_websites_per_user,
           MAX(website_count) as max_websites,
           MIN(website_count) as min_websites
         FROM (
           SELECT user_id, COUNT(*) as website_count
           FROM websites
           WHERE is_active = true
           GROUP BY user_id
         ) user_websites`
      );

      // User engagement score distribution
      const [engagementDistribution] = await connection.execute(
        `SELECT 
           CASE 
             WHEN activity_count = 0 THEN 'No Activity'
             WHEN activity_count BETWEEN 1 AND 10 THEN 'Low Activity'
             WHEN activity_count BETWEEN 11 AND 50 THEN 'Medium Activity'
             WHEN activity_count BETWEEN 51 AND 100 THEN 'High Activity'
             ELSE 'Very High Activity'
           END as engagement_level,
           COUNT(*) as user_count
         FROM (
           SELECT user_id, COUNT(*) as activity_count
           FROM activity_logs
           WHERE user_id IS NOT NULL
           GROUP BY user_id
         ) user_activities
         GROUP BY engagement_level`
      );

      return {
        activityMetrics: avgActivities[0],
        websiteMetrics: avgWebsites[0],
        engagementDistribution: engagementDistribution
      };
    } catch (error) {
      console.error('Error getting user comparison metrics:', error);
      throw error;
    }
  }
}

module.exports = new UserAnalyticsService();
