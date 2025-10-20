import { apiCall } from './apiConfig';

// TypeScript interfaces for settings data
export interface SystemSettings {
  appName: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUploadSizeMB: number;
  siteDescription?: string;
  contactEmail?: string;
  maxUsersPerDay?: number;
  sessionTimeout?: number;
  updatedAt: string;
  updatedBy: string;
}

export interface FeatureFlags {
  aiFeatures: boolean;
  templates: boolean;
  analytics: boolean;
  forum: boolean;
  supportTickets: boolean;
  maintenanceMode?: boolean;
  registrationEnabled?: boolean;
  emailNotifications?: boolean;
  socialLogin?: boolean;
  twoFactorAuth?: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SettingsMetadata {
  path: string;
  size: number;
  modified: string;
  sizeFormatted: string;
}

export interface AllSettings {
  system: SystemSettings;
  features: FeatureFlags;
  email: EmailConfig;
}

// API Response interfaces
interface SettingsResponse {
  success: boolean;
  settings?: SystemSettings;
  flags?: FeatureFlags;
  config?: EmailConfig;
  metadata?: SettingsMetadata[];
  error?: string;
}

interface AllSettingsResponse {
  success: boolean;
  settings?: AllSettings;
  error?: string;
}

// Settings API functions
export const settingsApi = {
  // Get all settings
  getAllSettings: async (): Promise<AllSettings> => {
    const response = await apiCall('/api/admin/settings/all');
    const data = await response.json();
    if (data.success && data.settings) {
      return data.settings;
    }
    throw new Error(data.error || 'Failed to fetch all settings');
  },

  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await apiCall('/api/admin/settings/system');
    const data = await response.json();
    if (data.success && data.settings) {
      return data.settings;
    }
    throw new Error(data.error || 'Failed to fetch system settings');
  },

  updateSystemSettings: async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
    const response = await apiCall('/api/admin/settings/system', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    const data = await response.json();
    if (data.success && data.settings) {
      return data.settings;
    }
    throw new Error(data.error || 'Failed to update system settings');
  },

  // Feature Flags
  getFeatureFlags: async (): Promise<FeatureFlags> => {
    const response = await apiCall('/api/admin/settings/features');
    const data = await response.json();
    if (data.success && data.flags) {
      return data.flags;
    }
    throw new Error(data.error || 'Failed to fetch feature flags');
  },

  updateFeatureFlags: async (flags: Partial<FeatureFlags>): Promise<FeatureFlags> => {
    const response = await apiCall('/api/admin/settings/features', {
      method: 'PUT',
      body: JSON.stringify(flags)
    });
    const data = await response.json();
    if (data.success && data.flags) {
      return data.flags;
    }
    throw new Error(data.error || 'Failed to update feature flags');
  },

  // Email Configuration
  getEmailConfig: async (): Promise<EmailConfig> => {
    const response = await apiCall('/api/admin/settings/email');
    const data = await response.json();
    if (data.success && data.config) {
      return data.config;
    }
    throw new Error(data.error || 'Failed to fetch email configuration');
  },

  updateEmailConfig: async (config: Partial<EmailConfig>): Promise<EmailConfig> => {
    const response = await apiCall('/api/admin/settings/email', {
      method: 'PUT',
      body: JSON.stringify(config)
    });
    const data = await response.json();
    if (data.success && data.config) {
      return data.config;
    }
    throw new Error(data.error || 'Failed to update email configuration');
  },

  // Test email configuration
  testEmailConfig: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiCall('/api/admin/settings/email/test', {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      return { success: true, message: data.message || 'Email test successful' };
    }
    throw new Error(data.error || 'Failed to test email configuration');
  },

  // Get settings metadata
  getSettingsMetadata: async (): Promise<SettingsMetadata[]> => {
    const response = await apiCall('/api/admin/settings/metadata');
    const data = await response.json();
    if (data.success && data.metadata) {
      return data.metadata;
    }
    throw new Error(data.error || 'Failed to fetch settings metadata');
  }
};

// Validation helpers
export const validateSystemSettings = (settings: Partial<SystemSettings>): string[] => {
  const errors: string[] = [];

  if (settings.appName !== undefined) {
    if (typeof settings.appName !== 'string' || settings.appName.length < 1 || settings.appName.length > 100) {
      errors.push('App name must be between 1 and 100 characters');
    }
  }

  if (settings.maxUploadSizeMB !== undefined) {
    if (typeof settings.maxUploadSizeMB !== 'number' || settings.maxUploadSizeMB < 1 || settings.maxUploadSizeMB > 1000) {
      errors.push('Max upload size must be between 1 and 1000 MB');
    }
  }

  if (settings.contactEmail !== undefined && settings.contactEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.contactEmail)) {
      errors.push('Contact email must be a valid email address');
    }
  }

  return errors;
};

export const validateEmailConfig = (config: Partial<EmailConfig>): string[] => {
  const errors: string[] = [];

  if (config.smtpHost !== undefined && config.smtpHost) {
    if (typeof config.smtpHost !== 'string' || config.smtpHost.length < 1) {
      errors.push('SMTP host is required');
    }
  }

  if (config.smtpPort !== undefined) {
    if (typeof config.smtpPort !== 'number' || config.smtpPort < 1 || config.smtpPort > 65535) {
      errors.push('SMTP port must be between 1 and 65535');
    }
  }

  if (config.fromEmail !== undefined && config.fromEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.fromEmail)) {
      errors.push('From email must be a valid email address');
    }
  }

  if (config.fromName !== undefined) {
    if (typeof config.fromName !== 'string' || config.fromName.length < 1 || config.fromName.length > 100) {
      errors.push('From name must be between 1 and 100 characters');
    }
  }

  return errors;
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default settingsApi;
