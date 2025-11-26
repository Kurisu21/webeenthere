/**
 * Content creator-focused blocks for website builder
 * Blocks for bloggers, influencers, and content creators
 */

export const contentCreatorBlocks = [
  // Video Embed Section
  {
    id: 'video-embed-section',
    label: 'Video Embed',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:30px;background:currentColor;opacity:.15;border-radius:4px;position:relative">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:0;height:0;border-left:12px solid currentColor;border-top:8px solid transparent;border-bottom:8px solid transparent;opacity:.5"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Watch Our Latest Video</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Subscribe to our channel for more content</p>
        </div>
        <div style="max-width: 900px; margin: 0 auto;">
          <div data-gjs-type="youtube-embed" data-video-id="" style="position: relative; padding-bottom: 56.25%; height: 0; background: #1f2937; border-radius: 1rem; overflow: hidden; border: 2px dashed #6b7280;">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
              <div style="text-align: center; color: white; padding: 2rem;">
                <svg style="width: 4rem; height: 4rem; margin: 0 auto 1rem; opacity: 0.8;" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <p style="opacity: 0.8; font-size: 1.125rem; margin-bottom: 0.5rem;">Add YouTube Video ID</p>
                <p style="font-size: 0.875rem; opacity: 0.6;">Enter YouTube Video ID in properties panel</p>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">
            <a href="https://www.youtube.com" data-gjs-type="link-button" target="_blank" style="background: #ff0000; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none;">
              <svg style="width: 1.25rem; height: 1.25rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              Subscribe
            </a>
            <a href="#" data-gjs-type="link-button" target="_self" style="background: white; color: #1f2937; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #e5e7eb; cursor: pointer; text-decoration: none; display: inline-block;">Watch More</a>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Blog Post Grid
  {
    id: 'blog-post-grid',
    label: 'Blog Post Grid',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;bottom:4px;left:4px;right:4px;height:6px;background:currentColor;opacity:.3;border-radius:2px"></div>
          </div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;bottom:4px;left:4px;right:4px;height:6px;background:currentColor;opacity:.3;border-radius:2px"></div>
          </div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;position:relative">
            <div style="position:absolute;bottom:4px;left:4px;right:4px;height:6px;background:currentColor;opacity:.3;border-radius:2px"></div>
          </div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Latest Blog Posts</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Stay updated with our latest articles and insights</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          <article style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Blog Image" style="width: 100%; aspect-ratio: 16/9;"></div>
            <div style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 0.875rem; color: #6b7280;">January 15, 2025</span>
                <span style="font-size: 0.875rem; color: #6b7280;">•</span>
                <span style="font-size: 0.875rem; color: #667eea; font-weight: 600;">Category</span>
              </div>
              <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Blog Post Title</h3>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">This is a preview of the blog post content. It gives readers a taste of what they'll find in the full article...</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline; display: inline-flex; align-items: center; gap: 0.5rem;">Read More <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></a>
            </div>
          </article>
          <article style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div style="width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
            <div style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 0.875rem; color: #6b7280;">January 10, 2025</span>
                <span style="font-size: 0.875rem; color: #6b7280;">•</span>
                <span style="font-size: 0.875rem; color: #f5576c; font-weight: 600;">Category</span>
              </div>
              <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Blog Post Title</h3>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">This is a preview of the blog post content. It gives readers a taste of what they'll find in the full article...</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline; display: inline-flex; align-items: center; gap: 0.5rem;">Read More <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></a>
            </div>
          </article>
          <article style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">
            <div style="width: 100%; aspect-ratio: 16/9; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"></div>
            <div style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span style="font-size: 0.875rem; color: #6b7280;">January 5, 2025</span>
                <span style="font-size: 0.875rem; color: #6b7280;">•</span>
                <span style="font-size: 0.875rem; color: #00f2fe; font-weight: 600;">Category</span>
              </div>
              <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Blog Post Title</h3>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">This is a preview of the blog post content. It gives readers a taste of what they'll find in the full article...</p>
              <a href="#" data-gjs-type="text-link" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline; display: inline-flex; align-items: center; gap: 0.5rem;">Read More <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg></a>
            </div>
          </article>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Social Media Feed
  {
    id: 'social-media-feed',
    label: 'Social Media Feed',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.25;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Follow Us on Social Media</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Stay connected and see our latest updates</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Add Image" style="width: 100%; aspect-ratio: 1;"></div>
            <div style="padding: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 2.5rem; height: 2.5rem; background: #e5e7eb; border-radius: 50%;"></div>
                <div>
                  <div style="font-weight: 600; color: #111827;">@username</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">2 hours ago</div>
                </div>
              </div>
              <p style="color: #4b5563; margin-bottom: 0.75rem;">Check out our latest post! #content #creator</p>
              <div style="display: flex; gap: 1rem; color: #6b7280; font-size: 0.875rem;">
                <span>❤️ 1.2K</span>
                <span>💬 45</span>
                <span>📤 Share</span>
              </div>
            </div>
          </div>
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);"></div>
            <div style="padding: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 2.5rem; height: 2.5rem; background: #e5e7eb; border-radius: 50%;"></div>
                <div>
                  <div style="font-weight: 600; color: #111827;">@username</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">5 hours ago</div>
                </div>
              </div>
              <p style="color: #4b5563; margin-bottom: 0.75rem;">New content coming soon! Stay tuned 🎬</p>
              <div style="display: flex; gap: 1rem; color: #6b7280; font-size: 0.875rem;">
                <span>❤️ 890</span>
                <span>💬 32</span>
                <span>📤 Share</span>
              </div>
            </div>
          </div>
          <div style="background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);"></div>
            <div style="padding: 1rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="width: 2.5rem; height: 2.5rem; background: #e5e7eb; border-radius: 50%;"></div>
                <div>
                  <div style="font-weight: 600; color: #111827;">@username</div>
                  <div style="font-size: 0.875rem; color: #6b7280;">1 day ago</div>
                </div>
              </div>
              <p style="color: #4b5563; margin-bottom: 0.75rem;">Behind the scenes of our latest project ✨</p>
              <div style="display: flex; gap: 1rem; color: #6b7280; font-size: 0.875rem;">
                <span>❤️ 2.5K</span>
                <span>💬 120</span>
                <span>📤 Share</span>
              </div>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer;">Follow Us</button>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Image Gallery Masonry
  {
    id: 'gallery-masonry',
    label: 'Gallery (Masonry)',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.25;border-radius:4px;height:100%"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;height:80%"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px;height:100%"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Photo Gallery</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">A collection of our best moments</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; grid-auto-rows: 10px;">
          <div style="grid-row-end: span 30; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
          <div style="grid-row-end: span 25; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
          <div style="grid-row-end: span 35; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
          <div style="grid-row-end: span 28; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
          <div style="grid-row-end: span 32; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
          <div style="grid-row-end: span 27; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="width: 100%; height: 100%; aspect-ratio: 1;"></div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Before/After Comparison
  {
    id: 'before-after',
    label: 'Before/After',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:2px">
          <div style="flex:1;background:currentColor;opacity:.3;border-radius:4px"></div>
          <div style="width:2px;background:currentColor;opacity:.5"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Transformation Results</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">See the difference our work makes</p>
        </div>
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="position: relative; width: 100%; aspect-ratio: 16/9; border-radius: 1rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <div style="position: absolute; top: 0; left: 0; width: 50%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white;">
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">BEFORE</div>
                <div style="font-size: 0.875rem; opacity: 0.9;">Original state</div>
              </div>
            </div>
            <div style="position: absolute; top: 0; left: 50%; width: 50%; height: 100%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white;">
              <div style="text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">AFTER</div>
                <div style="font-size: 0.875rem; opacity: 0.9;">Transformed result</div>
              </div>
            </div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 3rem; height: 3rem; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2); z-index: 10;">
              <svg style="width: 1.5rem; height: 1.5rem; color: #667eea;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; margin-top: 3rem;">
            <div style="text-align: center;">
              <div style="font-size: 2.5rem; font-weight: 700; color: #667eea; margin-bottom: 0.5rem;">75%</div>
              <div style="color: #6b7280;">Improvement Rate</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 2.5rem; font-weight: 700; color: #f5576c; margin-bottom: 0.5rem;">2x</div>
              <div style="color: #6b7280;">Performance Boost</div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Instagram-style Feed
  {
    id: 'instagram-feed',
    label: 'Instagram Feed',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.25;border-radius:2px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:2px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:2px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:2px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Follow @username</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">See our latest posts on Instagram</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 1.2K</span>
                <span style="font-weight: 600;">💬 45</span>
              </div>
            </div>
          </div>
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 890</span>
                <span style="font-weight: 600;">💬 32</span>
              </div>
            </div>
          </div>
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 2.5K</span>
                <span style="font-weight: 600;">💬 120</span>
              </div>
            </div>
          </div>
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 1.8K</span>
                <span style="font-weight: 600;">💬 67</span>
              </div>
            </div>
          </div>
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 3.2K</span>
                <span style="font-weight: 600;">💬 189</span>
              </div>
            </div>
          </div>
          <div style="position: relative; aspect-ratio: 1; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); border-radius: 0.5rem; overflow: hidden; cursor: pointer;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;">
              <div style="display: flex; gap: 1.5rem; color: white;">
                <span style="font-weight: 600;">❤️ 950</span>
                <span style="font-weight: 600;">💬 41</span>
              </div>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
          <a href="#" style="display: inline-flex; align-items: center; gap: 0.5rem; color: #E4405F; font-weight: 600; text-decoration: none;">
            <svg style="width: 1.5rem; height: 1.5rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.699-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Podcast Player
  {
    id: 'podcast-player',
    label: 'Podcast Player',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:30px;display:flex;align-items:center;gap:8px">
          <div style="width:30px;height:30px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="flex:1;height:4px;background:currentColor;opacity:.2;border-radius:2px"></div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: #f9fafb;">
      <div style="max-width: 900px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Latest Podcast Episode</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Listen to our newest episode</p>
        </div>
        <div style="background: white; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 200px 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div style="width: 200px; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem;"></div>
            <div>
              <span style="display: inline-block; background: #dbeafe; color: #1e40af; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem;">Episode 42</span>
              <h3 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827;">Podcast Episode Title</h3>
              <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1rem;">Join us as we discuss the latest trends, insights, and stories from the industry.</p>
              <div style="display: flex; align-items: center; gap: 1rem; color: #6b7280; font-size: 0.875rem;">
                <span>🎙️ 45 min</span>
                <span>📅 Jan 15, 2025</span>
              </div>
            </div>
          </div>
          <div style="background: #f9fafb; border-radius: 0.75rem; padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <button style="width: 3.5rem; height: 3.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <svg style="width: 1.5rem; height: 1.5rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div style="flex: 1;">
                <div style="height: 6px; background: #e5e7eb; border-radius: 9999px; margin-bottom: 0.5rem;">
                  <div style="width: 35%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 9999px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #6b7280;">
                  <span>12:34</span>
                  <span>45:00</span>
                </div>
              </div>
            </div>
            <div style="display: flex; justify-content: center; gap: 1rem;">
              <button style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #e5e7eb; cursor: pointer;">Subscribe</button>
              <button style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #e5e7eb; cursor: pointer;">Download</button>
              <button style="background: white; color: #667eea; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid #e5e7eb; cursor: pointer;">Share</button>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
  // Media Showcase
  {
    id: 'media-showcase',
    label: 'Media Showcase',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:1px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:40px;display:flex;gap:4px">
          <div style="flex:2;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:4px">
            <div style="flex:1;background:currentColor;opacity:.15;border-radius:4px"></div>
            <div style="flex:1;background:currentColor;opacity:.15;border-radius:4px"></div>
          </div>
        </div>
      </div>
    `,
    content: `<section style="padding: 5rem 1rem; background: white;">
      <div style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; color: #111827;">Featured Media</h2>
          <p style="font-size: 1.125rem; color: #6b7280;">Our best videos, images, and content</p>
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div style="aspect-ratio: 16/9; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; overflow: hidden; position: relative; cursor: pointer;">
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
              <svg style="width: 4rem; height: 4rem; color: white; opacity: 0.9;" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <div style="position: absolute; bottom: 1rem; left: 1rem; color: white;">
              <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">Featured Video</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Watch now</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="flex: 1; aspect-ratio: 1; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 1rem; cursor: pointer;"></div>
            <div style="flex: 1; aspect-ratio: 1; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 1rem; cursor: pointer;"></div>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); border-radius: 0.75rem; cursor: pointer;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 0.75rem; cursor: pointer;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); border-radius: 0.75rem; cursor: pointer;"></div>
          <div style="aspect-ratio: 1; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 0.75rem; cursor: pointer;"></div>
        </div>
      </div>
    </section>`,
    category: 'Content',
  },
];

