// controllers/WebsiteController.js
const Website = require('../models/Website');
const Template = require('../models/Template');
const databaseActivityLogger = require('../services/DatabaseActivityLogger');
const SubscriptionService = require('../services/SubscriptionService');
const PreviewService = require('../services/PreviewService');

class WebsiteController {
  constructor(db) {
    this.db = db;
    this.websiteModel = new Website(db);
    this.templateModel = new Template(db);
    this.subscriptionService = new SubscriptionService(db);
    this.previewService = new PreviewService();
  }

  // Get all websites for a user
  async getUserWebsites(req, res) {
    try {
      const userId = req.user.id;
      const websites = await this.websiteModel.findByUserId(userId);
      
      res.json({
        success: true,
        data: websites
      });
    } catch (error) {
      console.error('Error fetching user websites:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching websites'
      });
    }
  }

  // Get single website
  async getWebsite(req, res) {
    try {
      const { id } = req.params;
      const website = await this.websiteModel.findById(id);
      
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Check if user owns this website
      if (website.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: website
      });
    } catch (error) {
      console.error('Error fetching website:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching website'
      });
    }
  }

  // Create new website
  async createWebsite(req, res) {
    try {
      const userId = req.user.id;
      const { title, slug, template_id, html_content, css_content, ai_prompt_id } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Website title is required'
        });
      }

      // Check subscription limits
      const websiteLimits = await this.subscriptionService.checkWebsiteLimit(userId);
      if (!websiteLimits.canCreate) {
        return res.status(403).json({
          success: false,
          message: `Website creation limit reached. You have used ${websiteLimits.used || 0} of ${websiteLimits.limit} websites allowed.`,
          error: 'SUBSCRIPTION_LIMIT_REACHED',
          upgradeRequired: true,
          currentUsage: websiteLimits
        });
      }

      // Generate unique slug - if slug is provided, use it; otherwise generate username-based slug
      const { generateUniqueSlug, generateUsernameBasedSlug, sanitizeSlug } = require('../utils/slugGenerator');
      let websiteSlug;
      
      if (slug) {
        // If slug is provided, use it and ensure uniqueness
        const baseSlug = slug || title;
        websiteSlug = await generateUniqueSlug(this.websiteModel, baseSlug);
      } else {
        // Auto-generate slug in format: username-random_number
        // Get username from database
        const User = require('../models/User');
        const userModel = new User(this.db);
        const user = await userModel.findById(userId);
        
        if (!user || !user.username) {
          return res.status(400).json({
            success: false,
            message: 'User not found or username missing'
          });
        }
        
        // Generate username-based slug
        websiteSlug = await generateUsernameBasedSlug(this.websiteModel, user.username);
      }

      // If template_id is provided, get template content
      let htmlContent = html_content || '';
      let cssContent = css_content || '';
      
      if (template_id) {
        const template = await this.templateModel.findById(template_id);
        if (template) {
          htmlContent = template.html_base;
          cssContent = template.css_base;
        }
      }

      // Validate template_id - only allow numeric IDs that exist in templates table
      let validTemplateId = null;
      if (template_id && !isNaN(template_id)) {
        // Check if template exists
        const [templates] = await this.db.execute('SELECT id FROM templates WHERE id = ? AND is_active = 1', [template_id]);
        if (templates.length > 0) {
          validTemplateId = template_id;
        }
      }

      const websiteData = {
        user_id: userId,
        title,
        slug: websiteSlug,
        html_content: htmlContent,
        css_content: cssContent,
        template_id: validTemplateId,
        is_published: false,
        is_active: true,
        ai_prompt_id: ai_prompt_id || null
      };

      // Generate preview if content exists
      let previewBuffer = null;
      if (htmlContent) {
        try {
          previewBuffer = await this.previewService.generatePreview(htmlContent, cssContent);
        } catch (error) {
          console.error('Error generating preview during website creation:', error);
          // Continue without preview if generation fails
        }
      }

      if (previewBuffer) {
        websiteData.preview_url = previewBuffer;
      }

      const websiteId = await this.websiteModel.create(websiteData);
      
      // Log website creation activity
      const { extractClientIP } = require('../utils/ipExtractor');
      await databaseActivityLogger.logWebsiteCreated(
        userId,
        websiteId,
        extractClientIP(req),
        req.get('User-Agent'),
        {
          title,
          slug: websiteSlug,
          template_id: validTemplateId,
          has_custom_html: !!html_content,
          has_custom_css: !!css_content
        }
      );
      
      res.status(201).json({
        success: true,
        message: 'Website created successfully',
        data: { id: websiteId, slug: websiteSlug }
      });
    } catch (error) {
      console.error('Error creating website:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating website'
      });
    }
  }

  // Update website
  async updateWebsite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      // Retry logic for database connection issues
      let website;
      let retries = 3;
      while (retries > 0) {
        try {
          website = await this.websiteModel.findById(id);
          break;
        } catch (dbError) {
          if ((dbError.code === 'ECONNRESET' || dbError.code === 'PROTOCOL_CONNECTION_LOST') && retries > 1) {
            console.warn(`[WebsiteController] Database connection error, retrying... (${retries - 1} retries left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
            continue;
          }
          throw dbError;
        }
      }

      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // If slug is being updated, generate unique slug if needed
      if (updateData.slug && updateData.slug !== website.slug) {
        const { generateUniqueSlug, sanitizeSlug } = require('../utils/slugGenerator');
        // Sanitize the slug first
        const sanitizedSlug = sanitizeSlug(updateData.slug);
        if (!sanitizedSlug) {
          return res.status(400).json({
            success: false,
            message: 'Invalid website URL. Please use only letters, numbers, and hyphens.'
          });
        }
        // Generate unique slug (will use the same slug if available, or append number if duplicate)
        updateData.slug = await generateUniqueSlug(this.websiteModel, sanitizedSlug, parseInt(id));
      }

      // Generate preview if HTML content is being updated
      if (updateData.html_content || updateData.css_content) {
        try {
          const htmlContent = updateData.html_content || website.html_content;
          const cssContent = updateData.css_content || website.css_content;
          
          if (htmlContent) {
            const previewBuffer = await this.previewService.generatePreview(htmlContent, cssContent);
            updateData.preview_url = previewBuffer;
          }
        } catch (error) {
          console.error('Error generating preview during website update:', error);
          // Continue without preview if generation fails
        }
      }

      // Log HTML changes for debugging
      if (updateData.html_content) {
        const oldHtml = website.html_content || '';
        const newHtml = updateData.html_content;
        
        console.log('\n=== WEBSITE UPDATE - HTML CHANGE ===');
        console.log(`Website ID: ${id}`);
        console.log(`User ID: ${userId}`);
        console.log(`Old HTML length: ${oldHtml.length}`);
        console.log(`New HTML length: ${newHtml.length}`);
        console.log(`HTML changed: ${oldHtml !== newHtml}`);
        
        if (oldHtml !== newHtml) {
          // Show first 200 chars of each for comparison
          console.log('\n--- OLD HTML (first 200 chars) ---');
          console.log(oldHtml.substring(0, 200));
          console.log('\n--- NEW HTML (first 200 chars) ---');
          console.log(newHtml.substring(0, 200));
          
          // Try to parse and show structure if JSON
          try {
            const oldParsed = JSON.parse(oldHtml);
            const newParsed = JSON.parse(newHtml);
            console.log('\n--- OLD HTML Structure ---');
            console.log(`Has html: ${!!oldParsed.html}, Has css: ${!!oldParsed.css}`);
            if (oldParsed.html) {
              console.log(`Old HTML content length: ${oldParsed.html.length}`);
              console.log(`Old HTML preview: ${oldParsed.html.substring(0, 150)}`);
            }
            console.log('\n--- NEW HTML Structure ---');
            console.log(`Has html: ${!!newParsed.html}, Has css: ${!!newParsed.css}`);
            if (newParsed.html) {
              console.log(`New HTML content length: ${newParsed.html.length}`);
              console.log(`New HTML preview: ${newParsed.html.substring(0, 150)}`);
            }
            
            // Compare the actual HTML content inside JSON
            if (oldParsed.html && newParsed.html) {
              console.log(`\n--- HTML CONTENT COMPARISON ---`);
              console.log(`HTML content changed: ${oldParsed.html !== newParsed.html}`);
              if (oldParsed.html !== newParsed.html) {
                console.log(`Old HTML content (first 100 chars): ${oldParsed.html.substring(0, 100)}`);
                console.log(`New HTML content (first 100 chars): ${newParsed.html.substring(0, 100)}`);
              } else {
                console.warn('⚠️ WARNING: HTML content inside JSON is the SAME! Changes may not have been applied.');
              }
            }
          } catch (e) {
            console.log('HTML is not JSON format, showing as plain text');
          }
        } else {
          console.log('⚠️ WARNING: HTML content did not change!');
        }
        console.log('=====================================\n');
      }
      
      if (updateData.css_content) {
        const oldCss = website.css_content || '';
        const newCss = updateData.css_content;
        console.log(`CSS length - Old: ${oldCss.length}, New: ${newCss.length}, Changed: ${oldCss !== newCss}`);
      }

      // Retry logic for update operation
      retries = 3;
      while (retries > 0) {
        try {
          await this.websiteModel.update(id, updateData);
          console.log(`✅ Website ${id} updated successfully in database`);
          break;
        } catch (dbError) {
          if ((dbError.code === 'ECONNRESET' || dbError.code === 'PROTOCOL_CONNECTION_LOST') && retries > 1) {
            console.warn(`[WebsiteController] Database connection error during update, retrying... (${retries - 1} retries left)`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
            continue;
          }
          throw dbError;
        }
      }
      
      // Log website update activity
      const { extractClientIP } = require('../utils/ipExtractor');
      await databaseActivityLogger.logWebsiteUpdated(
        userId,
        id,
        extractClientIP(req),
        req.get('User-Agent'),
        {
          fields_updated: Object.keys(updateData),
          title: updateData.title || website.title,
          slug: updateData.slug || website.slug
        }
      );
      
      res.json({
        success: true,
        message: 'Website updated successfully'
      });
    } catch (error) {
      console.error('Error updating website:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating website'
      });
    }
  }

  // Delete website
  async deleteWebsite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if website exists and user owns it
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await this.websiteModel.delete(id);
      
      // Log website deletion activity
      await databaseActivityLogger.logActivity({
        userId,
        action: 'website_deleted',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: website.title,
          slug: website.slug,
          was_published: website.is_published
        }
      });
      
      res.json({
        success: true,
        message: 'Website deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting website'
      });
    }
  }

  // Publish website
  async publishWebsite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if website exists and user owns it
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await this.websiteModel.update(id, { is_published: true });
      
      // Log website publication activity
      await databaseActivityLogger.logWebsitePublished(
        userId,
        id,
        req.ip,
        req.get('User-Agent'),
        {
          title: website.title,
          slug: website.slug,
          url: `webeenthere.com/${website.slug}`
        }
      );
      
      res.json({
        success: true,
        message: 'Website published successfully',
        data: { url: `webeenthere.com/${website.slug}` }
      });
    } catch (error) {
      console.error('Error publishing website:', error);
      res.status(500).json({
        success: false,
        message: 'Error publishing website'
      });
    }
  }

  // Unpublish website
  async unpublishWebsite(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if website exists and user owns it
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      if (website.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await this.websiteModel.update(id, { is_published: false });
      
      // Log website unpublication activity
      await databaseActivityLogger.logActivity({
        userId,
        action: 'website_unpublished',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: website.title,
          slug: website.slug
        }
      });
      
      res.json({
        success: true,
        message: 'Website unpublished successfully'
      });
    } catch (error) {
      console.error('Error unpublishing website:', error);
      res.status(500).json({
        success: false,
        message: 'Error unpublishing website'
      });
    }
  }

  // Get public website by slug (for viewing published websites)
  async getPublicWebsite(req, res) {
    try {
      const { slug } = req.params;
      const website = await this.websiteModel.findBySlug(slug);
      
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found',
          details: 'No website exists with this slug. Please check the URL and try again.'
        });
      }

      if (!website.is_published) {
        return res.status(404).json({
          success: false,
          message: 'Website not found',
          details: 'This website exists but is not published. Only published websites can be viewed publicly.'
        });
      }

      res.json({
        success: true,
        data: {
          title: website.title,
          html_content: website.html_content,
          css_content: website.css_content
        }
      });
    } catch (error) {
      console.error('Error fetching public website:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching website'
      });
    }
  }

  // Get all public websites (for testing visitor tracking)
  async getAllPublicWebsites(req, res) {
    try {
      const websites = await this.websiteModel.findPublicWebsites();
      
      res.json({
        success: true,
        data: websites.map(website => ({
          id: website.id,
          title: website.title,
          slug: website.slug,
          is_published: website.is_published,
          created_at: website.created_at
        }))
      });
    } catch (error) {
      console.error('Error fetching public websites:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching websites'
      });
    }
  }

  // Admin: Get all websites with filters and pagination
  async getAllWebsites(req, res) {
    try {
      const { page = 1, limit = 10, status, search, userId } = req.query;
      const offset = (page - 1) * limit;
      
      let whereClause = '1=1';
      const params = [];
      
      if (status) {
        whereClause += ' AND is_published = ?';
        params.push(status === 'published' ? 1 : 0);
      }
      
      if (search) {
        whereClause += ' AND (title LIKE ? OR slug LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      if (userId) {
        whereClause += ' AND user_id = ?';
        params.push(userId);
      }
      
      // Get websites with user info
      const [websites] = await this.db.execute(`
        SELECT w.*, u.username, u.email 
        FROM websites w 
        LEFT JOIN users u ON w.user_id = u.id 
        WHERE ${whereClause}
        ORDER BY w.created_at DESC 
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), parseInt(offset)]);
      
      // Get total count
      const [countResult] = await this.db.execute(`
        SELECT COUNT(*) as total 
        FROM websites w 
        WHERE ${whereClause}
      `, params);
      
      res.json({
        success: true,
        data: {
          websites,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching all websites:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching websites'
      });
    }
  }

  // Check if slug is available
  async checkSlugAvailability(req, res) {
    try {
      const { slug } = req.query;
      const { excludeId } = req.query; // Optional: exclude a website ID (for updates)
      
      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required'
        });
      }

      const { isSlugAvailable, sanitizeSlug } = require('../utils/slugGenerator');
      const sanitized = sanitizeSlug(slug);
      
      if (!sanitized) {
        return res.json({
          success: true,
          available: false,
          message: 'Invalid slug format'
        });
      }

      const available = await isSlugAvailable(
        this.websiteModel, 
        sanitized, 
        excludeId ? parseInt(excludeId) : null
      );

      res.json({
        success: true,
        available,
        sanitizedSlug: sanitized,
        message: available ? 'Slug is available' : 'Slug is already taken'
      });
    } catch (error) {
      console.error('Error checking slug availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking slug availability'
      });
    }
  }

  // Admin: Update website slug
  async updateWebsiteSlug(req, res) {
    try {
      const { id } = req.params;
      const { slug } = req.body;
      
      if (!slug) {
        return res.status(400).json({
          success: false,
          message: 'Slug is required'
        });
      }
      
      // Check if website exists
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      const { generateUniqueSlug, sanitizeSlug } = require('../utils/slugGenerator');
      const sanitizedSlug = sanitizeSlug(slug);
      
      if (!sanitizedSlug) {
        return res.status(400).json({
          success: false,
          message: 'Invalid website URL. Please use only letters, numbers, and hyphens.'
        });
      }

      // Generate unique slug (will use the same slug if available, or append number if duplicate)
      const finalSlug = await generateUniqueSlug(this.websiteModel, sanitizedSlug, parseInt(id));
      
      await this.websiteModel.update(id, { slug: finalSlug });
      
      // Log activity
      const { extractClientIP } = require('../utils/ipExtractor');
      await databaseActivityLogger.logActivity({
        userId: req.user.id,
        action: 'website_slug_updated',
        entityType: 'website',
        entityId: id,
        ipAddress: extractClientIP(req),
        userAgent: req.get('User-Agent'),
        details: {
          old_slug: website.slug,
          new_slug: finalSlug,
          title: website.title
        }
      });
      
      res.json({
        success: true,
        message: 'Website URL updated successfully',
        data: { slug: finalSlug }
      });
    } catch (error) {
      console.error('Error updating website slug:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating website URL'
      });
    }
  }

  // Export website as HTML/CSS
  async exportWebsite(req, res) {
    try {
      const { id } = req.params;
      const { format = 'html' } = req.query;
      
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }
      
      // Check if user owns this website (for regular users) or is admin
      if (req.user.role !== 'admin' && website.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      
      if (format === 'html') {
        // Return HTML with inline CSS
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${website.title}</title>
    <style>
        ${website.css_content || ''}
    </style>
</head>
<body>
    ${website.html_content || ''}
</body>
</html>`;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${website.slug}.html"`);
        res.send(htmlContent);
      } else if (format === 'css') {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Content-Disposition', `attachment; filename="${website.slug}.css"`);
        res.send(website.css_content || '');
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid format. Use "html" or "css"'
        });
      }
    } catch (error) {
      console.error('Error exporting website:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting website'
      });
    }
  }

  // Admin: Force publish website
  async adminPublishWebsite(req, res) {
    try {
      const { id } = req.params;
      
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }
      
      await this.websiteModel.update(id, { is_published: true });
      
      // Log activity
      await databaseActivityLogger.logActivity({
        userId: req.user.id,
        action: 'website_admin_published',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: website.title,
          slug: website.slug,
          original_owner: website.user_id
        }
      });
      
      res.json({
        success: true,
        message: 'Website published successfully'
      });
    } catch (error) {
      console.error('Error publishing website:', error);
      res.status(500).json({
        success: false,
        message: 'Error publishing website'
      });
    }
  }

  // Admin: Force unpublish website
  async adminUnpublishWebsite(req, res) {
    try {
      const { id } = req.params;
      
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }
      
      await this.websiteModel.update(id, { is_published: false });
      
      // Log activity
      await databaseActivityLogger.logActivity({
        userId: req.user.id,
        action: 'website_admin_unpublished',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: website.title,
          slug: website.slug,
          original_owner: website.user_id
        }
      });
      
      res.json({
        success: true,
        message: 'Website unpublished successfully'
      });
    } catch (error) {
      console.error('Error unpublishing website:', error);
      res.status(500).json({
        success: false,
        message: 'Error unpublishing website'
      });
    }
  }

  // Admin: Delete any website
  async adminDeleteWebsite(req, res) {
    try {
      const { id } = req.params;
      
      const website = await this.websiteModel.findById(id);
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }
      
      await this.websiteModel.delete(id);
      
      // Log activity
      await databaseActivityLogger.logActivity({
        userId: req.user.id,
        action: 'website_admin_deleted',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          title: website.title,
          slug: website.slug,
          original_owner: website.user_id,
          was_published: website.is_published
        }
      });
      
      res.json({
        success: true,
        message: 'Website deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting website:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting website'
      });
    }
  }

  // Get hosting statistics
  async getHostingStats(req, res) {
    try {
      const [totalWebsites] = await this.db.execute('SELECT COUNT(*) as count FROM websites WHERE is_active = 1');
      const [publishedWebsites] = await this.db.execute('SELECT COUNT(*) as count FROM websites WHERE is_published = 1 AND is_active = 1');
      const [draftWebsites] = await this.db.execute('SELECT COUNT(*) as count FROM websites WHERE is_published = 0 AND is_active = 1');
      const [totalUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      
      res.json({
        success: true,
        data: {
          totalWebsites: totalWebsites[0].count,
          publishedWebsites: publishedWebsites[0].count,
          draftWebsites: draftWebsites[0].count,
          totalUsers: totalUsers[0].count
        }
      });
    } catch (error) {
      console.error('Error fetching hosting stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching hosting statistics'
      });
    }
  }

  // Get public statistics (no auth required)
  async getPublicStats(req, res) {
    try {
      const Template = require('../models/Template');
      const templateModel = new Template(this.db);
      
      // Get website stats
      const [totalWebsites] = await this.db.execute('SELECT COUNT(*) as count FROM websites WHERE is_active = 1');
      const [publishedWebsites] = await this.db.execute('SELECT COUNT(*) as count FROM websites WHERE is_published = 1 AND is_active = 1');
      
      // Get user stats
      const [totalUsers] = await this.db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
      
      // Get template stats
      const templates = await templateModel.findAll();
      const totalTemplates = templates.length;
      
      res.json({
        success: true,
        data: {
          totalWebsites: totalWebsites[0].count,
          publishedWebsites: publishedWebsites[0].count,
          totalUsers: totalUsers[0].count,
          totalTemplates: totalTemplates
        }
      });
    } catch (error) {
      console.error('Error fetching public stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching statistics',
        error: error.message
      });
    }
  }

  // Get website preview image
  async getWebsitePreview(req, res) {
    try {
      const { id } = req.params;
      const website = await this.websiteModel.findById(id);
      
      if (!website) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
        });
      }

      // Allow access if:
      // 1. User is authenticated and owns the website
      // 2. User is admin
      // 3. Website is published (public preview)
      // Otherwise deny access
      if (req.user) {
        if (req.user.role !== 'admin' && website.user_id !== req.user.id && !website.is_published) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (!website.is_published) {
        // Not authenticated and website is not published
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // If preview exists, return it
      if (website.preview_url) {
        res.setHeader('Content-Type', 'image/png');
        // Use updated_at timestamp for cache-busting - allows browser to revalidate
        // but still cache the image if it hasn't changed
        const cacheMaxAge = 300; // 5 minutes - shorter cache for more frequent updates
        res.setHeader('Cache-Control', `public, max-age=${cacheMaxAge}, must-revalidate`);
        // Add ETag based on updated_at for better cache control
        if (website.updated_at) {
          const etag = `"${new Date(website.updated_at).getTime()}"`;
          res.setHeader('ETag', etag);
          // Check if client has cached version
          const ifNoneMatch = req.headers['if-none-match'];
          if (ifNoneMatch === etag) {
            return res.status(304).end(); // Not Modified
          }
        }
        return res.send(website.preview_url);
      }

      // If no preview exists, generate one (with timeout protection)
      try {
        if (website.html_content) {
          // Set a timeout for preview generation to prevent hanging
          const previewPromise = this.previewService.generatePreview(
            website.html_content,
            website.css_content || ''
          );
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Preview generation timeout')), 60000); // 60 second timeout
          });
          
          const previewBuffer = await Promise.race([previewPromise, timeoutPromise]);
          
          // Save preview to database
          await this.websiteModel.update(id, { preview_url: previewBuffer });
          
          res.setHeader('Content-Type', 'image/png');
          // Shorter cache time for dynamically generated previews
          res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
          return res.send(previewBuffer);
        }
      } catch (error) {
        console.error('Error generating preview:', error.message);
        // Don't throw - return 404 instead to prevent repeated attempts
      }

      // Return placeholder if preview generation fails
      res.status(404).json({
        success: false,
        message: 'Preview not available'
      });
    } catch (error) {
      console.error('Error fetching website preview:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching preview'
      });
    }
  }
}

module.exports = WebsiteController;







