const mysql = require('mysql2/promise');
const { getDatabaseConnection } = require('../database/database');

class DatabaseSettingsService {
  async getSetting(key) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM system_settings WHERE setting_key = ?',
      [key]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    try {
      return JSON.parse(rows[0].setting_value);
    } catch (error) {
      console.error(`Failed to parse setting value for key: ${key}`, error);
      return rows[0].setting_value;
    }
  }

  async setSetting(key, value, updatedBy = null) {
    const connection = await getDatabaseConnection();
    
    const settingValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    await connection.execute(
      `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       setting_value = VALUES(setting_value), 
       updated_at = NOW(), 
       updated_by = VALUES(updated_by)`,
      [key, settingValue, updatedBy]
    );
    
    return this.getSetting(key);
  }

  async getAllSettings() {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM system_settings ORDER BY setting_key ASC'
    );
    
    const settings = {};
    for (const row of rows) {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch (error) {
        settings[row.setting_key] = row.setting_value;
      }
    }
    
    return settings;
  }

  async deleteSetting(key) {
    const connection = await getDatabaseConnection();
    await connection.execute('DELETE FROM system_settings WHERE setting_key = ?', [key]);
  }

  // Email configuration
  async getEmailConfig() {
    return this.getSetting('email_config') || {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@webeenthere.com',
      fromName: 'Webeenthere',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };
  }

  async setEmailConfig(config, updatedBy = null) {
    return this.setSetting('email_config', config, updatedBy);
  }

  async updateEmailConfig(config, updatedBy = null) {
    return this.setSetting('email_config', config, updatedBy);
  }

  // Feature flags
  async getFeatureFlags() {
    return this.getSetting('feature_flags') || {
      aiFeatures: true,
      templates: true,
      analytics: true,
      forum: true,
      supportTickets: true,
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      socialLogin: false,
      twoFactorAuth: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };
  }

  async setFeatureFlags(flags, updatedBy = null) {
    return this.setSetting('feature_flags', flags, updatedBy);
  }

  async updateFeatureFlags(flags, updatedBy = null) {
    return this.setSetting('feature_flags', flags, updatedBy);
  }

  async updateFeatureFlag(flagName, value, updatedBy = null) {
    const flags = await this.getFeatureFlags();
    flags[flagName] = value;
    return this.setFeatureFlags(flags, updatedBy);
  }

  // System settings (alias for site settings for backward compatibility)
  async getSystemSettings() {
    return this.getSetting('site_settings') || {
      appName: 'Webeenthere',
      maintenanceMode: false,
      registrationEnabled: true,
      maxUploadSizeMB: 10,
      siteDescription: 'Build beautiful websites easily',
      contactEmail: 'contact@webeenthere.com',
      maxUsersPerDay: 100,
      sessionTimeout: 60,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system'
    };
  }

  async setSystemSettings(settings, updatedBy = null) {
    return this.setSetting('site_settings', settings, updatedBy);
  }

  // Site settings
  async getSiteSettings() {
    return this.getSetting('site_settings') || {
      site_name: 'Webeenthere',
      site_description: 'Build beautiful websites easily',
      site_url: 'https://webeenthere.com',
      maintenance_mode: false,
      registration_enabled: true,
      email_verification_required: true,
      max_websites_per_user: 5,
      max_file_upload_size: 10485760, // 10MB
      allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
    };
  }

  async setSiteSettings(settings, updatedBy = null) {
    return this.setSetting('site_settings', settings, updatedBy);
  }

  // Notification settings
  async getNotificationSettings() {
    return this.getSetting('notification_settings') || {
      email_notifications: true,
      push_notifications: false,
      weekly_digest: true,
      marketing_emails: false,
      system_updates: true,
      feature_announcements: true
    };
  }

  async setNotificationSettings(settings, updatedBy = null) {
    return this.setSetting('notification_settings', settings, updatedBy);
  }

  // Analytics settings
  async getAnalyticsSettings() {
    return this.getSetting('analytics_settings') || {
      google_analytics_id: '',
      facebook_pixel_id: '',
      tracking_enabled: true,
      anonymize_ip: true,
      cookie_consent_required: true
    };
  }

  async setAnalyticsSettings(settings, updatedBy = null) {
    return this.setSetting('analytics_settings', settings, updatedBy);
  }

  // Security settings
  async getSecuritySettings() {
    return this.getSetting('security_settings') || {
      password_min_length: 8,
      password_require_special_chars: true,
      password_require_numbers: true,
      password_require_uppercase: true,
      max_login_attempts: 5,
      lockout_duration_minutes: 30,
      session_timeout_minutes: 60,
      two_factor_enabled: false,
      ip_whitelist_enabled: false,
      allowed_ips: []
    };
  }

  async setSecuritySettings(settings, updatedBy = null) {
    return this.setSetting('security_settings', settings, updatedBy);
  }

  // Backup settings
  async getBackupSettings() {
    return this.getSetting('backup_settings') || {
      auto_backup_enabled: true,
      backup_frequency: 'daily',
      backup_retention_days: 30,
      backup_location: 'local',
      cloud_backup_enabled: false,
      cloud_provider: 'aws',
      cloud_bucket: ''
    };
  }

  async setBackupSettings(settings, updatedBy = null) {
    return this.setSetting('backup_settings', settings, updatedBy);
  }

  // Theme settings
  async getThemeSettings() {
    return this.getSetting('theme_settings') || {
      default_theme: 'light',
      available_themes: ['light', 'dark'],
      custom_css_enabled: false,
      custom_css: '',
      primary_color: '#3498db',
      secondary_color: '#2c3e50',
      accent_color: '#e74c3c'
    };
  }

  async setThemeSettings(settings, updatedBy = null) {
    return this.setSetting('theme_settings', settings, updatedBy);
  }

  // Get setting history
  async getSettingHistory(key, limit = 10) {
    const connection = await getDatabaseConnection();
    const [rows] = await connection.execute(
      `SELECT s.*, u.username as updated_by_name 
       FROM system_settings s 
       LEFT JOIN users u ON s.updated_by = u.id 
       WHERE s.setting_key = ? 
       ORDER BY s.updated_at DESC 
       LIMIT ?`,
      [key, limit]
    );
    return rows;
  }

  // Bulk update settings
  async updateMultipleSettings(settings, updatedBy = null) {
    const connection = await getDatabaseConnection();
    
    try {
      await connection.beginTransaction();
      
      for (const [key, value] of Object.entries(settings)) {
        const settingValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        await connection.execute(
          `INSERT INTO system_settings (setting_key, setting_value, updated_by) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           setting_value = VALUES(setting_value), 
           updated_at = NOW(), 
           updated_by = VALUES(updated_by)`,
          [key, settingValue, updatedBy]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  // Reset settings to defaults
  async resetToDefaults(updatedBy = null) {
    const defaultSettings = {
      email_config: await this.getEmailConfig(),
      feature_flags: await this.getFeatureFlags(),
      site_settings: await this.getSiteSettings(),
      notification_settings: await this.getNotificationSettings(),
      analytics_settings: await this.getAnalyticsSettings(),
      security_settings: await this.getSecuritySettings(),
      backup_settings: await this.getBackupSettings(),
      theme_settings: await this.getThemeSettings()
    };
    
    return this.updateMultipleSettings(defaultSettings, updatedBy);
  }
}

module.exports = new DatabaseSettingsService();
