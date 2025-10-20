const { getDatabaseConnection } = require('../database/database');

class WebsiteAnalyticsService {
  constructor() {
    this.connection = null;
  }

  async getConnection() {
    if (!this.connection) {
      this.connection = await getDatabaseConnection();
    }
    return this.connection;
  }

  /**
   * Track page views
   */
  async trackPageViews(websiteId, page = '/', additionalData = {}) {
    const connection = await this.getConnection();
    
    try {
      const {
        visitorIp = null,
        userAgent = null,
        referrer = null,
        userId = null
      } = additionalData;

      await connection.execute(
        `INSERT INTO website_analytics (website_id, visitor_ip, user_agent, referrer, visit_time) 
         VALUES (?, ?, ?, ?, NOW())`,
        [websiteId, visitorIp, userAgent, referrer]
      );

      return { success: true };
    } catch (error) {
      console.error('Error tracking page view:', error);
      throw error;
    }
  }

  /**
   * Track user journey
   */
  async trackUserJourney(userId, path, websiteId = null) {
    const connection = await this.getConnection();
    
    try {
      // Log the journey as an activity
      await connection.execute(
        `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          'website_navigation',
          'website',
          websiteId,
          JSON.stringify({ path, timestamp: new Date().toISOString() })
        ]
      );

      return { success: true };
    } catch (error) {
      console.error('Error tracking user journey:', error);
      throw error;
    }
  }

  /**
   * Get popular pages/websites
   */
  async getPopularPages(limit = 10, period = '30') {
    const connection = await this.getConnection();
    
    try {
      // Most visited websites
      const [popularWebsites] = await connection.execute(
        `SELECT 
           w.id,
           w.title,
           w.slug,
           u.username as owner,
           COUNT(wa.id) as page_views,
           COUNT(DISTINCT wa.visitor_ip) as unique_visitors,
           MAX(wa.visit_time) as last_visit
         FROM websites w
         LEFT JOIN website_analytics wa ON w.id = wa.website_id 
           AND wa.visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         LEFT JOIN users u ON w.user_id = u.id
         WHERE w.is_active = true
         GROUP BY w.id, w.title, w.slug, u.username
         ORDER BY page_views DESC
         LIMIT ?`,
        [period, limit]
      );

      // Most popular pages by referrer
      const [popularReferrers] = await connection.execute(
        `SELECT 
           referrer,
           COUNT(*) as visits,
           COUNT(DISTINCT visitor_ip) as unique_visitors
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND referrer IS NOT NULL 
         AND referrer != ''
         GROUP BY referrer
         ORDER BY visits DESC
         LIMIT ?`,
        [period, limit]
      );

      return {
        popularWebsites: popularWebsites,
        popularReferrers: popularReferrers
      };
    } catch (error) {
      console.error('Error getting popular pages:', error);
      throw error;
    }
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources(period = '30') {
    const connection = await this.getConnection();
    
    try {
      // Traffic by referrer domain
      const [trafficByDomain] = await connection.execute(
        `SELECT 
           CASE 
             WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
             WHEN referrer LIKE '%google%' THEN 'Google'
             WHEN referrer LIKE '%facebook%' THEN 'Facebook'
             WHEN referrer LIKE '%twitter%' THEN 'Twitter'
             WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
             WHEN referrer LIKE '%instagram%' THEN 'Instagram'
             WHEN referrer LIKE '%youtube%' THEN 'YouTube'
             ELSE 'Other'
           END as source,
           COUNT(*) as visits,
           COUNT(DISTINCT visitor_ip) as unique_visitors
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY source
         ORDER BY visits DESC`,
        [period]
      );

      // Traffic by device type (based on user agent)
      const [trafficByDevice] = await connection.execute(
        `SELECT 
           CASE 
             WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' THEN 'Mobile'
             WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
             WHEN user_agent LIKE '%Windows%' OR user_agent LIKE '%Mac%' OR user_agent LIKE '%Linux%' THEN 'Desktop'
             ELSE 'Unknown'
           END as device_type,
           COUNT(*) as visits,
           COUNT(DISTINCT visitor_ip) as unique_visitors
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY device_type
         ORDER BY visits DESC`,
        [period]
      );

      // Hourly traffic pattern
      const [hourlyTraffic] = await connection.execute(
        `SELECT 
           HOUR(visit_time) as hour,
           COUNT(*) as visits
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY HOUR(visit_time)
         ORDER BY hour ASC`,
        [period]
      );

      return {
        trafficByDomain: trafficByDomain,
        trafficByDevice: trafficByDevice,
        hourlyTraffic: hourlyTraffic
      };
    } catch (error) {
      console.error('Error getting traffic sources:', error);
      throw error;
    }
  }

  /**
   * Calculate conversion rates
   */
  async getConversionRates(period = '30') {
    const connection = await this.getConnection();
    
    try {
      // Website creation vs publication rate
      const [creationStats] = await connection.execute(
        `SELECT 
           COUNT(*) as total_created,
           SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published,
           SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) / COUNT(*) * 100 as publication_rate
         FROM websites 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND is_active = true`,
        [period]
      );

      // User engagement rate (users who created websites vs total users)
      const [engagementStats] = await connection.execute(
        `SELECT 
           COUNT(DISTINCT u.id) as total_users,
           COUNT(DISTINCT w.user_id) as users_with_websites,
           COUNT(DISTINCT w.user_id) / COUNT(DISTINCT u.id) * 100 as engagement_rate
         FROM users u
         LEFT JOIN websites w ON u.id = w.user_id AND w.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND u.is_active = true`,
        [period, period]
      );

      // Template usage rate
      const [templateStats] = await connection.execute(
        `SELECT 
           COUNT(*) as total_websites,
           SUM(CASE WHEN template_id IS NOT NULL THEN 1 ELSE 0 END) as websites_with_templates,
           SUM(CASE WHEN template_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) * 100 as template_usage_rate
         FROM websites 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND is_active = true`,
        [period]
      );

      return {
        publicationRate: creationStats[0],
        engagementRate: engagementStats[0],
        templateUsageRate: templateStats[0]
      };
    } catch (error) {
      console.error('Error calculating conversion rates:', error);
      throw error;
    }
  }

  /**
   * Get website analytics overview
   */
  async getWebsiteAnalyticsOverview(period = '30') {
    const connection = await this.getConnection();
    
    try {
      // Total page views
      const [totalPageViews] = await connection.execute(
        'SELECT COUNT(*) as count FROM website_analytics WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)',
        [period]
      );

      // Unique visitors
      const [uniqueVisitors] = await connection.execute(
        'SELECT COUNT(DISTINCT visitor_ip) as count FROM website_analytics WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)',
        [period]
      );

      // Most active websites
      const [activeWebsites] = await connection.execute(
        `SELECT 
           w.id,
           w.title,
           w.slug,
           u.username as owner,
           COUNT(wa.id) as page_views,
           COUNT(DISTINCT wa.visitor_ip) as unique_visitors
         FROM websites w
         LEFT JOIN website_analytics wa ON w.id = wa.website_id 
           AND wa.visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         LEFT JOIN users u ON w.user_id = u.id
         WHERE w.is_active = true
         GROUP BY w.id, w.title, w.slug, u.username
         ORDER BY page_views DESC
         LIMIT 10`,
        [period]
      );

      // Daily page views trend
      const [dailyTrend] = await connection.execute(
        `SELECT 
           DATE(visit_time) as date,
           COUNT(*) as page_views,
           COUNT(DISTINCT visitor_ip) as unique_visitors
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(visit_time)
         ORDER BY date ASC`,
        [period]
      );

      return {
        totalPageViews: totalPageViews[0].count,
        uniqueVisitors: uniqueVisitors[0].count,
        activeWebsites: activeWebsites,
        dailyTrend: dailyTrend
      };
    } catch (error) {
      console.error('Error getting website analytics overview:', error);
      throw error;
    }
  }

  /**
   * Get website performance metrics
   */
  async getWebsitePerformanceMetrics(websiteId = null) {
    const connection = await this.getConnection();
    
    try {
      let whereClause = '';
      let params = [];
      
      if (websiteId) {
        whereClause = 'WHERE wa.website_id = ?';
        params = [websiteId];
      }

      // Average visits per day
      const [avgVisitsPerDay] = await connection.execute(
        `SELECT 
           AVG(daily_visits) as avg_visits_per_day,
           MAX(daily_visits) as max_daily_visits,
           MIN(daily_visits) as min_daily_visits
         FROM (
           SELECT DATE(visit_time) as date, COUNT(*) as daily_visits
           FROM website_analytics wa
           ${whereClause}
           AND visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY DATE(visit_time)
         ) daily_stats`,
        params
      );

      // Bounce rate (visitors with only 1 page view)
      const [bounceRate] = await connection.execute(
        `SELECT 
           COUNT(*) as total_visitors,
           SUM(CASE WHEN page_views = 1 THEN 1 ELSE 0 END) as bounced_visitors,
           SUM(CASE WHEN page_views = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100 as bounce_rate
         FROM (
           SELECT visitor_ip, COUNT(*) as page_views
           FROM website_analytics wa
           ${whereClause}
           AND visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY visitor_ip
         ) visitor_stats`,
        params
      );

      // Return visitor rate
      const [returnVisitorRate] = await connection.execute(
        `SELECT 
           COUNT(DISTINCT visitor_ip) as total_unique_visitors,
           SUM(CASE WHEN visit_count > 1 THEN 1 ELSE 0 END) as return_visitors,
           SUM(CASE WHEN visit_count > 1 THEN 1 ELSE 0 END) / COUNT(DISTINCT visitor_ip) * 100 as return_rate
         FROM (
           SELECT visitor_ip, COUNT(DISTINCT DATE(visit_time)) as visit_count
           FROM website_analytics wa
           ${whereClause}
           AND visit_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           GROUP BY visitor_ip
         ) visitor_stats`,
        params
      );

      return {
        avgVisitsPerDay: avgVisitsPerDay[0],
        bounceRate: bounceRate[0],
        returnVisitorRate: returnVisitorRate[0]
      };
    } catch (error) {
      console.error('Error getting website performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get geographic distribution of visitors
   */
  async getGeographicDistribution(period = '30') {
    const connection = await this.getConnection();
    
    try {
      // Note: This is a simplified version. In a real implementation,
      // you would use a geolocation service to determine country/region from IP
      const [geoDistribution] = await connection.execute(
        `SELECT 
           CASE 
             WHEN visitor_ip LIKE '192.168.%' OR visitor_ip LIKE '10.%' OR visitor_ip LIKE '172.%' THEN 'Local'
             WHEN visitor_ip LIKE '127.%' THEN 'Localhost'
             ELSE 'External'
           END as location_type,
           COUNT(*) as visits,
           COUNT(DISTINCT visitor_ip) as unique_visitors
         FROM website_analytics 
         WHERE visit_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY location_type
         ORDER BY visits DESC`,
        [period]
      );

      return geoDistribution;
    } catch (error) {
      console.error('Error getting geographic distribution:', error);
      throw error;
    }
  }
}

module.exports = new WebsiteAnalyticsService();
