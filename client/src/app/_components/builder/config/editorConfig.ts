import type Editor from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

export const createEditorConfig = (onSave?: (html: string) => void): any => {
  return {
    height: '100%',
    width: '100%',
    storageManager: {
      autosave: false,
      autoload: false,
      type: 'remote',
      stepsBeforeSave: 1,
    },
    canvas: {
      styles: [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
      ],
    },
    layerManager: {
      appendTo: '.layers-container',
    },
    panels: {
      defaults: [
        {
          id: 'layers',
          el: '.panel__right',
          resizable: {
            maxDim: 350,
            minDim: 200,
            tc: 0,
            cl: 1,
            cr: 0,
            bc: 0,
            keyWidth: 'flex-basis',
          },
        },
        {
          id: 'panel-devices',
          el: '.panel__devices',
          buttons: [
            {
              id: 'device-desktop',
              label: 'Desktop',
              command: 'set-device-desktop',
              togglable: false,
            },
            {
              id: 'device-tablet',
              label: 'Tablet',
              command: 'set-device-tablet',
              togglable: false,
            },
            {
              id: 'device-mobile',
              label: 'Mobile',
              command: 'set-device-mobile',
              togglable: false,
            },
          ],
        },
      ],
    },
    blockManager: {
      appendTo: '.blocks-container',
      blocks: [
        {
          id: 'section',
          label: '<b>Section</b>',
          attributes: { class: 'gjs-block-section' },
          content: '<section class="p-8 bg-gray-100 min-h-screen"><div class="max-w-6xl mx-auto">Section Content</div></section>',
          category: 'Layout',
        },
        {
          id: 'text',
          label: 'Text',
          content: { type: 'text', components: 'Insert your text here' },
          category: 'Basic',
        },
        {
          id: 'image',
          label: 'Image',
          select: true,
          content: { type: 'image' },
          activate: true,
          category: 'Basic',
        },
        {
          id: 'heading',
          label: 'Heading',
          content: { type: 'heading', components: 'Heading Text' },
          category: 'Basic',
        },
        {
          id: 'button',
          label: 'Button',
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
      ],
    },
    styleManager: {
      appendTo: '.styles-container',
      sectors: [
        {
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'min-height', 'padding'],
          properties: [
            {
              type: 'integer',
              name: 'The width',
              property: 'width',
              units: ['px', '%'],
              defaults: 'auto',
              min: 0,
            },
          ],
        },
        {
          name: 'Extra',
          open: false,
          buildProps: ['background-color', 'box-shadow', 'custom-prop'],
          properties: [
            {
              id: 'custom-prop',
              name: 'Custom Label',
              property: 'font-size',
              type: 'select',
              defaults: '32px',
              options: [
                { value: '12px', name: 'Tiny' },
                { value: '18px', name: 'Medium' },
                { value: '32px', name: 'Big' },
              ],
            },
          ],
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
        {
          id: 'save',
          run: (editor: any) => {
            if (onSave) {
              const html = editor.getHtml();
              const css = editor.getCss();
              const fullHtml = `<style>${css}</style>${html}`;
              onSave(fullHtml);
            }
          },
        },
      ],
    },
  };
};
