/**
 * Comprehensive blocks for website builder
 * Organized into: Layout, Basic, Sections, and Other categories
 * All blocks are designed to be beautiful and modern
 */

export const comprehensiveBlocks = [
  // ==================== LAYOUT BLOCKS ====================
  {
    id: 'container',
    label: 'Container',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:90%;height:70%;border:1px solid currentColor;border-radius:4px;opacity:.3"></div>
      </div>
    `,
    content: '<div class="container mx-auto px-4 max-w-7xl"><div>Content goes here</div></div>',
    category: 'Layout',
  },
  {
    id: 'row',
    label: 'Row',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:90%;height:50%;display:flex;gap:4px">
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: '<div class="flex flex-wrap -mx-4"><div class="w-full px-4">Column 1</div><div class="w-full px-4">Column 2</div></div>',
    category: 'Layout',
  },
  {
    id: 'two-columns',
    label: 'Two Columns',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:90%;height:50%;display:flex;gap:4px">
          <div style="flex:1;background:currentColor;opacity:.25;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.25;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Column 1</h3>
        <p>Content for first column</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Column 2</h3>
        <p>Content for second column</p>
      </div>
    </div>`,
    category: 'Layout',
  },
  {
    id: 'three-columns',
    label: 'Three Columns',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:90%;height:50%;display:flex;gap:4px">
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Column 1</h3>
        <p>Content for first column</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Column 2</h3>
        <p>Content for second column</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Column 3</h3>
        <p>Content for third column</p>
      </div>
    </div>`,
    category: 'Layout',
  },
  {
    id: 'four-columns',
    label: 'Four Columns',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:90%;height:50%;display:flex;gap:3px">
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="flex:1;background:currentColor;opacity:.2;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 bg-gray-50 rounded-lg text-center">
        <h4 class="font-semibold mb-1">Item 1</h4>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg text-center">
        <h4 class="font-semibold mb-1">Item 2</h4>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg text-center">
        <h4 class="font-semibold mb-1">Item 3</h4>
      </div>
      <div class="p-4 bg-gray-50 rounded-lg text-center">
        <h4 class="font-semibold mb-1">Item 4</h4>
      </div>
    </div>`,
    category: 'Layout',
  },
  {
    id: 'card-layout',
    label: 'Card Layout',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:60%;background:white;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,.1);border:1px solid currentColor;opacity:.3"></div>
      </div>
    `,
    content: `<div class="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6">
        <h3 class="text-2xl font-bold mb-2">Card Title</h3>
        <p class="text-gray-600">Card description goes here. This is a beautiful card layout.</p>
      </div>
    </div>`,
    category: 'Layout',
  },

  // ==================== BASIC BLOCKS ====================
  {
    id: 'link',
    label: 'Link',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <svg style="width:2rem;height:2rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
      </div>
    `,
    content: '<a href="#" class="text-blue-600 hover:text-blue-800 underline">Link Text</a>',
    category: 'Basic',
  },
  {
    id: 'list-ordered',
    label: 'Ordered List',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg);font-weight:700;font-size:18px">1. 2. 3.</div>
    `,
    content: `<ol class="list-decimal list-inside space-y-2">
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ol>`,
    category: 'Basic',
  },
  {
    id: 'list-unordered',
    label: 'Unordered List',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg);font-weight:700;font-size:18px">• • •</div>
    `,
    content: `<ul class="list-disc list-inside space-y-2">
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ul>`,
    category: 'Basic',
  },
  {
    id: 'quote',
    label: 'Quote',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="font-size:2rem;opacity:.5">"</div>
      </div>
    `,
    content: `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 italic text-gray-700">
      <p class="text-lg">"This is a beautiful quote block that stands out and adds emphasis to important text."</p>
      <footer class="mt-2 text-sm text-gray-500">— Author Name</footer>
    </blockquote>`,
    category: 'Basic',
  },
  {
    id: 'divider',
    label: 'Divider',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:2px;background:currentColor;opacity:.3"></div>
      </div>
    `,
    content: '<hr class="my-8 border-t-2 border-gray-300">',
    category: 'Basic',
  },
  {
    id: 'spacer',
    label: 'Spacer',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:flex;gap:4px;align-items:center">
          <div style="width:8px;height:8px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="width:8px;height:8px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="width:8px;height:8px;background:currentColor;opacity:.3;border-radius:50%"></div>
        </div>
      </div>
    `,
    content: '<div class="h-16"></div>',
    category: 'Basic',
  },
  {
    id: 'video',
    label: 'Video',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <svg style="width:2rem;height:2rem;" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </div>
    `,
    content: `<div class="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <div class="absolute inset-0 flex items-center justify-center">
        <svg class="w-20 h-20 text-white opacity-75" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <video class="w-full h-full object-cover" controls>
        <source src="#" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>`,
    category: 'Basic',
  },
  {
    id: 'badge',
    label: 'Badge',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="padding:4px 12px;background:currentColor;opacity:.2;border-radius:9999px;font-size:12px;font-weight:600">Badge</div>
      </div>
    `,
    content: '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">Badge Text</span>',
    category: 'Basic',
  },
  {
    id: 'code-block',
    label: 'Code Block',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg);font-family:monospace;font-size:14px">&lt;/&gt;</div>
    `,
    content: `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code>function example() {
  return "Hello World";
}</code></pre>`,
    category: 'Basic',
  },

  // ==================== SECTION BLOCKS ====================
  {
    id: 'about-section',
    label: 'About Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:flex;gap:8px;align-items:center">
          <div style="width:24px;height:24px;background:currentColor;opacity:.2;border-radius:50%"></div>
          <div style="font-weight:600;font-size:14px">About</div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-white">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">About Us</h2>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6"></div>
        </div>
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="About Image" style="width: 100%; aspect-ratio: 1; border-radius: 1rem;"></div>
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-4">Our Story</h3>
            <p class="text-gray-600 mb-4 leading-relaxed">We are a passionate team dedicated to creating beautiful and functional websites. Our mission is to help businesses establish a strong online presence.</p>
            <p class="text-gray-600 mb-6 leading-relaxed">With years of experience and a commitment to excellence, we deliver solutions that exceed expectations.</p>
            <a href="#" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Learn More</a>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'contact-section',
    label: 'Contact Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <svg style="width:2rem;height:2rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
    `,
    content: `<section class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">Get In Touch</h2>
          <p class="text-lg text-gray-600">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
        <div class="grid md:grid-cols-2 gap-12">
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Address</h3>
                <p class="text-gray-600">123 Business Street<br>City, State 12345</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Phone</h3>
                <p class="text-gray-600">+1 (555) 123-4567</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 class="font-semibold text-lg mb-1">Email</h3>
                <p class="text-gray-600">hello@example.com</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-8 rounded-xl shadow-lg">
            <form class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="5" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your message"></textarea>
              </div>
              <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'team-section',
    label: 'Team Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.2;border-radius:50%"></div>
          <div style="background:currentColor;opacity:.2;border-radius:50%"></div>
          <div style="background:currentColor;opacity:.2;border-radius:50%"></div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Meet Our Team</h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">The talented individuals who make everything possible</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="text-center group">
            <div class="relative mb-6">
              <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Team Member" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 auto;"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <div class="flex gap-3">
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-400 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.29 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                </div>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-1">John Doe</h3>
            <p class="text-blue-600 mb-2">CEO & Founder</p>
            <p class="text-sm text-gray-600">Visionary leader with 10+ years of experience</p>
          </div>
          <div class="text-center group">
            <div class="relative mb-6">
              <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Team Member" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 auto;"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <div class="flex gap-3">
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-400 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.29 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                </div>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-1">Jane Smith</h3>
            <p class="text-blue-600 mb-2">Creative Director</p>
            <p class="text-sm text-gray-600">Bringing creative visions to life</p>
          </div>
          <div class="text-center group">
            <div class="relative mb-6">
              <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Team Member" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 auto;"></div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <div class="flex gap-3">
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-500 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                  <a href="#" class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-blue-400 hover:text-white transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.29 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
                </div>
              </div>
            </div>
            <h3 class="text-xl font-bold mb-1">Mike Johnson</h3>
            <p class="text-blue-600 mb-2">Lead Developer</p>
            <p class="text-sm text-gray-600">Building amazing digital experiences</p>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'blog-section',
    label: 'Blog Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Latest Blog Posts</h2>
          <p class="text-lg text-gray-600">Stay updated with our latest news and insights</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Blog Image" style="width: 100%; aspect-ratio: 16/9;"></div>
            <div class="p-6">
              <span class="text-sm text-blue-600 font-semibold">Category</span>
              <h3 class="text-xl font-bold mt-2 mb-3">Blog Post Title</h3>
              <p class="text-gray-600 mb-4">Short excerpt from the blog post that gives readers a preview of the content...</p>
              <a href="#" class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2">
                Read More
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
            </div>
          </article>
          <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Blog Image" style="width: 100%; aspect-ratio: 16/9;"></div>
            <div class="p-6">
              <span class="text-sm text-blue-600 font-semibold">Category</span>
              <h3 class="text-xl font-bold mt-2 mb-3">Blog Post Title</h3>
              <p class="text-gray-600 mb-4">Short excerpt from the blog post that gives readers a preview of the content...</p>
              <a href="#" class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2">
                Read More
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
            </div>
          </article>
          <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Blog Image" style="width: 100%; aspect-ratio: 16/9;"></div>
            <div class="p-6">
              <span class="text-sm text-blue-600 font-semibold">Category</span>
              <h3 class="text-xl font-bold mt-2 mb-3">Blog Post Title</h3>
              <p class="text-gray-600 mb-4">Short excerpt from the blog post that gives readers a preview of the content...</p>
              <a href="#" class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2">
                Read More
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'gallery-masonry',
    label: 'Gallery Masonry',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:80%;height:40px">
          <div style="background:currentColor;opacity:.25;border-radius:4px;height:30px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;height:35px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px;height:25px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;height:28px"></div>
          <div style="background:currentColor;opacity:.25;border-radius:4px;height:32px"></div>
          <div style="background:currentColor;opacity:.2;border-radius:4px;height:30px"></div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-white">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Our Gallery</h2>
          <p class="text-lg text-gray-600">A collection of our best work and moments</p>
        </div>
        <div class="columns-1 md:columns-3 gap-4 space-y-4">
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
          <div data-gjs-type="image-placeholder" data-gjs-placeholder-text="Gallery Image" class="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow-md"></div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'faq-section',
    label: 'FAQ Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:60%;display:flex;flex-direction:column;gap:3px">
          <div style="width:100%;height:8px;background:currentColor;opacity:.2;border-radius:4px"></div>
          <div style="width:70%;height:8px;background:currentColor;opacity:.15;border-radius:4px"></div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-white">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p class="text-lg text-gray-600">Everything you need to know</p>
        </div>
        <div class="space-y-4">
          <details class="group bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition">
            <summary class="flex justify-between items-center cursor-pointer font-semibold text-lg">
              <span>What is your return policy?</span>
              <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <p class="mt-4 text-gray-600">We offer a 30-day return policy on all products. Items must be in original condition with tags attached.</p>
          </details>
          <details class="group bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition">
            <summary class="flex justify-between items-center cursor-pointer font-semibold text-lg">
              <span>How long does shipping take?</span>
              <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <p class="mt-4 text-gray-600">Standard shipping takes 5-7 business days. Express shipping options are available at checkout.</p>
          </details>
          <details class="group bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition">
            <summary class="flex justify-between items-center cursor-pointer font-semibold text-lg">
              <span>Do you offer international shipping?</span>
              <svg class="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </summary>
            <p class="mt-4 text-gray-600">Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location.</p>
          </details>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
  {
    id: 'timeline-section',
    label: 'Timeline Section',
    media: `
      <div style="width:100%;height:56px;border-radius:8px;border:2px dashed currentColor;color:#64748b;display:flex;align-items:center;justify-content:center;background:var(--gjs-thumb-bg)">
        <div style="width:80%;height:70%;display:flex;align-items:center;gap:8px">
          <div style="width:12px;height:12px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="flex:1;height:2px;background:currentColor;opacity:.2"></div>
          <div style="width:12px;height:12px;background:currentColor;opacity:.3;border-radius:50%"></div>
          <div style="flex:1;height:2px;background:currentColor;opacity:.2"></div>
          <div style="width:12px;height:12px;background:currentColor;opacity:.3;border-radius:50%"></div>
        </div>
      </div>
    `,
    content: `<section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold mb-4">Our Journey</h2>
          <p class="text-lg text-gray-600">Key milestones in our company history</p>
        </div>
        <div class="relative">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          <div class="space-y-12">
            <div class="relative flex items-start gap-8">
              <div class="relative z-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold">2020</span>
              </div>
              <div class="flex-1 pt-2">
                <h3 class="text-2xl font-bold mb-2">Company Founded</h3>
                <p class="text-gray-600">We started with a vision to revolutionize the industry and make a positive impact.</p>
              </div>
            </div>
            <div class="relative flex items-start gap-8">
              <div class="relative z-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold">2021</span>
              </div>
              <div class="flex-1 pt-2">
                <h3 class="text-2xl font-bold mb-2">First Major Milestone</h3>
                <p class="text-gray-600">Reached 1,000 customers and launched our flagship product to great success.</p>
              </div>
            </div>
            <div class="relative flex items-start gap-8">
              <div class="relative z-10 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-white font-bold">2023</span>
              </div>
              <div class="flex-1 pt-2">
                <h3 class="text-2xl font-bold mb-2">Global Expansion</h3>
                <p class="text-gray-600">Expanded to 20 countries and opened offices in key markets worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`,
    category: 'Sections',
  },
];










