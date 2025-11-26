/**
 * Enhanced versions of existing sections with multiple variants
 * Professional, marketable designs
 */

export const enhancedSections = [
  // Hero Variants
  {
    id: 'hero-split',
    label: 'Hero (Split Layout)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:8px;align-items:center">
          <div style="flex:1;height:100%;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;height:100%;background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white; min-height: 600px; display: flex; align-items: center;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem; width: 100%;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
          <div>
            <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem;">Welcome</span>
            <h1 style="font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; color: #111827; letter-spacing: -0.02em;">Transform Your Business Today</h1>
            <p style="font-size: 1.25rem; color: #6b7280; line-height: 1.7; margin-bottom: 2rem;">We help businesses grow with innovative solutions and expert guidance. Join thousands of satisfied customers.</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="#" data-gjs-type="link-button" target="_self" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-decoration: none; display: inline-block;">Get Started</a>
              <a href="#" data-gjs-type="link-button" target="_self" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #667eea; cursor: pointer; text-decoration: none; display: inline-block;">Learn More</a>
            </div>
          </div>
          <div>
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Hero Image" style="width: 100%; aspect-ratio: 4/3; border-radius: 1rem; box-shadow: 0 20px 25px rgba(0,0,0,0.1);"></div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'hero-centered',
    label: 'Hero (Centered)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="width:60%;height:8px;background:currentColor;opacity:.3;border-radius:4px"></div>
          <div style="width:40%;height:6px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="width:50%;height:8px;background:currentColor;opacity:.25;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 8rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
      <div style="max-width: 800px; margin: 0 auto; padding: 0 1rem;">
        <span style="display: inline-block; background: rgba(255,255,255,0.2); color: white; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">New Launch</span>
        <h1 style="font-size: 4rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.02em;">Build Something Amazing</h1>
        <p style="font-size: 1.5rem; opacity: 0.95; line-height: 1.7; margin-bottom: 2.5rem;">Create stunning websites and grow your online presence with our powerful platform</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button style="background: white; color: #667eea; padding: 1rem 2.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Start Free Trial</button>
          <button style="background: rgba(255,255,255,0.1); color: white; padding: 1rem 2.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; backdrop-filter: blur(10px);">Watch Demo</button>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'hero-video-bg',
    label: 'Hero (Video Background)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;background:currentColor;opacity:.15;border-radius:4px;position:relative">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:0;height:0;border-left:12px solid currentColor;border-top:8px solid transparent;border-bottom:8px solid transparent;opacity:.5"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 8rem 1rem; background: #1f2937; color: white; text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(102,126,234,0.8) 0%, rgba(118,75,162,0.8) 100%); z-index: 1;"></div>
      <div style="position: relative; z-index: 2; max-width: 800px; margin: 0 auto; padding: 0 1rem;">
        <h1 style="font-size: 4rem; font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; letter-spacing: -0.02em;">Experience the Future</h1>
        <p style="font-size: 1.5rem; opacity: 0.95; line-height: 1.7; margin-bottom: 2.5rem;">Watch our story and discover what makes us different</p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button style="background: white; color: #667eea; padding: 1rem 2.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); display: inline-flex; align-items: center; gap: 0.5rem;">
            <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Play Video
          </button>
          <button style="background: rgba(255,255,255,0.1); color: white; padding: 1rem 2.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; backdrop-filter: blur(10px);">Learn More</button>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  // Enhanced Footer
  {
    id: 'footer-advanced',
    label: 'Footer (Advanced)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;flex-direction:column;gap:4px">
          <div style="height:6px;background:currentColor;opacity:.3;border-radius:2px"></div>
          <div style="height:6px;background:currentColor;opacity:.2;border-radius:2px"></div>
          <div style="height:6px;background:currentColor;opacity:.25;border-radius:2px"></div>
          <div style="height:6px;background:currentColor;opacity:.2;border-radius:2px"></div>
        </div>
      </div>
    `,
    content: `<footer style="background: #111827; color: white; padding: 4rem 1rem 2rem;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem; margin-bottom: 3rem;">
          <div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem;">Company</h3>
            <p style="color: #9ca3af; line-height: 1.7; margin-bottom: 1.5rem;">Building the future of web experiences, one site at a time.</p>
            <div style="display: flex; gap: 1rem;">
              <a href="#" style="width: 2.5rem; height: 2.5rem; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none;">f</a>
              <a href="#" style="width: 2.5rem; height: 2.5rem; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none;">t</a>
              <a href="#" style="width: 2.5rem; height: 2.5rem; background: #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; text-decoration: none;">in</a>
            </div>
          </div>
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Product</h3>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Features</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Pricing</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Updates</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Company</h3>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">About</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Blog</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Careers</a></li>
              <li><a href="#" style="color: #9ca3af; text-decoration: none; transition: color 0.2s;">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Newsletter</h3>
            <p style="color: #9ca3af; margin-bottom: 1rem; font-size: 0.875rem;">Subscribe to get updates and news</p>
            <form style="display: flex; gap: 0.5rem;">
              <input type="email" placeholder="Your email" style="flex: 1; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #374151; background: #1f2937; color: white; font-size: 0.875rem;">
              <button type="submit" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; border: none; cursor: pointer; font-weight: 600;">Subscribe</button>
            </form>
          </div>
        </div>
        <div style="border-top: 1px solid #374151; padding-top: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <p style="color: #9ca3af; margin: 0; font-size: 0.875rem;">© 2025 Company Name. All rights reserved.</p>
          <div style="display: flex; gap: 2rem;">
            <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 0.875rem;">Privacy</a>
            <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 0.875rem;">Terms</a>
            <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 0.875rem;">Cookies</a>
          </div>
        </div>
      </div>
    </footer>`,
    category: 'Sections',
  },
  // Enhanced Testimonials
  {
    id: 'testimonials-enhanced',
    label: 'Testimonials (Enhanced)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
          </div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
          </div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;top:4px;left:4px;width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
          </div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">What Our Clients Say</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Trusted by thousands of satisfied customers</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; color: #fbbf24;">
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic;">"This service exceeded all my expectations. The team was professional, responsive, and delivered outstanding results."</p>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">JD</div>
              <div>
                <div style="font-weight: 700; color: #111827; margin-bottom: 0.25rem;">John Doe</div>
                <div style="font-size: 0.875rem; color: #6b7280;">CEO, Company Inc.</div>
              </div>
            </div>
          </div>
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; color: #fbbf24;">
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic;">"Outstanding quality and service. I would highly recommend this to anyone looking for professional results."</p>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">JS</div>
              <div>
                <div style="font-weight: 700; color: #111827; margin-bottom: 0.25rem;">Jane Smith</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Founder, Startup Co.</div>
              </div>
            </div>
          </div>
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; color: #fbbf24;">
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic;">"The best investment we've made. The results speak for themselves and the support team is incredible."</p>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">MJ</div>
              <div>
                <div style="font-weight: 700; color: #111827; margin-bottom: 0.25rem;">Mike Johnson</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Director, Enterprise Corp.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  // Premium Pricing
  {
    id: 'pricing-premium',
    label: 'Pricing (Premium)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:flex;gap:4px;width:80%;height:40px;align-items:flex-end">
          <div style="flex:1;height:60%;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;height:100%;background:currentColor;opacity:.3;border-radius:4px;position:relative">
            <div style="position:absolute;top:-8px;right:4px;width:30px;height:12px;background:currentColor;opacity:.4;border-radius:2px"></div>
          </div>
          <div style="flex:1;height:60%;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Choose Your Plan</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Flexible pricing for businesses of all sizes</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1100px; margin: 0 auto;">
          <div style="background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #e5e7eb;">
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">Starter</h3>
            <div style="margin-bottom: 1.5rem;">
              <span style="font-size: 3rem; font-weight: 700; color: #111827;">$29</span>
              <span style="color: #6b7280;">/month</span>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 1rem;">
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Up to 5 projects</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Basic support</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Core features</span>
              </li>
            </ul>
            <button style="width: 100%; background: #111827; color: white; padding: 1rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer;">Get Started</button>
          </div>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2.5rem; border-radius: 1rem; box-shadow: 0 20px 25px rgba(102,126,234,0.3); color: white; transform: scale(1.05); position: relative;">
            <div style="position: absolute; top: -12px; right: 2rem; background: #fbbf24; color: #111827; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 700;">POPULAR</div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Professional</h3>
            <div style="margin-bottom: 1.5rem;">
              <span style="font-size: 3rem; font-weight: 700;">$79</span>
              <span style="opacity: 0.9;">/month</span>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 1rem;">
              <li style="display: flex; align-items: center; gap: 0.75rem; opacity: 0.95;">
                <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Unlimited projects</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; opacity: 0.95;">
                <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Priority support</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; opacity: 0.95;">
                <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Advanced features</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; opacity: 0.95;">
                <svg style="width: 1.25rem; height: 1.25rem; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Custom integrations</span>
              </li>
            </ul>
            <button style="width: 100%; background: white; color: #667eea; padding: 1rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer;">Get Started</button>
          </div>
          <div style="background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid #e5e7eb;">
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">Enterprise</h3>
            <div style="margin-bottom: 1.5rem;">
              <span style="font-size: 3rem; font-weight: 700; color: #111827;">$199</span>
              <span style="color: #6b7280;">/month</span>
            </div>
            <ul style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 1rem;">
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Everything in Pro</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Dedicated support</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Custom solutions</span>
              </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #10b981; flex-shrink: 0;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>24/7 support</span>
              </li>
            </ul>
            <button style="width: 100%; background: #111827; color: white; padding: 1rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer;">Contact Sales</button>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
];

