/**
 * Business-focused blocks for website builder
 * Professional blocks for business owners
 */

export const businessBlocks = [
  // Services Grid
  {
    id: 'services-grid',
    label: 'Services Grid',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Our Services</h2>
          <p style="font-size: 1.125rem; color: #6b7280; max-width: 600px; margin: 0 auto;">We provide comprehensive solutions to help your business grow</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              <svg style="width: 2rem; height: 2rem; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Service One</h3>
            <p style="color: #6b7280; line-height: 1.6;">Professional service description that highlights key benefits and value proposition</p>
          </div>
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              <svg style="width: 2rem; height: 2rem; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Service Two</h3>
            <p style="color: #6b7280; line-height: 1.6;">Professional service description that highlights key benefits and value proposition</p>
          </div>
          <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; transition: transform 0.2s;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              <svg style="width: 2rem; height: 2rem; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Service Three</h3>
            <p style="color: #6b7280; line-height: 1.6;">Professional service description that highlights key benefits and value proposition</p>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Product Showcase
  {
    id: 'product-showcase',
    label: 'Product Showcase',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:8px;align-items:center">
          <div style="width:30%;height:100%;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;height:100%;background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
          <div>
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Product Image" style="width: 100%; aspect-ratio: 1; border-radius: 1rem; margin-bottom: 1rem;"></div>
          </div>
          <div>
            <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;">Featured Product</span>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Premium Product Name</h2>
            <p style="font-size: 1.125rem; color: #6b7280; margin-bottom: 1.5rem; line-height: 1.7;">Discover our flagship product designed to transform your workflow. Built with cutting-edge technology and premium materials.</p>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
              <span style="font-size: 2.5rem; font-weight: 700; color: #2563eb;">$99.99</span>
              <span style="font-size: 1.25rem; color: #9ca3af; text-decoration: line-through;">$149.99</span>
            </div>
            <div style="display: flex; gap: 1rem;">
              <a href="#" data-gjs-type="link-button" target="_self" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-decoration: none; display: inline-block;">Add to Cart</a>
              <a href="#" data-gjs-type="link-button" target="_self" style="background: white; color: #667eea; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #667eea; cursor: pointer; text-decoration: none; display: inline-block;">Learn More</a>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Portfolio Grid
  {
    id: 'portfolio-grid',
    label: 'Portfolio Grid',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.25;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Our Portfolio</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Showcasing our best work and successful projects</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Project Image" style="width: 100%; aspect-ratio: 4/3;"></div>
            <div style="padding: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">Project Title</h3>
              <p style="color: #6b7280; margin-bottom: 1rem;">Project description and key highlights</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">View Project →</a>
            </div>
          </div>
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Project Image" style="width: 100%; aspect-ratio: 4/3;"></div>
            <div style="padding: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">Project Title</h3>
              <p style="color: #6b7280; margin-bottom: 1rem;">Project description and key highlights</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">View Project →</a>
            </div>
          </div>
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Project Image" style="width: 100%; aspect-ratio: 4/3;"></div>
            <div style="padding: 1.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827;">Project Title</h3>
              <p style="color: #6b7280; margin-bottom: 1rem;">Project description and key highlights</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">View Project →</a>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Case Studies
  {
    id: 'case-studies',
    label: 'Case Studies',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:8px">
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Success Stories</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Real results from real clients</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem;">
          <div style="background: #f9fafb; padding: 2.5rem; border-radius: 1rem; border-left: 4px solid #667eea;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">A</div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;">Client Company</h3>
                <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">Industry Sector</p>
              </div>
            </div>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic;">"Working with this team transformed our business. The results exceeded all expectations and we saw a 300% increase in revenue."</p>
            <div style="display: flex; gap: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
              <div>
                <div style="font-size: 2rem; font-weight: 700; color: #667eea;">300%</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Revenue Increase</div>
              </div>
              <div>
                <div style="font-size: 2rem; font-weight: 700; color: #667eea;">6mo</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Timeframe</div>
              </div>
            </div>
          </div>
          <div style="background: #f9fafb; padding: 2.5rem; border-radius: 1rem; border-left: 4px solid #f5576c;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
              <div style="width: 3rem; height: 3rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">B</div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0;">Client Company</h3>
                <p style="color: #6b7280; margin: 0; font-size: 0.875rem;">Industry Sector</p>
              </div>
            </div>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 1.5rem; font-style: italic;">"Outstanding service and results. The team understood our needs and delivered beyond expectations."</p>
            <div style="display: flex; gap: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
              <div>
                <div style="font-size: 2rem; font-weight: 700; color: #f5576c;">250%</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Growth Rate</div>
              </div>
              <div>
                <div style="font-size: 2rem; font-weight: 700; color: #f5576c;">4mo</div>
                <div style="font-size: 0.875rem; color: #6b7280;">Timeframe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Client Logos
  {
    id: 'client-logos',
    label: 'Client Logos',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:30px;display:flex;gap:12px;align-items:center;justify-content:space-around">
          <div style="width:40px;height:20px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="width:40px;height:20px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="width:40px;height:20px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="width:40px;height:20px;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 4rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <p style="font-size: 0.875rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">Trusted By</p>
          <h2 style="font-size: 2rem; font-weight: 700; color: #111827;">Companies We Work With</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 3rem; align-items: center; opacity: 0.6;">
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 1</span>
          </div>
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 2</span>
          </div>
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 3</span>
          </div>
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 4</span>
          </div>
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 5</span>
          </div>
          <div style="height: 60px; background: #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center;">
            <span style="color: #9ca3af; font-weight: 600;">Logo 6</span>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // FAQ Accordion
  {
    id: 'faq-accordion',
    label: 'FAQ Accordion',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;flex-direction:column;gap:4px">
          <div style="height:8px;background:currentColor;opacity:.3;border-radius:4px"></div>
          <div style="height:8px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="height:8px;background:currentColor;opacity:.3;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 800px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Frequently Asked Questions</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Find answers to common questions</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="faq-item" data-gjs-type="faq-item" style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <h3 class="faq-question" style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">What is your return policy?</h3>
              <svg class="faq-icon" style="width: 1.5rem; height: 1.5rem; color: #6b7280; transition: transform 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div class="faq-content" style="color: #6b7280; margin-top: 1rem; line-height: 1.6; display: none;">We offer a 30-day money-back guarantee on all products. If you're not satisfied, contact us for a full refund.</div>
          </div>
          <div class="faq-item" data-gjs-type="faq-item" style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <h3 class="faq-question" style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">How long does shipping take?</h3>
              <svg class="faq-icon" style="width: 1.5rem; height: 1.5rem; color: #6b7280; transition: transform 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div class="faq-content" style="color: #6b7280; margin-top: 1rem; line-height: 1.6; display: none;">Standard shipping takes 5-7 business days. Express shipping options are available at checkout.</div>
          </div>
          <div class="faq-item" data-gjs-type="faq-item" style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <h3 class="faq-question" style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">Do you offer customer support?</h3>
              <svg class="faq-icon" style="width: 1.5rem; height: 1.5rem; color: #6b7280; transition: transform 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div class="faq-content" style="color: #6b7280; margin-top: 1rem; line-height: 1.6; display: none;">Yes, we provide 24/7 customer support via email, chat, and phone. Our team is always ready to help.</div>
          </div>
          <div class="faq-item" data-gjs-type="faq-item" style="background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div class="faq-header" style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
              <h3 class="faq-question" style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0;">What payment methods do you accept?</h3>
              <svg class="faq-icon" style="width: 1.5rem; height: 1.5rem; color: #6b7280; transition: transform 0.3s;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
            <div class="faq-content" style="color: #6b7280; margin-top: 1rem; line-height: 1.6; display: none;">We accept all major credit cards, PayPal, and bank transfers. All transactions are secure and encrypted.</div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Process/Timeline
  {
    id: 'process-timeline',
    label: 'Process Timeline',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:30px;display:flex;align-items:center;justify-content:space-between">
          <div style="width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="flex:1;height:2px;background:currentColor;opacity:.2;margin:0 8px"></div>
          <div style="width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="flex:1;height:2px;background:currentColor;opacity:.2;margin:0 8px"></div>
          <div style="width:20px;height:20px;background:currentColor;opacity:.3;border-radius:50%"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 4rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">How It Works</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Our simple, streamlined process</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; position: relative;">
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; font-weight: 700;">1</div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Step One</h3>
            <p style="color: #6b7280; line-height: 1.6;">Initial consultation and requirements gathering</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; font-weight: 700;">2</div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Step Two</h3>
            <p style="color: #6b7280; line-height: 1.6;">Design and development phase</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; font-weight: 700;">3</div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Step Three</h3>
            <p style="color: #6b7280; line-height: 1.6;">Testing, refinement, and launch</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: white; font-size: 1.5rem; font-weight: 700;">4</div>
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Step Four</h3>
            <p style="color: #6b7280; line-height: 1.6;">Ongoing support and optimization</p>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // About Us Enhanced
  {
    id: 'about-us-enhanced',
    label: 'About Us',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:8px;align-items:center">
          <div style="width:40%;height:100%;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;height:100%;background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;">
          <div>
            <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;">About Us</span>
            <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; color: #111827;">We're Building the Future</h2>
            <p style="font-size: 1.125rem; color: #6b7280; line-height: 1.7; margin-bottom: 1.5rem;">With over 10 years of experience, we've helped hundreds of businesses transform their digital presence and achieve remarkable growth.</p>
            <p style="color: #4b5563; line-height: 1.7; margin-bottom: 2rem;">Our team of experts combines creativity with technical excellence to deliver solutions that drive real results.</p>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 2rem;">
              <div>
                <div style="font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 0.5rem;">500+</div>
                <div style="color: #6b7280;">Projects Completed</div>
              </div>
              <div>
                <div style="font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 0.5rem;">10+</div>
                <div style="color: #6b7280;">Years Experience</div>
              </div>
            </div>
          </div>
          <div>
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add About Image" style="width: 100%; aspect-ratio: 4/3; border-radius: 1rem;"></div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Location/Map Section
  {
    id: 'location-map',
    label: 'Location/Map',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;background:currentColor;opacity:.15;border-radius:4px;position:relative">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;background:currentColor;opacity:.5;border-radius:50%"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Visit Our Office</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">We'd love to meet you in person</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;">
          <div>
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Map Image" style="width: 100%; aspect-ratio: 16/9; border-radius: 1rem; margin-bottom: 2rem;"></div>
            <div>
              <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Contact Information</h3>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; align-items: start; gap: 1rem;">
                  <svg style="width: 1.5rem; height: 1.5rem; color: #667eea; flex-shrink: 0; margin-top: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  <div>
                    <p style="font-weight: 600; color: #111827; margin: 0;">Address</p>
                    <p style="color: #6b7280; margin: 0;">123 Business Street, City, State 12345</p>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 1rem;">
                  <svg style="width: 1.5rem; height: 1.5rem; color: #667eea; flex-shrink: 0; margin-top: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  <div>
                    <p style="font-weight: 600; color: #111827; margin: 0;">Phone</p>
                    <p style="color: #6b7280; margin: 0;">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div style="display: flex; align-items: start; gap: 1rem;">
                  <svg style="width: 1.5rem; height: 1.5rem; color: #667eea; flex-shrink: 0; margin-top: 0.25rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  <div>
                    <p style="font-weight: 600; color: #111827; margin: 0;">Email</p>
                    <p style="color: #6b7280; margin: 0;">info@company.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
  // Social Proof Bar
  {
    id: 'social-proof-bar',
    label: 'Social Proof Bar',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:20px;display:flex;gap:16px;align-items:center;justify-content:space-around">
          <div style="width:30px;height:12px;background:currentColor;opacity:.2;border-radius:2px"></div>
          <div style="width:30px;height:12px;background:currentColor;opacity:.2;border-radius:2px"></div>
          <div style="width:30px;height:12px;background:currentColor;opacity:.2;border-radius:2px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 3rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center;">
          <div>
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">10K+</div>
            <div style="opacity: 0.9;">Happy Customers</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">4.9/5</div>
            <div style="opacity: 0.9;">Average Rating</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">500+</div>
            <div style="opacity: 0.9;">Projects Completed</div>
          </div>
          <div>
            <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem;">99%</div>
            <div style="opacity: 0.9;">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Business',
  },
];

