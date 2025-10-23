// Utility functions for formatting activity details
export const formatActivityDetails = (action: string, details: any): string => {
  // Handle different types of details
  let parsedDetails = details;
  
  // If details is a string, try to parse it as JSON
  if (typeof details === 'string') {
    try {
      parsedDetails = JSON.parse(details);
    } catch (e) {
      // If it's not valid JSON, treat it as a simple string
      return details.length > 100 ? details.substring(0, 100) + '...' : details;
    }
  }
  
  // If details is null, undefined, or not an object, return appropriate message
  if (!parsedDetails || typeof parsedDetails !== 'object') {
    if (action === 'user_login') return 'Logged in successfully';
    if (action === 'user_logout') return 'Logged out';
    if (action === 'failed_login_attempt') return 'Login attempt failed';
    return 'No additional details';
  }

  try {
    switch (action) {
      case 'website_created':
        return `Created website "${parsedDetails.title || 'Untitled'}"${parsedDetails.slug ? ` (${parsedDetails.slug})` : ''}${parsedDetails.template_id ? ` using template ${parsedDetails.template_id}` : ''}`;
      
      case 'website_updated':
        const fields = parsedDetails.fields_updated || [];
        return `Updated website "${parsedDetails.title || 'Untitled'}"${fields.length > 0 ? ` - Changed: ${fields.join(', ')}` : ''}`;
      
      case 'website_published':
        return `Published website "${parsedDetails.title || 'Untitled'}"${parsedDetails.url ? ` → ${parsedDetails.url}` : ''}`;
      
      case 'website_unpublished':
        return `Unpublished website "${parsedDetails.title || 'Untitled'}"`;
      
      case 'website_deleted':
        return `Deleted website "${parsedDetails.title || 'Untitled'}"${parsedDetails.was_published ? ' (was published)' : ' (was draft)'}`;
      
      case 'profile_updated':
        const changedFields = parsedDetails.fields_changed || [];
        let profileDetails = `Updated profile`;
        if (changedFields.includes('username') && parsedDetails.username) {
          profileDetails += ` - Username: ${parsedDetails.username}`;
        }
        if (changedFields.includes('email') && parsedDetails.email) {
          profileDetails += ` - Email: ${parsedDetails.email}`;
        }
        if (changedFields.includes('theme_mode') && parsedDetails.theme_mode) {
          profileDetails += ` - Theme: ${parsedDetails.theme_mode}`;
        }
        return profileDetails;
      
      case 'password_changed':
        return `Changed password${parsedDetails.method ? ` via ${parsedDetails.method.replace('_', ' ')}` : ''}`;
      
      case 'user_login':
        return `Logged in${parsedDetails.login_method ? ` via ${parsedDetails.login_method}` : ''}`;
      
      case 'user_logout':
        return 'Logged out';
      
      case 'failed_login_attempt':
        return `Failed login attempt${parsedDetails.email ? ` for ${parsedDetails.email}` : ''}${parsedDetails.reason ? ` - ${parsedDetails.reason}` : ''}`;
      
      case 'template_selected':
        return `Selected template${parsedDetails.template_name ? ` "${parsedDetails.template_name}"` : ''}${parsedDetails.template_id ? ` (ID: ${parsedDetails.template_id})` : ''}`;
      
      case 'template_customized':
        return `Customized template${parsedDetails.template_name ? ` "${parsedDetails.template_name}"` : ''}`;
      
      case 'block_added':
        return `Added ${parsedDetails.block_type || 'block'}${parsedDetails.section ? ` to ${parsedDetails.section}` : ''}${parsedDetails.position !== undefined ? ` at position ${parsedDetails.position}` : ''}`;
      
      case 'block_updated':
        return `Updated ${parsedDetails.block_type || 'block'}${parsedDetails.section ? ` in ${parsedDetails.section}` : ''}`;
      
      case 'block_deleted':
        return `Deleted ${parsedDetails.block_type || 'block'}${parsedDetails.section ? ` from ${parsedDetails.section}` : ''}`;
      
      case 'avatar_updated':
        return 'Updated profile avatar';
      
      case 'email_changed':
        return `Changed email${parsedDetails.old_email ? ` from ${parsedDetails.old_email}` : ''}${parsedDetails.new_email ? ` to ${parsedDetails.new_email}` : ''}`;
      
      case 'theme_changed':
        return `Changed theme${parsedDetails.old_theme ? ` from ${parsedDetails.old_theme}` : ''}${parsedDetails.new_theme ? ` to ${parsedDetails.new_theme}` : ''}`;
      
      default:
        // For unknown actions, try to create a readable description
        const keys = Object.keys(parsedDetails);
        if (keys.length === 0) return 'No additional details';
        
        const readableDetails = keys.map(key => {
          const value = parsedDetails[key];
          if (typeof value === 'string' || typeof value === 'number') {
            return `${key}: ${value}`;
          }
          return `${key}: ${JSON.stringify(value)}`;
        }).join(', ');
        
        return readableDetails.length > 100 
          ? readableDetails.substring(0, 100) + '...'
          : readableDetails;
    }
  } catch (error) {
    console.error('Error formatting activity details:', error);
    return 'Error formatting details';
  }
};

// Get a more descriptive action name
export const getActionDescription = (action: string): string => {
  const actionDescriptions: Record<string, string> = {
    'website_created': 'Website Created',
    'website_updated': 'Website Updated',
    'website_published': 'Website Published',
    'website_unpublished': 'Website Unpublished',
    'website_deleted': 'Website Deleted',
    'profile_updated': 'Profile Updated',
    'password_changed': 'Password Changed',
    'user_login': 'User Login',
    'user_logout': 'User Logout',
    'failed_login_attempt': 'Failed Login',
    'template_selected': 'Template Selected',
    'template_customized': 'Template Customized',
    'block_added': 'Block Added',
    'block_updated': 'Block Updated',
    'block_deleted': 'Block Deleted',
    'avatar_updated': 'Avatar Updated',
    'email_changed': 'Email Changed',
    'theme_changed': 'Theme Changed'
  };

  return actionDescriptions[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Get activity category for grouping
export const getActivityCategory = (action: string): string => {
  if (action.startsWith('website_')) return 'Website';
  if (action.startsWith('profile_') || action.startsWith('user_') || action.startsWith('password_') || action.startsWith('email_') || action.startsWith('theme_') || action.startsWith('avatar_')) return 'Profile';
  if (action.startsWith('template_') || action.startsWith('block_')) return 'Template';
  if (action.startsWith('failed_')) return 'Security';
  return 'Other';
};

// Get activity priority/importance level
export const getActivityPriority = (action: string): 'low' | 'medium' | 'high' | 'critical' => {
  const criticalActions = ['password_changed', 'email_changed', 'website_deleted'];
  const highActions = ['website_published', 'website_unpublished', 'failed_login_attempt'];
  const mediumActions = ['website_created', 'website_updated', 'profile_updated'];
  
  if (criticalActions.includes(action)) return 'critical';
  if (highActions.includes(action)) return 'high';
  if (mediumActions.includes(action)) return 'medium';
  return 'low';
};

// Format timestamp for display
export const formatActivityTimestamp = (timestamp: string): { date: string; time: string; relative: string } => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let relative = '';
  if (diffMins < 1) relative = 'Just now';
  else if (diffMins < 60) relative = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  else if (diffHours < 24) relative = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  else if (diffDays < 7) relative = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  else relative = date.toLocaleDateString();

  return {
    date: date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    relative
  };
};

export default {
  formatActivityDetails,
  getActionDescription,
  getActivityCategory,
  getActivityPriority,
  formatActivityTimestamp
};
