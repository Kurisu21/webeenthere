// controllers/WebsiteController.js
const Website = require('../models/Website');
const Template = require('../models/Template');

class WebsiteController {
  constructor(db) {
    this.websiteModel = new Website(db);
    this.templateModel = new Template(db);
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
}

module.exports = WebsiteController;







