// controllers/WebsiteController.js
const Website = require('../models/Website');
const Template = require('../models/Template');
const databaseActivityLogger = require('../services/DatabaseActivityLogger');
const SubscriptionService = require('../services/SubscriptionService');

class WebsiteController {
  constructor(db) {
    this.db = db;
    this.websiteModel = new Website(db);
    this.templateModel = new Template(db);
    this.subscriptionService = new SubscriptionService(db);
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
      const { title, slug, template_id, html_content, css_content } = req.body;

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

      // Generate slug if not provided
      const websiteSlug = slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Check if slug is unique
      const existingWebsite = await this.websiteModel.findBySlug(websiteSlug);
      if (existingWebsite) {
        return res.status(400).json({
          success: false,
          message: 'Website URL already exists'
        });
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
        is_active: true
      };

      const websiteId = await this.websiteModel.create(websiteData);
      
      // Log website creation activity
      await databaseActivityLogger.logWebsiteCreated(
        userId,
        websiteId,
        req.ip,
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

      // If slug is being updated, check uniqueness
      if (updateData.slug && updateData.slug !== website.slug) {
        const existingWebsite = await this.websiteModel.findBySlug(updateData.slug);
        if (existingWebsite && existingWebsite.id !== parseInt(id)) {
          return res.status(400).json({
            success: false,
            message: 'Website URL already exists'
          });
        }
      }

      await this.websiteModel.update(id, updateData);
      
      // Log website update activity
      await databaseActivityLogger.logWebsiteUpdated(
        userId,
        id,
        req.ip,
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
      
      if (!website || !website.is_published) {
        return res.status(404).json({
          success: false,
          message: 'Website not found'
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
      
      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          success: false,
          message: 'Slug must contain only lowercase letters, numbers, and hyphens'
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
      
      // Check if slug is unique (excluding current website)
      const existingWebsite = await this.websiteModel.findBySlug(slug);
      if (existingWebsite && existingWebsite.id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: 'Website URL already exists'
        });
      }
      
      await this.websiteModel.update(id, { slug });
      
      // Log activity
      await databaseActivityLogger.logActivity({
        userId: req.user.id,
        action: 'website_slug_updated',
        entityType: 'website',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        details: {
          old_slug: website.slug,
          new_slug: slug,
          title: website.title
        }
      });
      
      res.json({
        success: true,
        message: 'Website URL updated successfully',
        data: { slug }
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
}

module.exports = WebsiteController;







