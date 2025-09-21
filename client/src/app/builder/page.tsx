'use client';

import React, { useState } from 'react';

export default function PageBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [websiteData, setWebsiteData] = useState({
    title: '',
    description: '',
    content: ''
  });

  const templates = [
    { id: 'blank', name: 'Start from Scratch', description: 'Build your own design' },
    { id: 'portfolio', name: 'Portfolio', description: 'Perfect for showcasing work' },
    { id: 'business', name: 'Business', description: 'Professional business page' },
    { id: 'landing', name: 'Landing Page', description: 'Convert visitors to customers' },
    { id: 'blog', name: 'Blog', description: 'Share your thoughts and stories' }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSave = () => {
    console.log('Saving website:', { selectedTemplate, ...websiteData });
    alert('Website saved! (This is a demo)');
  };

  const handlePreview = () => {
    console.log('Previewing website:', { selectedTemplate, ...websiteData });
    alert('Preview opened! (This is a demo)');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white text-xl font-bold">🎨 Page Builder</h1>
            <span className="text-gray-400 text-sm">Build your website</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreview}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              👁️ Preview
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              💾 Save
            </button>
            <a
              href="/user"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!selectedTemplate ? (
          /* Template Selection */
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold mb-2">Choose Your Template</h2>
              <p className="text-gray-400">Select a template to get started or build from scratch</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-gray-750 transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl">
                        {template.id === 'blank' ? '🆕' : 
                         template.id === 'portfolio' ? '👨‍💼' :
                         template.id === 'business' ? '🏢' :
                         template.id === 'landing' ? '🚀' : '📝'}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-400 text-sm">{template.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Website Builder Interface */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold">Building: {templates.find(t => t.id === selectedTemplate)?.name}</h2>
                <p className="text-gray-400">Customize your website</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← Change Template
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Sidebar - Tools */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-4">🧱 Add Elements</h3>
                  <div className="space-y-2">
                    {['Text', 'Image', 'Button', 'Section', 'Gallery', 'Contact Form'].map((element) => (
                      <button
                        key={element}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors"
                      >
                        {element}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Canvas */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-300 rounded-lg min-h-[600px] p-6">
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Website Title</h1>
                      <p className="text-gray-600">Click to edit this text</p>
                    </div>
                    
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold text-gray-800 mb-2">About Section</h2>
                      <p className="text-gray-600">Add your content here. Click to edit.</p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h2 className="text-xl font-semibold text-blue-800 mb-2">Call to Action</h2>
                      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Website Settings */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">⚙️ Website Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Website Title</label>
                  <input
                    type="text"
                    value={websiteData.title}
                    onChange={(e) => setWebsiteData({...websiteData, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter website title"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={websiteData.description}
                    onChange={(e) => setWebsiteData({...websiteData, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter website description"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}






