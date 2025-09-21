// controllers/TemplateController.js
const Template = require('../models/Template');

class TemplateController {
  constructor() {
    this.templateModel = new Template();
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
        is_active: true
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
}

module.exports = TemplateController;







