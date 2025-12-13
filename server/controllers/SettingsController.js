const databaseSettingsService = require('../services/DatabaseSettingsService');

class SettingsController {
  constructor() {
    this.settingsService = databaseSettingsService;
  }

  /**
   * Get system settings
   */
  async getSystemSettings(req, res) {
    try {
      const settings = await this.settingsService.getSystemSettings();
      res.json({ success: true, settings });
    } catch (error) {
      console.error('Get system settings error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve system settings' });
    }
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(req, res) {
    try {
      const {
        appName,
        maintenanceMode,
        registrationEnabled,
        maxUploadSizeMB
      } = req.body;

      // Validation
      if (appName && (typeof appName !== 'string' || appName.length < 1 || appName.length > 100)) {
        return res.status(400).json({ 
          success: false, 
          error: 'App name must be between 1 and 100 characters' 
        });
      }

      if (maxUploadSizeMB && (typeof maxUploadSizeMB !== 'number' || maxUploadSizeMB < 1 || maxUploadSizeMB > 1000)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Max upload size must be between 1 and 1000 MB' 
        });
      }

      const currentSettings = await this.settingsService.getSystemSettings();
      
      // Update only provided fields
      const updatedSettings = {
        ...currentSettings,
        appName: appName !== undefined ? appName : currentSettings.appName,
        maintenanceMode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : currentSettings.maintenanceMode,
        registrationEnabled: registrationEnabled !== undefined ? Boolean(registrationEnabled) : currentSettings.registrationEnabled,
        maxUploadSizeMB: maxUploadSizeMB !== undefined ? Number(maxUploadSizeMB) : currentSettings.maxUploadSizeMB,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.username || 'admin'
      };

      await this.settingsService.setSystemSettings(updatedSettings, req.user.username || 'admin');

      res.json({ 
        success: true, 
        message: 'System settings updated successfully',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Update system settings error:', error);
      res.status(500).json({ success: false, error: 'Failed to update system settings' });
    }
  }

  /**
   * Get feature flags
   */
  async getFeatureFlags(req, res) {
    try {
      const flags = await this.settingsService.getFeatureFlags();
      res.json({ success: true, flags });
    } catch (error) {
      console.error('Get feature flags error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve feature flags' });
    }
  }

  /**
   * Update feature flags
   */
  async updateFeatureFlags(req, res) {
    try {
      const {
        aiFeatures,
        templates,
        analytics,
        forum,
        supportTickets
      } = req.body;

      const currentFlags = await this.settingsService.getFeatureFlags();
      
      // Update only provided flags
      const updatedFlags = {
        ...currentFlags,
        aiFeatures: aiFeatures !== undefined ? Boolean(aiFeatures) : currentFlags.aiFeatures,
        templates: templates !== undefined ? Boolean(templates) : currentFlags.templates,
        analytics: analytics !== undefined ? Boolean(analytics) : currentFlags.analytics,
        forum: forum !== undefined ? Boolean(forum) : currentFlags.forum,
        supportTickets: supportTickets !== undefined ? Boolean(supportTickets) : currentFlags.supportTickets,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.username || 'admin'
      };

      await this.settingsService.updateFeatureFlags(updatedFlags, req.user.username || 'admin');

      res.json({ 
        success: true, 
        message: 'Feature flags updated successfully',
        flags: updatedFlags
      });
    } catch (error) {
      console.error('Update feature flags error:', error);
      res.status(500).json({ success: false, error: 'Failed to update feature flags' });
    }
  }

  /**
   * Get email configuration
   */
  async getEmailConfig(req, res) {
    try {
      const config = await this.settingsService.getEmailConfig();
      
      // Don't send password in response
      const safeConfig = {
        ...config,
        smtpPassword: config.smtpPassword ? '[HIDDEN]' : ''
      };
      
      res.json({ success: true, config: safeConfig });
    } catch (error) {
      console.error('Get email config error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve email configuration' });
    }
  }

  /**
   * Update email configuration
   */
  async updateEmailConfig(req, res) {
    try {
      const {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName
      } = req.body;

      // Validation
      if (smtpHost && (typeof smtpHost !== 'string' || smtpHost.length < 1)) {
        return res.status(400).json({ 
          success: false, 
          error: 'SMTP host is required' 
        });
      }

      if (smtpPort && (typeof smtpPort !== 'number' || smtpPort < 1 || smtpPort > 65535)) {
        return res.status(400).json({ 
          success: false, 
          error: 'SMTP port must be between 1 and 65535' 
        });
      }

      if (fromEmail && !this.isValidEmail(fromEmail)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid email address' 
        });
      }

      const currentConfig = await this.settingsService.getEmailConfig();
      
      // Update only provided fields
      const updatedConfig = {
        ...currentConfig,
        smtpHost: smtpHost !== undefined ? smtpHost : currentConfig.smtpHost,
        smtpPort: smtpPort !== undefined ? Number(smtpPort) : currentConfig.smtpPort,
        smtpUser: smtpUser !== undefined ? smtpUser : currentConfig.smtpUser,
        smtpPassword: smtpPassword !== undefined && smtpPassword !== '[HIDDEN]' ? smtpPassword : currentConfig.smtpPassword,
        fromEmail: fromEmail !== undefined ? fromEmail : currentConfig.fromEmail,
        fromName: fromName !== undefined ? fromName : currentConfig.fromName,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.username || 'admin'
      };

      await this.settingsService.updateEmailConfig(updatedConfig, req.user.username || 'admin');

      // Don't send password in response
      const safeConfig = {
        ...updatedConfig,
        smtpPassword: updatedConfig.smtpPassword ? '[HIDDEN]' : ''
      };

      res.json({ 
        success: true, 
        message: 'Email configuration updated successfully',
        config: safeConfig
      });
    } catch (error) {
      console.error('Update email config error:', error);
      res.status(500).json({ success: false, error: 'Failed to update email configuration' });
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(req, res) {
    try {
      const config = await this.settingsService.getEmailConfig();
      
      // Basic validation
      if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email configuration is incomplete' 
        });
      }

      // TODO: Implement actual email test
      // For now, just return success
      res.json({ 
        success: true, 
        message: 'Email configuration test passed (mock test)'
      });
    } catch (error) {
      console.error('Test email config error:', error);
      res.status(500).json({ success: false, error: 'Failed to test email configuration' });
    }
  }

  /**
   * Get all settings (system, features, email)
   */
  async getAllSettings(req, res) {
    try {
      const [systemSettings, featureFlags, emailConfig] = await Promise.all([
        this.settingsService.getSystemSettings(),
        this.settingsService.getFeatureFlags(),
        this.settingsService.getEmailConfig()
      ]);

      // Don't send password in response
      const safeEmailConfig = {
        ...emailConfig,
        smtpPassword: emailConfig.smtpPassword ? '[HIDDEN]' : ''
      };

      res.json({ 
        success: true, 
        settings: {
          system: systemSettings,
          features: featureFlags,
          email: safeEmailConfig
        }
      });
    } catch (error) {
      console.error('Get all settings error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve settings' });
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get settings metadata (file sizes, last updated, etc.)
   */
  async getSettingsMetadata(req, res) {
    try {
      const files = await this.jsonManager.listJsonFiles();
      const settingsFiles = files.filter(file => 
        file.path.startsWith('settings/')
      );

      const metadata = await Promise.all(
        settingsFiles.map(async (file) => ({
          path: file.path,
          size: file.size,
          modified: file.modified,
          sizeFormatted: this.formatFileSize(file.size)
        }))
      );

      res.json({ success: true, metadata });
    } catch (error) {
      console.error('Get settings metadata error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve settings metadata' });
    }
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get AI configuration
   */
  async getAiConfig(req, res) {
    try {
      const config = await this.settingsService.getAiConfig();
      res.json({ success: true, config });
    } catch (error) {
      console.error('Get AI config error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve AI configuration' });
    }
  }

  /**
   * Update AI configuration
   */
  async updateAiConfig(req, res) {
    try {
      const {
        model,
        temperature
      } = req.body;

      // Validation
      if (model && typeof model !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Model must be a string' 
        });
      }

      if (temperature !== undefined && (typeof temperature !== 'number' || temperature < 0 || temperature > 2)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Temperature must be between 0 and 2' 
        });
      }

      const currentConfig = await this.settingsService.getAiConfig();
      
      // Update only provided fields (remove maxTokens if it exists)
      const updatedConfig = {
        ...currentConfig,
        model: model !== undefined ? model : currentConfig.model,
        temperature: temperature !== undefined ? Number(temperature) : currentConfig.temperature,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.username || 'admin'
      };
      
      // Remove maxTokens if it exists in the config
      delete updatedConfig.maxTokens;

      await this.settingsService.updateAiConfig(updatedConfig, req.user.id || null);

      res.json({ 
        success: true, 
        message: 'AI configuration updated successfully',
        config: updatedConfig
      });
    } catch (error) {
      console.error('Update AI config error:', error);
      res.status(500).json({ success: false, error: 'Failed to update AI configuration' });
    }
  }

  /**
   * Get all AI prompts (for viewing user inputs and responses)
   */
  async getAiPrompts(req, res) {
    try {
      const { getDatabaseConnection } = require('../database/database');
      const connection = await getDatabaseConnection();
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;
      
      // Build query with optional filters
      let query = `
        SELECT 
          ap.*,
          u.username,
          u.email,
          w.title as website_title,
          w.slug as website_slug
        FROM ai_prompts ap
        LEFT JOIN users u ON ap.user_id = u.id
        LEFT JOIN websites w ON ap.website_id = w.id
        WHERE 1=1
      `;
      const params = [];
      
      if (req.query.userId) {
        query += ' AND ap.user_id = ?';
        params.push(req.query.userId);
      }
      
      if (req.query.promptType) {
        query += ' AND ap.prompt_type = ?';
        params.push(req.query.promptType);
      }
      
      if (req.query.search) {
        query += ' AND (ap.prompt_text LIKE ? OR ap.response_html LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ' ORDER BY ap.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);
      
      const [prompts] = await connection.execute(query, params);
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM ai_prompts ap
        WHERE 1=1
      `;
      const countParams = [];
      
      if (req.query.userId) {
        countQuery += ' AND ap.user_id = ?';
        countParams.push(req.query.userId);
      }
      
      if (req.query.promptType) {
        countQuery += ' AND ap.prompt_type = ?';
        countParams.push(req.query.promptType);
      }
      
      if (req.query.search) {
        countQuery += ' AND (ap.prompt_text LIKE ? OR ap.response_html LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        countParams.push(searchTerm, searchTerm);
      }
      
      const [countResult] = await connection.execute(countQuery, countParams);
      const total = countResult[0].total;
      
      res.json({
        success: true,
        prompts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get AI prompts error:', error);
      res.status(500).json({ success: false, error: 'Failed to retrieve AI prompts' });
    }
  }
}

module.exports = SettingsController;
