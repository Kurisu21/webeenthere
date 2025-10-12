import { useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS, apiGet, apiPost } from '../../../../lib/apiConfig';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  html: string;
  css: string;
  image?: string;
  is_featured?: boolean;
  tags?: string[];
}

export const useTemplateIntegration = () => {
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  // Load available templates
  const loadTemplates = useCallback(async () => {
    setIsTemplateLoading(true);
    try {
      const response = await apiGet(API_ENDPOINTS.TEMPLATES);
      if (response.success) {
        setAvailableTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsTemplateLoading(false);
    }
  }, []);

  // Load a specific template
  const loadTemplate = useCallback(async (templateId: string): Promise<Template | null> => {
    setIsTemplateLoading(true);
    try {
      const response = await apiGet(`${API_ENDPOINTS.TEMPLATES}/${templateId}`);
      if (response.success) {
        const template = response.data;
        setCurrentTemplate(template);
        return template;
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsTemplateLoading(false);
    }
    return null;
  }, []);

  // Save current website as template
  const saveAsTemplate = useCallback(async (
    templateData: {
      name: string;
      description: string;
      category: string;
      html: string;
      css: string;
      tags?: string[];
    }
  ) => {
    setIsTemplateLoading(true);
    try {
      const response = await apiPost(API_ENDPOINTS.TEMPLATES, templateData);
      if (response.success) {
        // Reload templates to include the new one
        await loadTemplates();
        return response.data;
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsTemplateLoading(false);
    }
    return null;
  }, [loadTemplates]);

  // Get templates by category
  const getTemplatesByCategory = useCallback((category: string): Template[] => {
    if (category === 'all') {
      return availableTemplates;
    }
    return availableTemplates.filter(template => template.category === category);
  }, [availableTemplates]);

  // Get featured templates
  const getFeaturedTemplates = useCallback((): Template[] => {
    return availableTemplates.filter(template => template.is_featured);
  }, [availableTemplates]);

  // Search templates
  const searchTemplates = useCallback((query: string): Template[] => {
    if (!query.trim()) {
      return availableTemplates;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return availableTemplates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [availableTemplates]);

  // Load default templates if none available
  const loadDefaultTemplates = useCallback(() => {
    const defaultTemplates: Template[] = [
      {
        id: 'blank',
        name: 'Blank Template',
        description: 'Start from scratch with a clean slate',
        category: 'general',
        html: `
          <div class="container">
            <div class="row">
              <div class="col-md-12">
                <h1>Welcome to Your Website</h1>
                <p>Start building your amazing website!</p>
              </div>
            </div>
          </div>
        `,
        css: `
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            text-align: center;
          }
          p {
            color: #666;
            text-align: center;
          }
        `,
        is_featured: true,
        tags: ['blank', 'starter', 'minimal']
      },
      {
        id: 'business',
        name: 'Business Template',
        description: 'Professional business website template',
        category: 'business',
        html: `
          <header style="background: #343a40; color: white; padding: 1rem 0;">
            <div class="container">
              <nav style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0;">Your Business</h2>
                <ul style="display: flex; list-style: none; margin: 0; padding: 0;">
                  <li style="margin-left: 2rem;"><a href="#home" style="color: white; text-decoration: none;">Home</a></li>
                  <li style="margin-left: 2rem;"><a href="#about" style="color: white; text-decoration: none;">About</a></li>
                  <li style="margin-left: 2rem;"><a href="#services" style="color: white; text-decoration: none;">Services</a></li>
                  <li style="margin-left: 2rem;"><a href="#contact" style="color: white; text-decoration: none;">Contact</a></li>
                </ul>
              </nav>
            </div>
          </header>
          
          <section id="home" style="padding: 100px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
            <div class="container">
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to Your Business</h1>
              <p style="font-size: 1.2rem; margin-bottom: 2rem;">We provide exceptional services to help your business grow</p>
              <button style="padding: 12px 30px; font-size: 1.1rem; border: none; border-radius: 5px; background: #007bff; color: white; cursor: pointer;">Get Started</button>
            </div>
          </section>
          
          <section id="about" style="padding: 80px 0; background: #f8f9fa;">
            <div class="container">
              <div class="row">
                <div class="col-md-6">
                  <h2 style="margin-bottom: 1rem;">About Us</h2>
                  <p style="margin-bottom: 1rem;">We are a dedicated team of professionals committed to delivering excellence.</p>
                  <p>Our mission is to help businesses achieve their goals through innovative solutions and exceptional service.</p>
                </div>
                <div class="col-md-6">
                  <img src="https://via.placeholder.com/500x300" alt="About Us" style="width: 100%; height: auto; border-radius: 8px;">
                </div>
              </div>
            </div>
          </section>
          
          <section id="services" style="padding: 80px 0;">
            <div class="container">
              <h2 style="text-align: center; margin-bottom: 3rem;">Our Services</h2>
              <div class="row">
                <div class="col-md-4" style="text-align: center; padding: 2rem;">
                  <h3>Service 1</h3>
                  <p>Description of your first service and how it benefits clients.</p>
                </div>
                <div class="col-md-4" style="text-align: center; padding: 2rem;">
                  <h3>Service 2</h3>
                  <p>Description of your second service and how it benefits clients.</p>
                </div>
                <div class="col-md-4" style="text-align: center; padding: 2rem;">
                  <h3>Service 3</h3>
                  <p>Description of your third service and how it benefits clients.</p>
                </div>
              </div>
            </div>
          </section>
          
          <section id="contact" style="padding: 80px 0; background: #343a40; color: white;">
            <div class="container">
              <h2 style="text-align: center; margin-bottom: 3rem;">Contact Us</h2>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Email:</strong> hello@yourbusiness.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Business St, City, State 12345</p>
                </div>
                <div class="col-md-6">
                  <form>
                    <div style="margin-bottom: 1rem;">
                      <input type="text" placeholder="Your Name" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                      <input type="email" placeholder="Your Email" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                      <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 10px; border: none; border-radius: 4px;"></textarea>
                    </div>
                    <button type="submit" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        `,
        css: `
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }
          .row {
            display: flex;
            flex-wrap: wrap;
          }
          .col-md-4 {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .col-md-6 {
            flex: 0 0 50%;
            max-width: 50%;
          }
          @media (max-width: 768px) {
            .col-md-4, .col-md-6 {
              flex: 0 0 100%;
              max-width: 100%;
            }
          }
          h1, h2, h3 {
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 1rem;
          }
          button {
            cursor: pointer;
            transition: background-color 0.3s;
          }
          button:hover {
            background-color: #0056b3 !important;
          }
        `,
        is_featured: true,
        tags: ['business', 'professional', 'corporate']
      },
      {
        id: 'portfolio',
        name: 'Portfolio Template',
        description: 'Creative portfolio template for artists and designers',
        category: 'portfolio',
        html: `
          <header style="background: white; padding: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div class="container">
              <nav style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; color: #333;">Your Portfolio</h2>
                <ul style="display: flex; list-style: none; margin: 0; padding: 0;">
                  <li style="margin-left: 2rem;"><a href="#work" style="color: #333; text-decoration: none;">Work</a></li>
                  <li style="margin-left: 2rem;"><a href="#about" style="color: #333; text-decoration: none;">About</a></li>
                  <li style="margin-left: 2rem;"><a href="#contact" style="color: #333; text-decoration: none;">Contact</a></li>
                </ul>
              </nav>
            </div>
          </header>
          
          <section id="hero" style="padding: 150px 0; background: #f8f9fa; text-align: center;">
            <div class="container">
              <h1 style="font-size: 4rem; margin-bottom: 1rem; color: #333;">Creative Designer</h1>
              <p style="font-size: 1.3rem; color: #666; margin-bottom: 2rem;">Bringing ideas to life through design</p>
              <button style="padding: 15px 40px; font-size: 1.1rem; border: 2px solid #333; background: transparent; color: #333; cursor: pointer; transition: all 0.3s;">View My Work</button>
            </div>
          </section>
          
          <section id="work" style="padding: 100px 0;">
            <div class="container">
              <h2 style="text-align: center; margin-bottom: 3rem; color: #333;">Featured Work</h2>
              <div class="row">
                <div class="col-md-4" style="margin-bottom: 2rem;">
                  <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; text-align: center;">
                    <img src="https://via.placeholder.com/300x200" alt="Project 1" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 1rem;">
                    <h3>Project 1</h3>
                    <p>Description of your first project and the creative process.</p>
                  </div>
                </div>
                <div class="col-md-4" style="margin-bottom: 2rem;">
                  <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; text-align: center;">
                    <img src="https://via.placeholder.com/300x200" alt="Project 2" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 1rem;">
                    <h3>Project 2</h3>
                    <p>Description of your second project and the creative process.</p>
                  </div>
                </div>
                <div class="col-md-4" style="margin-bottom: 2rem;">
                  <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; text-align: center;">
                    <img src="https://via.placeholder.com/300x200" alt="Project 3" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 1rem;">
                    <h3>Project 3</h3>
                    <p>Description of your third project and the creative process.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section id="about" style="padding: 100px 0; background: #f8f9fa;">
            <div class="container">
              <div class="row">
                <div class="col-md-6">
                  <h2 style="margin-bottom: 1rem; color: #333;">About Me</h2>
                  <p style="margin-bottom: 1rem; color: #666;">I'm a passionate designer with over 5 years of experience creating beautiful and functional designs.</p>
                  <p style="color: #666;">I specialize in user experience design, branding, and digital art. My goal is to create designs that not only look great but also solve real problems.</p>
                </div>
                <div class="col-md-6">
                  <img src="https://via.placeholder.com/500x400" alt="About Me" style="width: 100%; height: auto; border-radius: 8px;">
                </div>
              </div>
            </div>
          </section>
          
          <section id="contact" style="padding: 100px 0; background: #333; color: white;">
            <div class="container">
              <h2 style="text-align: center; margin-bottom: 3rem;">Let's Work Together</h2>
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Email:</strong> hello@yourportfolio.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Location:</strong> New York, NY</p>
                </div>
                <div class="col-md-6">
                  <form>
                    <div style="margin-bottom: 1rem;">
                      <input type="text" placeholder="Your Name" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                      <input type="email" placeholder="Your Email" style="width: 100%; padding: 10px; border: none; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 1rem;">
                      <textarea placeholder="Your Message" rows="4" style="width: 100%; padding: 10px; border: none; border-radius: 4px;"></textarea>
                    </div>
                    <button type="submit" style="width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Send Message</button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        `,
        css: `
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }
          .row {
            display: flex;
            flex-wrap: wrap;
          }
          .col-md-4 {
            flex: 0 0 33.333333%;
            max-width: 33.333333%;
          }
          .col-md-6 {
            flex: 0 0 50%;
            max-width: 50%;
          }
          @media (max-width: 768px) {
            .col-md-4, .col-md-6 {
              flex: 0 0 100%;
              max-width: 100%;
            }
          }
          h1, h2, h3 {
            margin-bottom: 1rem;
          }
          p {
            margin-bottom: 1rem;
          }
          button {
            cursor: pointer;
            transition: all 0.3s;
          }
          button:hover {
            background: #333 !important;
            color: white !important;
          }
        `,
        is_featured: true,
        tags: ['portfolio', 'creative', 'design', 'art']
      }
    ];

    setAvailableTemplates(defaultTemplates);
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates().catch(() => {
      // If API fails, load default templates
      loadDefaultTemplates();
    });
  }, [loadTemplates, loadDefaultTemplates]);

  return {
    availableTemplates,
    currentTemplate,
    isTemplateLoading,
    loadTemplate,
    saveAsTemplate,
    getTemplatesByCategory,
    getFeaturedTemplates,
    searchTemplates,
    loadDefaultTemplates
  };
};








