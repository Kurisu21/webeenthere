'use client';

import React from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';

export default function ChangelogPage() {
  const changelogEntries = [
    {
      version: 'v2.1.0',
      date: 'September 20, 2025',
      type: 'major',
      changes: [
        {
          type: 'feature',
          title: 'Collapsible Sidebar Navigation',
          description: 'Added collapsible sidebar that pushes content with smooth animations and responsive behavior'
        },
        {
          type: 'feature',
          title: 'Dynamic Routing System',
          description: 'Implemented Next.js App Router with individual pages for each dashboard feature (main, profile, create, host, extensions, share, images, goals, changelog)'
        },
        {
          type: 'feature',
          title: 'Template System with Preview',
          description: 'Created template selector with 5 categories (portfolio, business, personal, creative, landing) and visual preview system with gradient backgrounds'
        },
        {
          type: 'feature',
          title: 'AI Assistant Integration',
          description: 'Added AI-powered content generation using OpenRouter API with DeepSeek model for generating and improving website sections'
        },
        {
          type: 'feature',
          title: 'Element Resizing System',
          description: 'Implemented drag-to-resize functionality for website elements with visual resize handles (corners and edges)'
        },
        {
          type: 'feature',
          title: 'Image Upload System',
          description: 'Added local image upload functionality that converts images to base64 data URLs for website elements'
        },
        {
          type: 'feature',
          title: 'Advanced Element Properties',
          description: 'Enhanced element styling with borders, border colors, opacity controls, width/height, and comprehensive CSS properties'
        },
        {
          type: 'feature',
          title: 'Mobile-Responsive Website Generation',
          description: 'Updated HTML/CSS generation to create mobile-first responsive websites with proper viewport settings and media queries'
        },
        {
          type: 'feature',
          title: 'Changelog Documentation System',
          description: 'Created comprehensive changelog page with version tracking, feature documentation, and release history'
        },
        {
          type: 'improvement',
          title: 'Enhanced User Dashboard',
          description: 'Redesigned dashboard with modern UI, better navigation, and improved user experience across all pages'
        },
        {
          type: 'improvement',
          title: 'Template Loading and Parsing',
          description: 'Implemented robust template parsing system that converts HTML/CSS templates into editable website elements'
        },
        {
          type: 'improvement',
          title: 'Website Builder Interface',
          description: 'Enhanced website builder with better element management, properties panel, and improved preview system'
        }
      ]
    },
    {
      version: 'v2.0.0',
      date: 'September 19, 2025',
      type: 'major',
      changes: [
        {
          type: 'feature',
          title: 'Drag-and-Drop Website Builder',
          description: 'Implemented basic website builder with draggable elements (hero, text, image, button, about, gallery, contact, social)'
        },
        {
          type: 'feature',
          title: 'User Authentication System',
          description: 'Added user registration and login system with secure authentication'
        },
        {
          type: 'feature',
          title: 'Database Integration',
          description: 'Set up MySQL database with user and website management capabilities'
        },
        {
          type: 'feature',
          title: 'Element Styling System',
          description: 'Basic element styling with color, font size, font weight, background color, padding, margin, text alignment, and border radius'
        },
        {
          type: 'improvement',
          title: 'UI/UX Foundation',
          description: 'Established modern design patterns and responsive layout system'
        }
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-600';
      case 'improvement': return 'bg-blue-600';
      case 'bugfix': return 'bg-red-600';
      case 'major': return 'bg-purple-600';
      case 'minor': return 'bg-blue-500';
      case 'patch': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return '✨';
      case 'improvement': return '🔧';
      case 'bugfix': return '🐛';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">📝 Changelog</h1>
              <p className="text-gray-400">Track all features, improvements, and updates to Webeenthere</p>
            </div>

            <div className="space-y-8">
              {changelogEntries.map((entry, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getTypeColor(entry.type)}`}>
                      {entry.version}
                    </div>
                    <span className="text-gray-400 text-sm">{entry.date}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {entry.changes.map((change, changeIndex) => (
                      <div key={changeIndex} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{getTypeIcon(change.type)}</span>
                          <div>
                            <h3 className="text-white font-semibold mb-1">{change.title}</h3>
                            <p className="text-gray-300 text-sm">{change.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">🚀 Coming Soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">🎨 Advanced Themes</h3>
                  <p className="text-gray-300 text-sm">More professional templates and theme customization options</p>
                </div>
                <div className="bg-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">📊 Analytics Dashboard</h3>
                  <p className="text-gray-300 text-sm">Website performance tracking and visitor analytics</p>
                </div>
                <div className="bg-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">🔌 Plugin System</h3>
                  <p className="text-gray-300 text-sm">Extensible plugin architecture for third-party integrations</p>
                </div>
                <div className="bg-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">👥 Team Collaboration</h3>
                  <p className="text-gray-300 text-sm">Multi-user editing and real-time collaboration features</p>
                </div>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}
