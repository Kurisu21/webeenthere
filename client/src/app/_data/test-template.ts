// Test template to verify loading works
export const testTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'Simple test template',
  category: 'portfolio' as const,
  image: '🧪',
  previewImage: '/test.jpg',
  is_featured: false,
  tags: ['test', 'simple'],
  elements: [
    {
      id: 'test-hero',
      type: 'hero',
      content: 'Test Hero Title',
      styles: {
        color: '#ffffff',
        fontSize: '32px',
        fontWeight: 'bold',
        backgroundColor: '#667eea',
        padding: '20px',
        textAlign: 'center'
      },
      position: { x: 100, y: 100 },
      size: { width: 400, height: 100 }
    },
    {
      id: 'test-text',
      type: 'text',
      content: 'This is test content',
      styles: {
        color: '#333333',
        fontSize: '16px',
        fontWeight: 'normal',
        backgroundColor: 'transparent',
        padding: '10px',
        textAlign: 'left'
      },
      position: { x: 100, y: 250 },
      size: { width: 300, height: 50 }
    }
  ],
  css_base: `body { font-family: Arial, sans-serif; }`
};




























