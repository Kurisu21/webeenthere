// controllers/TemplateController.js
const Template = require('../models/Template');

class TemplateController {
  constructor(db) {
    this.templateModel = new Template(db);
  }

  // Get all templates
  async getAllTemplates(req, res) {
    try {
      const templates = await this.templateModel.findAll();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates'
      });
    }
  }

  // Get templates by category
  async getTemplatesByCategory(req, res) {
    try {
      const { category } = req.params;
      const templates = await this.templateModel.findByCategory(category);
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates by category'
      });
    }
  }

  // Get featured templates
  async getFeaturedTemplates(req, res) {
    try {
      const templates = await this.templateModel.findFeatured();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching featured templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured templates'
      });
    }
  }

  // Get single template
  async getTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await this.templateModel.findById(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching template'
      });
    }
  }

  // Create new template (admin only)
  async createTemplate(req, res) {
    try {
      const { name, description, category, html_base, css_base, is_featured } = req.body;
      
      const templateId = await this.templateModel.create({
        name,
        description,
        category,
        html_base,
        css_base,
        is_featured: is_featured || false,
        is_active: true,
        is_community: false,
        creator_user_id: null,
        source_website_id: null
      });

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        data: { id: templateId }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating template'
      });
    }
  }

  // Update template (admin only)
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      await this.templateModel.update(id, updateData);
      
      res.json({
        success: true,
        message: 'Template updated successfully'
      });
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating template'
      });
    }
  }

  // Delete template (admin only)
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      await this.templateModel.delete(id);
      
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting template'
      });
    }
  }

  // NEW: Community Template Methods

  // Get community templates
  async getCommunityTemplates(req, res) {
    try {
      const templates = await this.templateModel.findCommunityTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching community templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching community templates'
      });
    }
  }

  // Get official templates
  async getOfficialTemplates(req, res) {
    try {
      const templates = await this.templateModel.findOfficialTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching official templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching official templates'
      });
    }
  }

  // Create template from website (user)
  async createTemplateFromWebsite(req, res) {
    try {
      const { websiteId } = req.params;
      const userId = req.user.id;
      const { name, description, category } = req.body;

      if (!name || !description || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and category are required'
        });
      }

      const templateId = await this.templateModel.createFromWebsite(websiteId, userId, {
        name,
        description,
        category
      });

      res.status(201).json({
        success: true,
        message: 'Template created successfully from your website',
        data: { id: templateId }
      });
    } catch (error) {
      console.error('Error creating template from website:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error creating template from website'
      });
    }
  }

  // Toggle template active status (admin only)
  async toggleTemplateActive(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      await this.templateModel.toggleActive(id, isActive);
      
      res.json({
        success: true,
        message: `Template ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error toggling template active status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating template status'
      });
    }
  }

  // Toggle template featured status (admin only)
  async toggleTemplateFeatured(req, res) {
    try {
      const { id } = req.params;
      const { isFeatured } = req.body;

      await this.templateModel.update(id, { is_featured: isFeatured });
      
      res.json({
        success: true,
        message: `Template ${isFeatured ? 'featured' : 'unfeatured'} successfully`
      });
    } catch (error) {
      console.error('Error toggling template featured status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating template featured status'
      });
    }
  }

  // Get templates by creator (admin only)
  async getTemplatesByCreator(req, res) {
    try {
      const { userId } = req.params;
      const templates = await this.templateModel.findByCreator(userId);
      
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching templates by creator:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates by creator'
      });
    }
  }

  // Get all templates with creator info (admin only)
  async getAllTemplatesWithCreator(req, res) {
    try {
      const templates = await this.templateModel.findAllWithCreator();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching all templates with creator:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates'
      });
    }
  }

  // Get active templates with creator info (public)
  async getActiveTemplatesWithCreator(req, res) {
    try {
      const templates = await this.templateModel.findActiveWithCreator();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error fetching active templates with creator:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching templates'
      });
    }
  }

  // Import template from HTML file (admin only)
  async importTemplateFromHTML(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No HTML file uploaded'
        });
      }

      const { name, description, category, is_featured } = req.body;

      if (!name || !description || !category) {
        return res.status(400).json({
          success: false,
          message: 'Name, description, and category are required'
        });
      }

      // Read the uploaded file
      const fs = require('fs');
      const htmlContent = fs.readFileSync(req.file.path, 'utf8');

      // Parse HTML and extract CSS
      const { htmlBody, css } = this.parseHTMLFile(htmlContent);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      // Create template
      const templateId = await this.templateModel.create({
        name,
        description,
        category,
        html_base: htmlBody,
        css_base: css,
        is_featured: is_featured === 'true' || is_featured === true,
        is_active: true,
        is_community: false,
        creator_user_id: null,
        source_website_id: null
      });

      res.status(201).json({
        success: true,
        message: 'Template imported successfully',
        data: { id: templateId }
      });
    } catch (error) {
      console.error('Error importing template from HTML:', error);
      
      // Clean up uploaded file if it exists
      if (req.file && req.file.path) {
        const fs = require('fs');
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded file:', cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error importing template from HTML'
      });
    }
  }

  // Parse HTML file and extract body content and CSS
  parseHTMLFile(htmlContent) {
    // Remove DOCTYPE if present
    let cleaned = htmlContent.replace(/<!DOCTYPE[^>]*>/gi, '');

    // Extract CSS from <style> tags
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const cssParts = [];
    let match;
    while ((match = styleRegex.exec(cleaned)) !== null) {
      cssParts.push(match[1].trim());
    }

    // Remove <style> tags from HTML
    cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Extract body content
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let htmlBody = '';
    
    if (bodyMatch && bodyMatch[1]) {
      htmlBody = bodyMatch[1].trim();
    } else {
      // If no <body> tag, try to extract content between <html> tags or use entire content
      const htmlMatch = cleaned.match(/<html[^>]*>([\s\S]*?)<\/html>/i);
      if (htmlMatch && htmlMatch[1]) {
        // Remove <head> section if present
        htmlBody = htmlMatch[1].replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '').trim();
      } else {
        // If no structure tags, assume the entire content is body
        htmlBody = cleaned.trim();
      }
    }

    // Combine all CSS parts
    const css = cssParts.join('\n\n');

    // Clean up HTML body - remove script tags and other unwanted elements
    htmlBody = htmlBody
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .trim();

    return {
      htmlBody: htmlBody || '',
      css: css || ''
    };
  }
}

module.exports = TemplateController;







