'use client';

import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import type { Editor } from 'grapesjs';
import { businessBlocks } from './blocks/businessBlocks';
import { contentCreatorBlocks } from './blocks/contentCreatorBlocks';
import { enhancedSections } from './blocks/enhancedSections';
import { comprehensiveBlocks } from './blocks/comprehensiveBlocks';
import { responsiveCSS } from './blocks/responsiveUtils';
import { imagePlaceholderCSS } from './blocks/imagePlaceholder';
import { interactiveComponentsCSS } from './blocks/interactiveComponents';
import './blocks/blockStyles.css';

interface GrapesJSEditorProps {
  onEditorInit?: (editor: Editor) => void;
  options?: any;
}

export default function GrapesJSEditor({ onEditorInit, options }: GrapesJSEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize GrapesJS editor with simplified config
    const editor = grapesjs.init({
      container: containerRef.current,
      height: '100%',
      width: '100%',
      storageManager: {
        autosave: false,
        autoload: false,
      },
      // Enable and customize the built-in Rich Text Editor (RTE)
      // Users can double-click text to open this toolbar
      // We extend with headings, alignment, and lists
      // (defaults like bold/italic/underline/link remain available)
      // Note: Actions added after init below ensure compatibility with typings
      // Note: RTE actions are extended post-init to avoid version-specific
      // constraints. Leaving defaults here prevents init-time errors.
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
          // Tailwind CDN CSS is not available as a static stylesheet in v3+
          // If Tailwind utilities are needed inside the canvas iframe,
          // serve a compiled Tailwind CSS from /public and link it here.
        ],
      },
      blockManager: {
        appendTo: '.blocks-container',
        defaults: {
          open: true, // Open categories by default so blocks are visible
        },
        blocks: [
          {
            id: 'section',
            label: '<b>Section</b>',
            attributes: { class: 'gjs-block-section' },
            media: `
              <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
                <div style="width:80%;height:60%;border-radius:6px;border:1px solid currentColor;position:relative;">
                  <div style="position:absolute;top:0;left:0;right:0;height:10px;background:currentColor;opacity:.15;border-bottom:1px solid currentColor"></div>
                </div>
              </div>
            `,
            content: '<section class="p-8 bg-gray-100 min-h-screen"><div class="max-w-6xl mx-auto">Section Content</div></section>',
            category: 'Layout',
          },
          {
            id: 'text',
            label: 'Text',
            media: `
              <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg);font-weight:700;font-size:22px">T</div>
            `,
            content: { type: 'text', components: 'Insert your text here' },
            category: 'Basic',
          },
          {
            id: 'image',
            label: 'Image',
            media: `
              <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="2"></circle>
                  <path d="M21 15l-5-5L5 21"></path>
                </svg>
              </div>
            `,
            select: true,
            content: { type: 'image' },
            activate: true,
            category: 'Basic',
          },
          {
            id: 'heading',
            label: 'Heading',
            media: `
              <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg);font-weight:800;font-size:18px">H1</div>
            `,
            content: { type: 'text', tagName: 'h1', components: 'Heading Text' },
            category: 'Basic',
          },
          {
            id: 'button',
            label: 'Button',
            media: `
              <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
                <div style="padding:6px 12px;border-radius:6px;border:1px solid currentColor;font-weight:600;font-size:12px">Button</div>
              </div>
            `,
            content: '<button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Click Me</button>',
            category: 'Basic',
          },
          {
            id: 'hero',
            label: 'Hero Section',
            content: `<section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
              <div class="container mx-auto px-4 text-center">
                <h1 class="text-5xl font-bold mb-4">Your Hero Title</h1>
                <p class="text-xl mb-8">Your hero subtitle goes here</p>
                <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Get Started</button>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'footer',
            label: 'Footer',
            content: `<footer class="bg-gray-800 text-white py-12">
              <div class="container mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 class="text-xl font-bold mb-4">Company</h3>
                    <p>About Us</p>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold mb-4">Support</h3>
                    <p>Contact Us</p>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold mb-4">Follow</h3>
                    <div class="flex space-x-4">
                      <a href="#" class="hover:text-blue-400">Facebook</a>
                      <a href="#" class="hover:text-blue-400">Twitter</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>`,
            category: 'Sections',
          },
          // Pre-styled sections
          {
            id: 'cta-section',
            label: 'CTA Section',
            content: `<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 5rem 1rem; text-align: center;">
              <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
                <h2 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: white;">Ready to Get Started?</h2>
                <p style="font-size: 1.25rem; margin-bottom: 2rem; color: white;">Join thousands of satisfied customers today</p>
                <button style="background: white; color: #764ba2; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: bold; border: none; cursor: pointer;">Sign Up Now</button>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'features-grid',
            label: 'Features Grid',
            content: `<section style="padding: 4rem 1rem; background: #f9fafb;">
              <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
                <h2 style="font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 3rem; color: #111827;">Our Features</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                  <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <div style="width: 4rem; height: 4rem; background: #dbeafe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                      <svg style="width: 2rem; height: 2rem; color: #2563eb;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #111827;">Fast</h3>
                    <p style="color: #4b5563;">Lightning fast performance</p>
                  </div>
                  <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <div style="width: 4rem; height: 4rem; background: #d1fae5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                      <svg style="width: 2rem; height: 2rem; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #111827;">Secure</h3>
                    <p style="color: #4b5563;">Bank-level security</p>
                  </div>
                  <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                    <div style="width: 4rem; height: 4rem; background: #f3e8ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                      <svg style="width: 2rem; height: 2rem; color: #9333ea;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                    </div>
                    <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; color: #111827;">Customizable</h3>
                    <p style="color: #4b5563;">Tailor to your needs</p>
                  </div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'testimonials',
            label: 'Testimonials',
            content: `<section class="py-16 bg-gray-100">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">What Clients Say</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-gray-600 mb-4 italic">"Amazing service! Highly recommend to anyone looking for quality."</p>
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <p class="font-bold">John Doe</p>
                        <p class="text-sm text-gray-500">CEO, Company</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-gray-600 mb-4 italic">"Best decision we made. Exceeded our expectations!"</p>
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <p class="font-bold">Jane Smith</p>
                        <p class="text-sm text-gray-500">Founder, Startup</p>
                      </div>
                    </div>
                  </div>
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <p class="text-gray-600 mb-4 italic">"Outstanding results! Will definitely work with again."</p>
                    <div class="flex items-center">
                      <div class="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <p class="font-bold">Mike Johnson</p>
                        <p class="text-sm text-gray-500">Director, Enterprise</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'pricing-cards',
            label: 'Pricing Cards',
            content: `<section class="py-20 bg-white">
              <div class="container mx-auto px-4">
                <h2 class="text-4xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div class="bg-gray-50 p-8 rounded-lg">
                    <h3 class="text-2xl font-bold mb-4">Basic</h3>
                    <p class="text-4xl font-bold mb-2">$9<span class="text-lg text-gray-500">/month</span></p>
                    <ul class="space-y-3 mb-8">
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Feature 1</li>
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Feature 2</li>
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Feature 3</li>
                    </ul>
                    <button class="w-full bg-gray-800 text-white py-3 rounded-lg font-bold">Get Started</button>
                  </div>
                  <div class="bg-blue-600 text-white p-8 rounded-lg transform scale-105 shadow-xl">
                    <div class="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold w-fit mb-4">POPULAR</div>
                    <h3 class="text-2xl font-bold mb-4">Pro</h3>
                    <p class="text-4xl font-bold mb-2">$29<span class="text-lg opacity-80">/month</span></p>
                    <ul class="space-y-3 mb-8">
                      <li class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Everything in Basic</li>
                      <li class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Priority Support</li>
                      <li class="flex items-center"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Advanced Features</li>
                    </ul>
                    <button class="w-full bg-white text-blue-600 py-3 rounded-lg font-bold">Get Started</button>
                  </div>
                  <div class="bg-gray-50 p-8 rounded-lg">
                    <h3 class="text-2xl font-bold mb-4">Enterprise</h3>
                    <p class="text-4xl font-bold mb-2">$99<span class="text-lg text-gray-500">/month</span></p>
                    <ul class="space-y-3 mb-8">
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Everything in Pro</li>
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Custom Solutions</li>
                      <li class="flex items-center"><svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 24/7 Support</li>
                    </ul>
                    <button class="w-full bg-gray-800 text-white py-3 rounded-lg font-bold">Get Started</button>
                  </div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'stats-section',
            label: 'Stats/Numbers',
            content: `<section class="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
              <div class="container mx-auto px-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div class="text-5xl font-bold mb-2">10K+</div>
                    <div class="text-xl opacity-90">Happy Customers</div>
                  </div>
                  <div>
                    <div class="text-5xl font-bold mb-2">500+</div>
                    <div class="text-xl opacity-90">Projects Done</div>
                  </div>
                  <div>
                    <div class="text-5xl font-bold mb-2">50+</div>
                    <div class="text-xl opacity-90">Team Members</div>
                  </div>
                  <div>
                    <div class="text-5xl font-bold mb-2">99%</div>
                    <div class="text-xl opacity-90">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'team-grid',
            label: 'Team Members',
            content: `<section class="py-16 bg-white">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-bold">John Doe</h3>
                    <p class="text-gray-600">CEO & Founder</p>
                  </div>
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-bold">Jane Smith</h3>
                    <p class="text-gray-600">CTO</p>
                  </div>
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-bold">Mike Johnson</h3>
                    <p class="text-gray-600">Lead Designer</p>
                  </div>
                  <div class="text-center">
                    <div class="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <h3 class="text-xl font-bold">Sarah Williams</h3>
                    <p class="text-gray-600">Marketing Head</p>
                  </div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'contact-form',
            label: 'Contact Form',
            content: `<section class="py-16 bg-gray-50">
              <div class="container mx-auto px-4 max-w-2xl">
                <h2 class="text-3xl font-bold text-center mb-8">Get In Touch</h2>
                <form class="bg-white p-8 rounded-lg shadow-md">
                  <div class="mb-6">
                    <label class="block text-gray-700 font-bold mb-2">Name</label>
                    <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name">
                  </div>
                  <div class="mb-6">
                    <label class="block text-gray-700 font-bold mb-2">Email</label>
                    <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com">
                  </div>
                  <div class="mb-6">
                    <label class="block text-gray-700 font-bold mb-2">Message</label>
                    <textarea rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your message"></textarea>
                  </div>
                  <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">Send Message</button>
                </form>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'newsletter-signup',
            label: 'Newsletter Signup',
            content: `<section class="py-16 bg-blue-600 text-white">
              <div class="container mx-auto px-4 text-center">
                <h2 class="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                <p class="text-lg mb-8 opacity-90">Get the latest updates and news delivered to your inbox</p>
                <form class="max-w-md mx-auto flex gap-4">
                  <input type="email" placeholder="Enter your email" class="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none">
                  <button type="submit" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">Subscribe</button>
                </form>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'gallery-grid',
            label: 'Gallery Grid',
            content: `<section class="py-16 bg-white">
              <div class="container mx-auto px-4">
                <h2 class="text-3xl font-bold text-center mb-12">Our Gallery</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div class="aspect-square bg-gray-200 rounded-lg"></div>
                  <div class="aspect-square bg-gray-300 rounded-lg"></div>
                  <div class="aspect-square bg-gray-200 rounded-lg"></div>
                  <div class="aspect-square bg-gray-300 rounded-lg"></div>
                  <div class="aspect-square bg-gray-300 rounded-lg"></div>
                  <div class="aspect-square bg-gray-200 rounded-lg"></div>
                  <div class="aspect-square bg-gray-200 rounded-lg"></div>
                  <div class="aspect-square bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          {
            id: 'video-section',
            label: 'Video Section',
            content: `<section class="py-16 bg-gray-100">
              <div class="container mx-auto px-4 max-w-4xl">
                <div class="text-center mb-8">
                  <h2 class="text-3xl font-bold mb-4">Watch Our Story</h2>
                  <p class="text-lg text-gray-600 mb-8">Learn more about who we are and what we do</p>
                </div>
                <div class="bg-gray-800 aspect-video rounded-lg flex items-center justify-center">
                  <svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </section>`,
            category: 'Sections',
          },
          // Icon blocks - Social media
          {
            id: 'icon-facebook',
            label: 'Facebook',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg><span style="font-size:11px;color:var(--text-primary);">Facebook</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-twitter',
            label: 'Twitter',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="#1DA1F2" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.29 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg><span style="font-size:11px;color:var(--text-primary);">Twitter</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="#1DA1F2" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.29 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-instagram',
            label: 'Instagram',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="#E4405F" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.699-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg><span style="font-size:11px;color:var(--text-primary);">Instagram</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="#E4405F" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.699-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-linkedin',
            label: 'LinkedIn',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg><span style="font-size:11px;color:var(--text-primary);">LinkedIn</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="#0A66C2" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-youtube',
            label: 'YouTube',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="#FF0000" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg><span style="font-size:11px;color:var(--text-primary);">YouTube</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="#FF0000" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-github',
            label: 'GitHub',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg><span style="font-size:11px;color:var(--text-primary);">GitHub</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-heart',
            label: 'Heart',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;color:#ef4444;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><span style="font-size:11px;color:var(--text-primary);">Heart</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%; color: #ef4444;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-star',
            label: 'Star',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;color:#eab308;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span style="font-size:11px;color:var(--text-primary);">Star</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%; color: #eab308;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-arrow-right',
            label: 'Arrow Right',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg><span style="font-size:11px;color:var(--text-primary);">Arrow Right</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>`,
            category: 'Icons',
          },
          {
            id: 'icon-check',
            label: 'Check',
            media: `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;"><svg style="width:2rem;height:2rem;color:#16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg><span style="font-size:11px;color:var(--text-primary);">Check</span></div>`,
            content: `<svg style="width: 2rem; height: 2rem; max-width: 100%; color: #16a34a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>`,
            category: 'Icons',
          },
          // General Image Placeholder Block
          {
            id: 'image-placeholder-block',
            label: 'Image Placeholder',
            media: `<div style="width:100%;height:56px;border-radius:8px;border:2px dashed #d1d5db;color:#64748b;display:flex;align-items:center;justify-content:center;background:#f3f4f6;"><svg style="width:2rem;height:2rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>`,
            content: `<div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Image" style="width: 100%; min-height: 300px; border-radius: 8px;"></div>`,
            category: 'Basic',
          },
          // Import all business blocks
          ...businessBlocks,
          // Import all content creator blocks
          ...contentCreatorBlocks,
          // Import enhanced sections
          ...enhancedSections,
          // Import comprehensive blocks (Layout, Basic, Sections, Other)
          ...comprehensiveBlocks,
        ],
      },
      layerManager: {
        appendTo: '.layers-container',
        showToggle: false, // Hide the toggle button
      },
      traitManager: {
        appendTo: '.traits-container',
      },
      // Disable default panels (layer manager, blocks, settings buttons)
      panels: {
        defaults: [], // Empty array to disable all default panels
      },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform', 'color', 'text-shadow', 'word-spacing', 'white-space'],
          },
          {
            name: 'Dimensions',
            open: false,
            buildProps: ['width', 'min-width', 'max-width', 'height', 'min-height', 'max-height'],
          },
          {
            name: 'Spacing',
            open: false,
            buildProps: ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
          },
          {
            name: 'Background',
            open: false,
            buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size', 'background-attachment', 'background-blend-mode', 'background-clip'],
            properties: [
              {
                name: 'Background Color',
                property: 'background-color',
                type: 'color',
              },
            ],
          },
          {
            name: 'Border',
            open: false,
            buildProps: ['border', 'border-radius', 'border-width', 'border-style', 'border-color', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'],
            properties: [
              {
                name: 'Border Color',
                property: 'border-color',
                type: 'color',
              },
            ],
          },
          {
            name: 'Flexbox',
            open: false,
            buildProps: ['display', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'gap', 'row-gap', 'column-gap', 'flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'order'],
          },
          {
            name: 'Grid',
            open: false,
            buildProps: ['grid-template-columns', 'grid-template-rows', 'grid-template-areas', 'grid-column', 'grid-row', 'grid-area', 'grid-gap', 'grid-column-gap', 'grid-row-gap', 'justify-items', 'align-items', 'place-items'],
          },
          {
            name: 'Position',
            open: false,
            buildProps: ['position', 'top', 'right', 'bottom', 'left', 'z-index', 'float', 'clear'],
          },
          {
            name: 'Transform & Animation',
            open: false,
            buildProps: ['transform', 'transform-origin', 'perspective', 'transition', 'animation'],
          },
          {
            name: 'Effects',
            open: false,
            buildProps: ['opacity', 'box-shadow', 'text-shadow', 'filter', 'backdrop-filter', 'mix-blend-mode', 'cursor'],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['overflow', 'overflow-x', 'overflow-y', 'visibility', 'object-fit', 'object-position', 'pointer-events', 'user-select'],
          },
        ],
      },
      commands: {
        defaults: [
          {
            id: 'set-device-desktop',
            run: (editor: any) => editor.setDevice('Desktop'),
          },
          {
            id: 'set-device-tablet',
            run: (editor: any) => editor.setDevice('Tablet'),
          },
          {
            id: 'set-device-mobile',
            run: (editor: any) => editor.setDevice('Mobile portrait'),
          },
        ],
      },
      ...options,
    });

    editorRef.current = editor;

    // Extend RTE actions post-init to avoid strict typing on init config
    try {
      const rte: any = (editor as any).RichTextEditor;
      if (rte) {
        const actionsList = [
          'bold', 'italic', 'underline', 'strikethrough',
          'h1', 'h2', 'p', 'pre',
          'align-left', 'align-center', 'align-right', 'align-justify',
          'ul', 'ol',
          'indent', 'outdent',
          'subscript', 'superscript',
          'link', 'unlink',
          'color', 'highlight',
          'removeFormat',
        ];

        // Ensure any enabled RTE instance uses the full action set
        // Event passes the view on which RTE is enabled; get its component model
        editor.on('rte:enable', (view: any) => {
          try {
            const comp = view && (view.model || view);
            if (comp && typeof comp.set === 'function') {
              comp.set('rte', { actions: actionsList });
            }
          } catch (e) {
            console.warn('RTE set actions error', e);
          }
        });
        // Headings with professional icons
        rte.add('h1', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h8M4 18h16"/></svg>',
          attributes: { title: 'Heading 1' },
          result: (r: any) => r.exec('formatBlock', 'H1'),
        });
        rte.add('h2', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h12M4 18h16"/></svg>',
          attributes: { title: 'Heading 2' },
          result: (r: any) => r.exec('formatBlock', 'H2'),
        });
        rte.add('p', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',
          attributes: { title: 'Paragraph' },
          result: (r: any) => r.exec('formatBlock', 'P'),
        });
        rte.add('pre', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
          attributes: { title: 'Code block' },
          result: (r: any) => r.exec('formatBlock', 'PRE'),
        });

        // Alignment
        // Guard against duplicates
        const safeAdd = (name: string, def: any) => {
          if (!rte.get(name)) rte.add(name, def);
        };

        safeAdd('align-left', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>',
          attributes: { title: 'Align left' },
          result: () => {
            const sel = (editor as any).getSelected?.();
            if (sel && sel.addStyle) sel.addStyle({ 'text-align': 'left' });
          },
        });
        safeAdd('align-center', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>',
          attributes: { title: 'Align center' },
          result: () => {
            const sel = (editor as any).getSelected?.();
            if (sel && sel.addStyle) sel.addStyle({ 'text-align': 'center' });
          },
        });
        safeAdd('align-right', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>',
          attributes: { title: 'Align right' },
          result: () => {
            const sel = (editor as any).getSelected?.();
            if (sel && sel.addStyle) sel.addStyle({ 'text-align': 'right' });
          },
        });
        safeAdd('align-justify', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>',
          attributes: { title: 'Justify' },
          result: () => {
            const sel = (editor as any).getSelected?.();
            if (sel && sel.addStyle) sel.addStyle({ 'text-align': 'justify' });
          },
        });

        // Lists
        safeAdd('ul', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
          attributes: { title: 'Unordered list' },
          result: (r: any) => r.exec('insertUnorderedList'),
        });
        safeAdd('ol', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><line x1="4" y1="6" x2="4.01" y2="6"></line><line x1="4" y1="12" x2="4.01" y2="12"></line><line x1="4" y1="18" x2="4.01" y2="18"></line></svg>',
          attributes: { title: 'Ordered list' },
          result: (r: any) => r.exec('insertOrderedList'),
        });

        // Indent / Outdent
        safeAdd('indent', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
          attributes: { title: 'Indent' },
          result: (r: any) => r.exec('indent'),
        });
        safeAdd('outdent', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
          attributes: { title: 'Outdent' },
          result: (r: any) => r.exec('outdent'),
        });

        // Sub/Superscript
        safeAdd('subscript', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19l8-8m0 0l4 4m-4-4l4-4M4 19h16"></path></svg>',
          attributes: { title: 'Subscript' },
          result: (r: any) => r.exec('subscript'),
        });
        safeAdd('superscript', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5l8 8m0-8l-8 8M20 19h-4M20 5h-4"></path></svg>',
          attributes: { title: 'Superscript' },
          result: (r: any) => r.exec('superscript'),
        });

        // Unlink
        safeAdd('unlink', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
          attributes: { title: 'Remove link' },
          result: (r: any) => r.exec('unlink'),
        });

        // Text color / highlight via prompt for simplicity
        safeAdd('color', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
          attributes: { title: 'Text color' },
          result: (r: any) => {
            const color = typeof window !== 'undefined' ? window.prompt('Text color (e.g. #111827 or red):', '#111827') : null;
            if (color) {
              const selHtml = r.selection?.() || '';
              const html = `<span style="color:${color}">${selHtml || '&ZeroWidthSpace;'}</span>`;
              r.insertHTML(html, { select: true });
            }
          },
        });
        safeAdd('highlight', {
          icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
          attributes: { title: 'Highlight color' },
          result: (r: any) => {
            const color = typeof window !== 'undefined' ? window.prompt('Highlight color (e.g. #fff59d or yellow):', '#fff59d') : null;
            if (color) {
              const selHtml = r.selection?.() || '';
              const html = `<span style="background-color:${color}">${selHtml || '&ZeroWidthSpace;'}</span>`;
              r.insertHTML(html, { select: true });
            }
          },
        });

        // Ensure common text-like components use the full action set
        const dc: any = (editor as any).DomComponents;
        if (dc && typeof dc.getType === 'function') {
          ['text', 'link'].forEach((type) => {
            const t = dc.getType(type);
            if (t && t.model && t.model.prototype && t.model.prototype.defaults) {
              t.model.prototype.defaults.rte = { actions: actionsList };
            }
          });
        }

        // Backfill for already existing components on selection
        editor.on('component:selected', (comp: any) => {
          try {
            if (!comp) return;
            const isTextLike = comp.is('text') || comp.is('link') || comp.get('editable');
            if (isTextLike) {
              const cfg = comp.get('rte');
              if (!(cfg && cfg.actions)) {
                comp.set('rte', { actions: actionsList });
              }
            }
          } catch (e) {
            console.warn('RTE backfill error', e);
          }
        });
      }
    } catch (err) {
      // Ignore RTE extension errors; defaults still work
      console.warn('RTE extension error:', err);
    }

    // Ensure block manager is properly initialized
    try {
      const blockManager = editor.BlockManager;
      if (blockManager) {
        // Force render blocks if container exists
        const blocksContainer = document.querySelector('.blocks-container');
        if (blocksContainer && blockManager.getCategories().length === 0) {
          console.log('[GrapesJS] Block manager initialized, blocks:', blockManager.getAll().length);
          // Trigger render if needed
          setTimeout(() => {
            if (blocksContainer.children.length === 0) {
              console.warn('[GrapesJS] Blocks container is empty, attempting to render blocks');
              // Force re-render by accessing block manager
              const categories = blockManager.getCategories();
              console.log('[GrapesJS] Block categories:', categories);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.warn('[GrapesJS] Error checking block manager:', err);
    }

    // Inject responsive CSS into canvas
    try {
      const injectResponsiveCSS = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
            
            if (frameHead) {
              // Remove existing responsive style tag if present
              const existingStyle = frameDoc.getElementById('responsive-utils-styles');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              // Create and inject responsive CSS
              const styleTag = frameDoc.createElement('style');
              styleTag.id = 'responsive-utils-styles';
              styleTag.textContent = responsiveCSS;
              frameHead.appendChild(styleTag);
            }
          }
        } catch (error) {
          console.warn('Could not inject responsive CSS into canvas:', error);
        }
      };
      
      // Inject after canvas is ready
      setTimeout(injectResponsiveCSS, 300);
      editor.on('canvas:frame:load', injectResponsiveCSS);

      // Ensure canvas frame shows full content without cutting off
      const ensureFullCanvasView = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            const frameBody = frameDoc.body;
            const frameHtml = frameDoc.documentElement;
            
            // Ensure body and html show full content - hide scrollbar
            if (frameBody) {
              frameBody.style.overflowX = 'hidden';
              frameBody.style.overflowY = 'auto';
              frameBody.style.width = '100%';
              frameBody.style.minWidth = '100%';
              frameBody.style.maxWidth = '100vw';
              frameBody.style.scrollbarWidth = 'none';
              frameBody.style.msOverflowStyle = 'none';
            }
            
            if (frameHtml) {
              frameHtml.style.overflowX = 'hidden';
              frameHtml.style.overflowY = 'auto';
              frameHtml.style.width = '100%';
              frameHtml.style.minWidth = '100%';
              frameHtml.style.maxWidth = '100vw';
              frameHtml.style.scrollbarWidth = 'none';
              frameHtml.style.msOverflowStyle = 'none';
            }
            
            // Add CSS to ensure no content is cut off
            const existingFullView = frameDoc.getElementById('canvas-full-view-styles');
            if (existingFullView) {
              existingFullView.remove();
            }
            
            const fullViewStyle = frameDoc.createElement('style');
            fullViewStyle.id = 'canvas-full-view-styles';
            fullViewStyle.textContent = `
              html, body {
                overflow-x: hidden !important;
                overflow-y: auto !important;
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100vw !important;
                margin: 0 !important;
                padding: 0 !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
              }
              html::-webkit-scrollbar,
              body::-webkit-scrollbar {
                width: 0px !important;
                height: 0px !important;
                background: transparent !important;
                display: none !important;
              }
              html::-webkit-scrollbar-thumb,
              body::-webkit-scrollbar-thumb,
              html::-webkit-scrollbar-track,
              body::-webkit-scrollbar-track {
                display: none !important;
                background: transparent !important;
              }
              body > * {
                max-width: 100% !important;
                box-sizing: border-box !important;
              }
            `;
            frameDoc.head.appendChild(fullViewStyle);
          }
        } catch (error) {
          console.warn('Could not ensure full canvas view:', error);
        }
      };
      
      setTimeout(ensureFullCanvasView, 300);
      editor.on('canvas:frame:load', ensureFullCanvasView);
      editor.on('canvas:update', ensureFullCanvasView);
      
      // Also inject image placeholder CSS
      const injectImagePlaceholderCSS = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
            
            if (frameHead) {
              const existingStyle = frameDoc.getElementById('image-placeholder-styles');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              const styleTag = frameDoc.createElement('style');
              styleTag.id = 'image-placeholder-styles';
              styleTag.textContent = imagePlaceholderCSS;
              frameHead.appendChild(styleTag);
            }
          }
        } catch (error) {
          console.warn('Could not inject image placeholder CSS:', error);
        }
      };
      
      setTimeout(injectImagePlaceholderCSS, 300);
      editor.on('canvas:frame:load', injectImagePlaceholderCSS);
      
      // Also inject interactive components CSS
      const injectInteractiveCSS = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
            
            if (frameHead) {
              const existingStyle = frameDoc.getElementById('interactive-components-styles');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              const styleTag = frameDoc.createElement('style');
              styleTag.id = 'interactive-components-styles';
              styleTag.textContent = interactiveComponentsCSS;
              frameHead.appendChild(styleTag);
            }
          }
        } catch (error) {
          console.warn('Could not inject interactive components CSS:', error);
        }
      };
      
      setTimeout(injectInteractiveCSS, 300);
      editor.on('canvas:frame:load', injectInteractiveCSS);
    } catch (err) {
      console.warn('[GrapesJS] Error injecting responsive CSS:', err);
    }

    // Inject CSS to make links easier to click in editor
    try {
      const injectLinkEditorCSS = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            const frameHead = frameDoc.head || frameDoc.getElementsByTagName('head')[0];
            
            if (frameHead) {
              const existingStyle = frameDoc.getElementById('link-editor-styles');
              if (existingStyle) {
                existingStyle.remove();
              }
              
              const styleTag = frameDoc.createElement('style');
              styleTag.id = 'link-editor-styles';
              styleTag.textContent = `
                /* Make links easier to click and edit in editor mode */
                a {
                  cursor: text !important;
                  position: relative;
                  z-index: 1;
                  /* Prevent browser link preview */
                  pointer-events: auto !important;
                  /* Disable browser link preview tooltip */
                  text-decoration: inherit !important;
                }
                /* Ensure link text is selectable and editable */
                a, a * {
                  pointer-events: auto !important;
                  user-select: text !important;
                  -webkit-user-select: text !important;
                  -moz-user-select: text !important;
                  -ms-user-select: text !important;
                  cursor: text !important;
                }
                /* Make all text easily selectable */
                p, span, h1, h2, h3, h4, h5, h6, li, td, th, label, div {
                  user-select: text !important;
                  -webkit-user-select: text !important;
                  -moz-user-select: text !important;
                  -ms-user-select: text !important;
                  cursor: text !important;
                }
                /* Ensure text that was previously a link is easily selectable */
                p[data-was-link], span[data-was-link], div[data-was-link] {
                  user-select: text !important;
                  cursor: text !important;
                  pointer-events: auto !important;
                }
                /* Disable browser link preview - remove title attribute that shows on hover */
                a[title] {
                  title: none !important;
                }
              `;
              frameHead.appendChild(styleTag);
            }
          }
        } catch (error) {
          console.warn('Could not inject link editor CSS:', error);
        }
      };
      
      setTimeout(injectLinkEditorCSS, 300);
      editor.on('canvas:frame:load', injectLinkEditorCSS);
    } catch (err) {
      console.warn('[GrapesJS] Error injecting link editor CSS:', err);
    }

    // Prevent ALL link navigation in editor mode (but allow selection and editing)
    try {
      const preventLinkNavigation = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            
            // Prevent ALL link navigation - including hash links and external links
            // But allow GrapesJS to handle selection and editing
            const handleLinkClick = (e: MouseEvent) => {
              const target = e.target as HTMLElement;
              if (target) {
                const link = target.tagName === 'A' ? target : target.closest('a');
                if (link && (link as HTMLAnchorElement).href) {
                  // Prevent ALL navigation in editor mode
                  e.preventDefault();
                  // Don't stop propagation - let GrapesJS handle the click for selection
                  return false;
                }
              }
            };
            
            // Remove title attributes from links to prevent browser preview tooltip
            const removeLinkTitles = () => {
              const links = frameDoc.querySelectorAll('a[href]');
              links.forEach((link) => {
                // Store original title if needed, but remove it to prevent preview
                if (link.hasAttribute('title')) {
                  link.setAttribute('data-title-backup', link.getAttribute('title') || '');
                  link.removeAttribute('title');
                }
                // Also set pointer-events to ensure it's editable
                (link as HTMLElement).style.pointerEvents = 'auto';
              });
            };
            
            // Remove existing listeners
            frameDoc.removeEventListener('click', handleLinkClick, true);
            
            // Add new listener with capture phase to intercept before default behavior
            frameDoc.addEventListener('click', handleLinkClick, true);
            
            // Remove link titles to prevent preview
            removeLinkTitles();
            
            // Watch for new links being added
            const observer = new MutationObserver(() => {
              removeLinkTitles();
            });
            observer.observe(frameDoc.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['href', 'title']
            });
          }
        } catch (error) {
          console.warn('Could not prevent link navigation:', error);
        }
      };
      
      setTimeout(preventLinkNavigation, 300);
      editor.on('canvas:frame:load', preventLinkNavigation);
      // Also run on component updates to catch dynamically added links
      editor.on('component:update', () => {
        setTimeout(preventLinkNavigation, 100);
      });
    } catch (err) {
      console.warn('[GrapesJS] Error setting up link navigation prevention:', err);
    }

    // Improve component selection priority - prefer text/link over parent sections
    try {
      const improveSelectionPriority = () => {
        try {
          const canvas = editor.Canvas;
          const frame = canvas?.getFrameEl?.();
          
          if (frame && frame.contentDocument) {
            const frameDoc = frame.contentDocument;
            
            const handleClick = (e: MouseEvent) => {
              const target = e.target as HTMLElement;
              if (!target) return;
              
              // Check if clicked element is text or link
              const tagName = target.tagName?.toLowerCase();
              const isTextElement = ['a', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'label', 'button'].includes(tagName);
              const isLink = tagName === 'a' || target.closest('a');
              
              if (isTextElement || isLink) {
                // Find the component for this element
                const componentId = target.getAttribute('data-gjs-id') || target.closest('[data-gjs-id]')?.getAttribute('data-gjs-id');
                if (componentId) {
                  const allComponents = editor.getComponents();
                  const findComponent = (comps: any): any => {
                    for (let comp of comps.models || []) {
                      if (comp.getId() === componentId || comp.cid === componentId) {
                        return comp;
                      }
                      const found = findComponent(comp.components());
                      if (found) return found;
                    }
                    return null;
                  };
                  const component = findComponent(allComponents);
                  if (component) {
                    // Select the text/link component, not parent
                    setTimeout(() => {
                      editor.select(component);
                    }, 10);
                  }
                }
              }
            };
            
            frameDoc.removeEventListener('click', handleClick, true);
            frameDoc.addEventListener('click', handleClick, true);
          }
        } catch (error) {
          console.warn('Could not improve selection priority:', error);
        }
      };
      
      setTimeout(improveSelectionPriority, 300);
      editor.on('canvas:frame:load', improveSelectionPriority);
    } catch (err) {
      console.warn('[GrapesJS] Error setting up selection priority:', err);
    }

    // Fix RTE positioning to always show above text
    try {
      editor.on('rte:enable', () => {
        setTimeout(() => {
          try {
            const rteToolbar = document.querySelector('.gjs-rte-toolbar') as HTMLElement;
            if (rteToolbar) {
              // Ensure RTE is positioned above
              rteToolbar.style.bottom = 'auto';
              rteToolbar.style.top = 'auto';
              // Let GrapesJS handle positioning but ensure it's visible
              const observer = new MutationObserver(() => {
                const toolbar = document.querySelector('.gjs-rte-toolbar') as HTMLElement;
                if (toolbar) {
                  const rect = toolbar.getBoundingClientRect();
                  const viewportHeight = window.innerHeight;
                  // If toolbar is below viewport, move it up
                  if (rect.bottom > viewportHeight) {
                    toolbar.style.transform = `translateY(calc(-100% - 10px))`;
                  }
                }
              });
              observer.observe(rteToolbar, { attributes: true, attributeFilter: ['style'] });
            }
          } catch (error) {
            console.warn('Could not fix RTE positioning:', error);
          }
        }, 100);
      });
    } catch (err) {
      console.warn('[GrapesJS] Error setting up RTE positioning:', err);
    }

    // Register custom image placeholder component type
    try {
      const domComponents = (editor as any).DomComponents;
      if (domComponents) {
        // Add parser to recognize image-placeholder components when loading HTML
        domComponents.addType('image-placeholder', {
          extend: 'default',
          isComponent: (el: HTMLElement) => {
            // CRITICAL: Only match if the element itself is an image-placeholder, not parent containers
            // Check if element has data-gjs-type attribute (most reliable)
            if (el.getAttribute && el.getAttribute('data-gjs-type') === 'image-placeholder') {
              return true;
            }
            // Check if element has the image-placeholder-container class
            // AND it directly contains image-placeholder-img (not nested in another div)
            if (el.classList && el.classList.contains('image-placeholder-container')) {
              // Verify it's the actual placeholder, not a parent container
              const hasDirectImg = el.querySelector(':scope > .image-placeholder-img') !== null;
              const hasDirectContent = el.querySelector(':scope > .image-placeholder-content') !== null;
              if (hasDirectImg || hasDirectContent) {
                return true;
              }
            }
            // Don't match parent containers that just happen to contain an image-placeholder
            // This prevents sections/blocks from being incorrectly identified as image-placeholders
            return false;
          },
          model: {
            defaults: {
              tagName: 'div',
              classes: ['image-placeholder-container'],
              // Ensure data-gjs-type is preserved in HTML
              attributes: {
                'data-gjs-type': 'image-placeholder',
              },
              // Enable resizing from all edges and corners
              resizable: true,
              resizableOptions: {
                // Allow resizing from all sides
                tl: 1, // top-left corner
                tc: 1, // top center
                tr: 1, // top-right corner
                cl: 1, // center left
                cr: 1, // center right
                bl: 1, // bottom-left corner
                bc: 1, // bottom center
                br: 1, // bottom-right corner
                // Minimum dimensions
                minW: 50,
                minH: 50,
                // Step size for resizing (optional, for snapping)
                step: 1,
              },
              // Make it draggable
              draggable: true,
              // Make it selectable
              selectable: true,
              // Make it hoverable
              hoverable: true,
              // Make it editable (for text content if any)
              editable: false,
              traits: [
                {
                  type: 'text',
                  name: 'src',
                  label: 'Image URL',
                  changeProp: 1,
                },
                {
                  type: 'text',
                  name: 'placeholder-text',
                  label: 'Placeholder Text',
                  default: 'Add Image',
                  changeProp: 1,
                },
                {
                  type: 'select',
                  name: 'object-fit',
                  label: 'Image Fit',
                  options: [
                    { value: 'cover', name: 'Cover' },
                    { value: 'contain', name: 'Contain' },
                    { value: 'fill', name: 'Fill' },
                    { value: 'scale-down', name: 'Scale Down' },
                  ],
                  default: 'cover',
                  changeProp: 1,
                },
              ],
            },
            init() {
              // Read initial values from data attributes if present
              const attrs = this.getAttributes();
              if (attrs['data-gjs-placeholder-text']) {
                this.set('placeholder-text', attrs['data-gjs-placeholder-text']);
              }
              
              // Try to get src from attributes first
              let srcValue = attrs.src || this.get('src');
              
              // If no src in attributes, try to extract from inner HTML (when loading saved content)
              if (!srcValue) {
                const view = this.getView();
                if (view && view.el) {
                  const img = view.el.querySelector('.image-placeholder-img');
                  if (img && (img as HTMLImageElement).src) {
                    srcValue = (img as HTMLImageElement).src;
                  }
                }
              }
              
              // Also check if component has children with img
              const components = this.components();
              if (!srcValue && components && components.length > 0) {
                components.forEach((child: any) => {
                  if (child.get('tagName') === 'img' && child.getAttributes()?.src) {
                    srcValue = child.getAttributes().src;
                  }
                });
              }
              
              if (srcValue) {
                this.set('src', srcValue);
                this.addAttributes({ src: srcValue });
              }
              
              // Ensure data-gjs-type is always set
              if (!this.getAttributes()['data-gjs-type']) {
                this.addAttributes({ 'data-gjs-type': 'image-placeholder' });
              }
              
              this.on('change:src', this.updateImage);
              this.on('change:placeholder-text', this.updatePlaceholder);
              this.on('change:object-fit', this.updateObjectFit);
              
              // Ensure attributes are set before save
              this.on('component:update', () => {
                const attrs = this.getAttributes();
                if (!attrs['data-gjs-type']) {
                  this.addAttributes({ 'data-gjs-type': 'image-placeholder' });
                }
                const currentSrc = this.get('src');
                if (currentSrc && !attrs.src) {
                  this.addAttributes({ src: currentSrc });
                }
              });
              
              // Also listen for component updates to catch when HTML is loaded
              this.on('change:content', () => {
                // Delay to ensure DOM is updated
                setTimeout(() => {
                  this.extractSrcFromHTML();
                }, 100);
              });
              
              // Extract src after component is fully loaded
              setTimeout(() => {
                this.extractSrcFromHTML();
              }, 200);
            },
            extractSrcFromHTML() {
              // Try to extract src from the rendered HTML
              const view = this.getView();
              if (view && view.el) {
                // First check if there's an img tag with src attribute
                const img = view.el.querySelector('.image-placeholder-img') as HTMLImageElement;
                if (img) {
                  // Check src attribute first (most reliable)
                  const imgSrcAttr = img.getAttribute('src');
                  if (imgSrcAttr && imgSrcAttr !== 'about:blank' && !imgSrcAttr.includes(window.location.href)) {
                    const currentSrc = this.get('src');
                    if (!currentSrc || currentSrc !== imgSrcAttr) {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[ImagePlaceholder] Extracted src from img attribute:', imgSrcAttr);
                      }
                      this.set('src', imgSrcAttr);
                      this.addAttributes({ src: imgSrcAttr });
                      // Trigger update to show the image immediately
                      setTimeout(() => {
                        this.updateImage();
                      }, 50);
                      return; // Found src, no need to check further
                    }
                  }
                  
                  // Fallback: check img.src property (might be set by browser)
                  const imgSrc = img.src;
                  if (imgSrc && imgSrc !== 'about:blank' && !imgSrc.includes(window.location.href) && imgSrc !== window.location.href) {
                    const currentSrc = this.get('src');
                    if (!currentSrc || currentSrc !== imgSrc) {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('[ImagePlaceholder] Extracted src from img.src property:', imgSrc);
                      }
                      this.set('src', imgSrc);
                      this.addAttributes({ src: imgSrc });
                      setTimeout(() => {
                        this.updateImage();
                      }, 50);
                      return;
                    }
                  }
                }
              }
              
              // Also check children components (GrapesJS might have created img as a child component)
              const components = this.components();
              if (components && components.length > 0) {
                components.forEach((child: any) => {
                  if (child.get('tagName') === 'img') {
                    const childSrc = child.getAttributes()?.src || child.get('src');
                    if (childSrc && childSrc !== 'about:blank') {
                      const currentSrc = this.get('src');
                      if (!currentSrc || currentSrc !== childSrc) {
                        if (process.env.NODE_ENV === 'development') {
                          console.log('[ImagePlaceholder] Extracted src from child component:', childSrc);
                        }
                        this.set('src', childSrc);
                        this.addAttributes({ src: childSrc });
                        setTimeout(() => {
                          this.updateImage();
                        }, 50);
                      }
                    }
                  }
                });
              }
            },
            updateObjectFit() {
              const objectFit = this.get('object-fit') || 'cover';
              const view = this.getView();
              if (view && view.el) {
                const img = view.el.querySelector('.image-placeholder-img');
                if (img) {
                  (img as HTMLElement).style.objectFit = objectFit;
                }
              }
            },
            toHTML() {
              const src = this.get('src') || this.getAttributes()?.src || '';
              const placeholderText = this.get('placeholder-text') || 'Add Image';
              const objectFit = this.get('object-fit') || 'cover';
              const attrs = this.getAttributes() || {};
              const classes = this.getClasses() || [];
              const styles = this.getStyle() || {};
              const id = this.getId();
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[ImagePlaceholder.toHTML] Called with:', { src, placeholderText, objectFit, id, classes: classes.length, styles: Object.keys(styles).length });
              }
              
              // Build attributes string
              let divAttrs = '';
              if (id) divAttrs += ` id="${id}"`;
              if (classes.length > 0) divAttrs += ` class="${classes.join(' ')}"`;
              if (attrs['data-gjs-type']) divAttrs += ` data-gjs-type="${attrs['data-gjs-type']}"`;
              if (attrs['data-gjs-placeholder-text']) divAttrs += ` data-gjs-placeholder-text="${attrs['data-gjs-placeholder-text']}"`;
              if (src) divAttrs += ` src="${String(src).replace(/"/g, '&quot;')}"`;
              
              // Build style string
              const styleStr = Object.keys(styles).map(key => {
                const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssKey}: ${styles[key]}`;
              }).join('; ');
              if (styleStr) divAttrs += ` style="${styleStr}"`;
              
              if (src) {
                // Render with image
                const html = `<div${divAttrs}>
      <div class="image-placeholder-content" style="display: none;"></div>
      <img class="image-placeholder-img" src="${String(src).replace(/"/g, '&quot;')}" style="width: 100%; height: 100%; object-fit: ${objectFit}; border-radius: 6px;" alt="" />
    </div>`;
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ImagePlaceholder.toHTML] Generated HTML with image:', html.substring(0, 200));
                }
                return html;
              } else {
                // Render placeholder
                const html = `<div${divAttrs}>
      <div class="image-placeholder-content" style="text-align: center; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 200px;">
        <svg class="image-placeholder-icon" style="width: 3rem; height: 3rem; color: #9ca3af; margin-bottom: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <button class="image-placeholder-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">${placeholderText}</button>
        <p class="image-placeholder-hint" style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Click to add image</p>
      </div>
      <img class="image-placeholder-img" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="" />
    </div>`;
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ImagePlaceholder.toHTML] Generated HTML placeholder:', html.substring(0, 200));
                }
                return html;
              }
            },
            updateImage() {
              const src = this.get('src');
              const view = this.getView();
              
              // Only log in development
              if (process.env.NODE_ENV === 'development') {
                console.log('[ImagePlaceholder] updateImage called with src:', src);
              }
              
              // Force view re-render
              if (view && view.render) {
                view.render();
              }
              
              // Also update DOM directly for immediate feedback
              if (view && view.el) {
                const container = view.el;
                const img = container.querySelector('.image-placeholder-img');
                const content = container.querySelector('.image-placeholder-content');
                
                if (src) {
                  const objectFit = this.get('object-fit') || 'cover';
                  
                  // Verify image URL is accessible
                  const testImg = new Image();
                  testImg.onload = () => {
                    // Only log in development
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[ImagePlaceholder] Image loaded successfully:', src);
                    }
                    if (img) {
                      (img as HTMLImageElement).src = src;
                      (img as HTMLImageElement).style.objectFit = objectFit;
                    } else {
                      // Create img element if it doesn't exist
                      const newImg = document.createElement('img');
                      newImg.className = 'image-placeholder-img';
                      newImg.src = src;
                      newImg.style.cssText = `width: 100%; height: 100%; object-fit: ${objectFit}; border-radius: 6px;`;
                      newImg.alt = '';
                      container.appendChild(newImg);
                    }
                    container.classList.add('has-image');
                    container.style.border = 'none';
                    container.style.background = 'transparent';
                    if (content) {
                      (content as HTMLElement).style.display = 'none';
                    }
                    
                    // Trigger editor update after image loads
                    if (editor) {
                      editor.trigger('component:update');
                      editor.trigger('update');
                    }
                  };
                  testImg.onerror = () => {
                    // Only log error in development, and don't treat as critical error
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('[ImagePlaceholder] Failed to load image:', src);
                    }
                    // Still show the placeholder but log the error
                    container.classList.remove('has-image');
                    container.style.border = '2px dashed #ef4444';
                    container.style.background = '#fee2e2';
                  };
                  testImg.src = src;
                } else {
                  container.classList.remove('has-image');
                  container.style.border = '2px dashed #d1d5db';
                  container.style.background = '#f3f4f6';
                  if (content) {
                    (content as HTMLElement).style.display = 'flex';
                  }
                  if (img) {
                    img.remove();
                  }
                }
              }
              
              // Trigger editor update
              if (editor) {
                editor.trigger('component:update');
                editor.trigger('update');
              }
            },
            updatePlaceholder() {
              const text = this.get('placeholder-text') || 'Add Image';
              const view = this.getView();
              if (view && view.el) {
                const button = view.el.querySelector('.image-placeholder-button');
                if (button) {
                  button.textContent = text;
                }
              }
            },
          },
          view: {
            events: {
              click: 'handleClick',
            },
            handleClick(e: Event) {
              e.stopPropagation();
              const component = this.model;
              const src = component.get('src');
              
              // If no image, trigger image library open
              if (!src) {
                // Dispatch custom event that parent can listen to
                const event = new CustomEvent('openImageLibrary', {
                  detail: {
                    component: component,
                    editor: editor,
                  },
                  bubbles: true,
                });
                window.dispatchEvent(event);
              } else {
                // If image exists, allow normal selection
                editor.select(component);
              }
            },
            onRender() {
              const component = this.model;
              // Get src from attributes or component properties
              let src = component.get('src') || component.getAttributes()?.src || '';
              
              // CRITICAL: If no src in model, try to extract from existing img tag in DOM
              // This handles the case when loading saved content where img has src but model doesn't
              if (!src && this.el) {
                const existingImg = this.el.querySelector('.image-placeholder-img') as HTMLImageElement;
                if (existingImg && existingImg.src && existingImg.src !== 'about:blank' && !existingImg.src.includes(window.location.href)) {
                  src = existingImg.src;
                  // Update the model to reflect the actual src
                  component.set('src', src);
                  component.addAttributes({ src: src });
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[ImagePlaceholder.onRender] Extracted src from existing img:', src);
                  }
                }
              }
              
              const placeholderText = component.get('placeholder-text') || component.getAttributes()?.['data-gjs-placeholder-text'] || 'Add Image';
              
              // Set initial styles - ensure resizable by using explicit dimensions
              // Use fixed dimensions or min dimensions to allow resizing
              const currentWidth = component.getStyle('width') || '100%';
              const currentHeight = component.getStyle('height') || '';
              const currentMinHeight = component.getStyle('min-height') || '200px';
              
              this.el.style.position = 'relative';
              // Use explicit width/height if set, otherwise use 100% for width and min-height
              if (currentWidth && currentWidth !== '100%') {
                this.el.style.width = currentWidth;
              } else {
                this.el.style.width = '100%';
              }
              if (currentHeight) {
                this.el.style.height = currentHeight;
              } else {
                this.el.style.height = 'auto';
              }
              this.el.style.minHeight = currentMinHeight;
              this.el.style.background = '#f3f4f6';
              this.el.style.border = '2px dashed #d1d5db';
              this.el.style.borderRadius = '8px';
              this.el.style.display = 'flex';
              this.el.style.flexDirection = 'column';
              this.el.style.alignItems = 'center';
              this.el.style.justifyContent = 'center';
              this.el.style.cursor = 'pointer';
              this.el.style.transition = 'all 0.2s ease';
              // Ensure the element can be resized (remove any overflow hidden that might prevent it)
              this.el.style.overflow = 'visible';
              
              if (!src) {
                // Render placeholder
                this.el.innerHTML = `
                  <div class="image-placeholder-content" style="text-align: center; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 200px;">
                    <svg class="image-placeholder-icon" style="width: 3rem; height: 3rem; color: #9ca3af; margin-bottom: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <button class="image-placeholder-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
                      ${placeholderText}
                    </button>
                    <p class="image-placeholder-hint" style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Click to add image</p>
                  </div>
                  <img class="image-placeholder-img" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="" />
                `;
                this.el.classList.remove('has-image');
              } else {
                // Render image
                const objectFit = component.get('object-fit') || component.getAttributes()?.['object-fit'] || 'cover';
                this.el.innerHTML = `
                  <div class="image-placeholder-content" style="display: none;"></div>
                  <img class="image-placeholder-img" src="${src}" style="width: 100%; height: 100%; object-fit: ${objectFit}; border-radius: 6px;" alt="" onerror="this.style.border='2px dashed #ef4444'; this.parentElement.style.background='#fee2e2';" />
                `;
                this.el.classList.add('has-image');
                this.el.style.border = 'none';
                this.el.style.background = 'transparent';
                
                // Add load handler to ensure image displays
                const imgEl = this.el.querySelector('.image-placeholder-img');
                if (imgEl) {
                  (imgEl as HTMLImageElement).onload = () => {
                    this.el.classList.add('has-image');
                    this.el.style.border = 'none';
                    this.el.style.background = 'transparent';
                  };
                }
              }
              
              // Store reference to img for later updates
              this.imgElement = this.el.querySelector('.image-placeholder-img');
            },
            onUpdate() {
              // Re-render when component updates
              this.render();
            },
            updateObjectFit() {
              const component = this.model;
              const objectFit = component.get('object-fit') || 'cover';
              const img = this.el?.querySelector('.image-placeholder-img');
              if (img) {
                (img as HTMLImageElement).style.objectFit = objectFit;
              }
              // Also trigger re-render
              if (this.render) {
                this.render();
              }
            },
          },
        });
      }
    } catch (err) {
      console.warn('[GrapesJS] Error registering image placeholder component:', err);
    }

    // Register FAQ Accordion Item component
    try {
      const domComponents = (editor as any).DomComponents;
      if (domComponents) {
        domComponents.addType('faq-item', {
          extend: 'default',
          isComponent: (el: HTMLElement) => {
            return el.getAttribute && el.getAttribute('data-gjs-type') === 'faq-item';
          },
          model: {
            defaults: {
              tagName: 'div',
              attributes: { 'data-gjs-type': 'faq-item' },
              traits: [
                { type: 'text', name: 'question', label: 'Question', changeProp: 1 },
                { type: 'text', name: 'answer', label: 'Answer', changeProp: 1 },
                { type: 'checkbox', name: 'is-open', label: 'Open by Default', changeProp: 1 },
              ],
            },
            init() {
              // Default to closed unless explicitly set to open
              const isOpen = this.get('is-open') === true || this.getAttributes()?.['data-faq-open'] === 'true';
              if (isOpen) {
                this.addAttributes({ 'data-faq-open': 'true' });
              } else {
                // Ensure it's closed by default
                this.removeAttributes('data-faq-open');
                this.set('is-open', false);
              }
            },
          },
          view: {
            events: {
              click: 'handleToggle',
            },
            handleToggle(e: Event) {
              const target = e.target as HTMLElement;
              // Only toggle if clicking on the header, not the content
              if (target.closest('.faq-header') || target.classList.contains('faq-header')) {
                e.stopPropagation();
                const component = this.model;
                const el = this.el;
                const isOpen = el.classList.contains('active');
                
                if (isOpen) {
                  el.classList.remove('active');
                  component.removeAttributes('data-faq-open');
                  component.set('is-open', false);
                } else {
                  el.classList.add('active');
                  component.addAttributes({ 'data-faq-open': 'true' });
                  component.set('is-open', true);
                }
                
                // Update content visibility
                const content = el.querySelector('.faq-content') as HTMLElement;
                if (content) {
                  content.style.display = isOpen ? 'none' : 'block';
                }
              }
            },
            onRender() {
              const component = this.model;
              // Only open if explicitly set to true
              const isOpen = component.get('is-open') === true || component.getAttributes()?.['data-faq-open'] === 'true';
              if (isOpen) {
                this.el.classList.add('active');
                const content = this.el.querySelector('.faq-content') as HTMLElement;
                if (content) {
                  content.style.display = 'block';
                }
              } else {
                // Ensure it's closed
                this.el.classList.remove('active');
                const content = this.el.querySelector('.faq-content') as HTMLElement;
                if (content) {
                  content.style.display = 'none';
                }
              }
            },
          },
        });
      }
    } catch (err) {
      console.warn('[GrapesJS] Error registering FAQ item component:', err);
    }

    // Register Link Button component
    try {
      const domComponents = (editor as any).DomComponents;
      if (domComponents) {
        domComponents.addType('link-button', {
          extend: 'link',
          isComponent: (el: HTMLElement) => {
            return el.getAttribute && el.getAttribute('data-gjs-type') === 'link-button';
          },
          model: {
            defaults: {
              tagName: 'a',
              attributes: { 'data-gjs-type': 'link-button', href: '#' },
              traits: [
                { 
                  type: 'text', 
                  name: 'href', 
                  label: 'URL',
                  changeProp: 1,
                  changeAttr: 1,
                },
                { 
                  type: 'select', 
                  name: 'target', 
                  label: 'Open In',
                  options: [
                    { value: '_self', name: 'Same Window' },
                    { value: '_blank', name: 'New Tab' },
                  ],
                  changeProp: 1,
                  changeAttr: 1,
                },
              ],
            },
            init() {
              // Sync href from attributes to model
              const href = this.getAttributes()?.href || this.get('href') || '#';
              this.set('href', href);
              this.addAttributes({ href: href });
              
              // Listen for trait changes
              this.on('change:href', () => {
                const newHref = this.get('href');
                this.addAttributes({ href: newHref || '#' });
              });
              
              this.on('change:target', () => {
                const newTarget = this.get('target');
                this.addAttributes({ target: newTarget || '_self' });
              });
            },
          },
        });
      }
    } catch (err) {
      console.warn('[GrapesJS] Error registering link button component:', err);
    }

    // Register Text Link component
    try {
      const domComponents = (editor as any).DomComponents;
      if (domComponents) {
        domComponents.addType('text-link', {
          extend: 'link',
          isComponent: (el: HTMLElement) => {
            return el.getAttribute && el.getAttribute('data-gjs-type') === 'text-link';
          },
          model: {
            defaults: {
              tagName: 'a',
              attributes: { 'data-gjs-type': 'text-link', href: '#' },
              traits: [
                { 
                  type: 'text', 
                  name: 'href', 
                  label: 'URL',
                  changeProp: 1,
                  changeAttr: 1,
                },
                { 
                  type: 'select', 
                  name: 'target', 
                  label: 'Open In',
                  options: [
                    { value: '_self', name: 'Same Window' },
                    { value: '_blank', name: 'New Tab' },
                  ],
                  changeProp: 1,
                  changeAttr: 1,
                },
              ],
            },
            init() {
              // Sync href from attributes to model
              const href = this.getAttributes()?.href || this.get('href') || '#';
              this.set('href', href);
              this.addAttributes({ href: href });
              
              // Listen for trait changes
              this.on('change:href', () => {
                const newHref = this.get('href');
                this.addAttributes({ href: newHref || '#' });
              });
              
              this.on('change:target', () => {
                const newTarget = this.get('target');
                this.addAttributes({ target: newTarget || '_self' });
              });
            },
          },
          view: {
            events: {
              click: 'handleClick',
            },
            handleClick(e: Event) {
              // Prevent navigation but allow GrapesJS to handle selection
              const href = this.model.get('href') || this.model.getAttributes()?.href || '#';
              if (href && href !== '#' && !href.startsWith('#')) {
                e.preventDefault();
                // Don't stop propagation - let GrapesJS handle selection
              }
            },
            onRender() {
              // Ensure link styling is applied
              if (this.el) {
                const href = this.model.get('href') || this.model.getAttributes()?.href || '#';
                if (href && href !== '#') {
                  // Add underline and link color if not already styled
                  const currentStyle = this.el.getAttribute('style') || '';
                  if (!currentStyle.includes('text-decoration')) {
                    this.el.style.textDecoration = 'underline';
                  }
                  if (!currentStyle.includes('color') || currentStyle.includes('color: #2563eb')) {
                    this.el.style.color = '#2563eb';
                  }
                }
                // Prevent navigation but allow selection
                const handleClick = (e: MouseEvent) => {
                  const linkHref = this.model.get('href') || this.model.getAttributes()?.href || '#';
                  if (linkHref && linkHref !== '#' && !linkHref.startsWith('#')) {
                    e.preventDefault();
                    // Let event bubble for GrapesJS selection
                  }
                };
                this.el.removeEventListener('click', handleClick, true);
                this.el.addEventListener('click', handleClick, true);
              }
            },
          },
        });
      }
    } catch (err) {
      console.warn('[GrapesJS] Error registering text link component:', err);
    }

    // Register YouTube Embed component
    try {
      const domComponents = (editor as any).DomComponents;
      if (domComponents) {
        domComponents.addType('youtube-embed', {
          extend: 'default',
          isComponent: (el: HTMLElement) => {
            return el.getAttribute && el.getAttribute('data-gjs-type') === 'youtube-embed';
          },
          model: {
            defaults: {
              tagName: 'div',
              attributes: { 'data-gjs-type': 'youtube-embed' },
              traits: [
                { type: 'text', name: 'video-id', label: 'YouTube Video ID', changeProp: 1 },
              ],
            },
            init() {
              const videoId = this.get('video-id') || this.getAttributes()?.['data-video-id'] || '';
              if (videoId) {
                this.set('video-id', videoId);
                this.addAttributes({ 'data-video-id': videoId });
              }
              this.on('change:video-id', this.updateVideo);
            },
            updateVideo() {
              const videoId = this.get('video-id') || '';
              const view = this.getView();
              if (view && view.render) {
                view.render();
              }
            },
          },
          view: {
            onRender() {
              const component = this.model;
              const videoId = component.get('video-id') || component.getAttributes()?.['data-video-id'] || '';
              
              if (videoId) {
                this.el.innerHTML = `
                  <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 1rem;">
                    <iframe 
                      src="https://www.youtube.com/embed/${videoId}" 
                      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>
                `;
              } else {
                this.el.innerHTML = `
                  <div style="position: relative; padding-bottom: 56.25%; height: 0; background: #1f2937; border-radius: 1rem; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 2px dashed #6b7280;">
                    <div style="text-align: center; color: white; padding: 2rem;">
                      <svg style="width: 4rem; height: 4rem; margin: 0 auto 1rem; opacity: 0.8;" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <p style="opacity: 0.8; font-size: 1.125rem; margin-bottom: 0.5rem;">Add YouTube Video ID</p>
                      <p style="font-size: 0.875rem; opacity: 0.6;">Enter YouTube Video ID in properties panel</p>
                    </div>
                  </div>
                `;
              }
            },
          },
        });
      }
    } catch (err) {
      console.warn('[GrapesJS] Error registering YouTube embed component:', err);
    }

    // Call onEditorInit callback
    if (onEditorInit) {
      onEditorInit(editor);
    }

    // Cleanup function
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []); // Empty deps - only run once

  return (
    <div 
      ref={containerRef} 
      className="gjs-editor h-full w-full"
      style={{ minHeight: '400px' }}
    />
  );
}
