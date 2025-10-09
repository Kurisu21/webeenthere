'use client';

import React, { useState } from 'react';

interface StockAssetsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: { type: 'emoji' | 'symbol' | 'image'; value: string; name: string }) => void;
}

const EMOJIS = [
  { name: 'Smile', value: '😊' },
  { name: 'Heart', value: '❤️' },
  { name: 'Star', value: '⭐' },
  { name: 'Fire', value: '🔥' },
  { name: 'Thumbs Up', value: '👍' },
  { name: 'Check', value: '✅' },
  { name: 'Warning', value: '⚠️' },
  { name: 'Info', value: 'ℹ️' },
  { name: 'Light Bulb', value: '💡' },
  { name: 'Rocket', value: '🚀' },
  { name: 'Diamond', value: '💎' },
  { name: 'Crown', value: '👑' },
  { name: 'Trophy', value: '🏆' },
  { name: 'Medal', value: '🏅' },
  { name: 'Gift', value: '🎁' },
  { name: 'Party', value: '🎉' },
  { name: 'Balloon', value: '🎈' },
  { name: 'Cake', value: '🎂' },
  { name: 'Coffee', value: '☕' },
  { name: 'Pizza', value: '🍕' },
  { name: 'Music', value: '🎵' },
  { name: 'Camera', value: '📷' },
  { name: 'Phone', value: '📱' },
  { name: 'Email', value: '📧' },
  { name: 'Globe', value: '🌍' },
  { name: 'Sun', value: '☀️' },
  { name: 'Moon', value: '🌙' },
  { name: 'Rainbow', value: '🌈' },
  { name: 'Flower', value: '🌸' },
  { name: 'Tree', value: '🌳' }
];

const SYMBOLS = [
  { name: 'Arrow Right', value: '→' },
  { name: 'Arrow Left', value: '←' },
  { name: 'Arrow Up', value: '↑' },
  { name: 'Arrow Down', value: '↓' },
  { name: 'Double Arrow Right', value: '⇒' },
  { name: 'Double Arrow Left', value: '⇐' },
  { name: 'Checkmark', value: '✓' },
  { name: 'Cross', value: '✗' },
  { name: 'Plus', value: '+' },
  { name: 'Minus', value: '−' },
  { name: 'Multiply', value: '×' },
  { name: 'Divide', value: '÷' },
  { name: 'Equal', value: '=' },
  { name: 'Not Equal', value: '≠' },
  { name: 'Less Than', value: '<' },
  { name: 'Greater Than', value: '>' },
  { name: 'Less or Equal', value: '≤' },
  { name: 'Greater or Equal', value: '≥' },
  { name: 'Infinity', value: '∞' },
  { name: 'Pi', value: 'π' },
  { name: 'Alpha', value: 'α' },
  { name: 'Beta', value: 'β' },
  { name: 'Gamma', value: 'γ' },
  { name: 'Delta', value: 'δ' },
  { name: 'Omega', value: 'Ω' },
  { name: 'Sigma', value: 'Σ' },
  { name: 'Copyright', value: '©' },
  { name: 'Registered', value: '®' },
  { name: 'Trademark', value: '™' },
  { name: 'Bullet', value: '•' },
  { name: 'Diamond', value: '♦' },
  { name: 'Spade', value: '♠' },
  { name: 'Heart', value: '♥' },
  { name: 'Club', value: '♣' },
  { name: 'Star', value: '★' },
  { name: 'Sun', value: '☀' },
  { name: 'Moon', value: '☽' },
  { name: 'Phone', value: '☎' },
  { name: 'Email', value: '✉' },
  { name: 'Scissors', value: '✂' },
  { name: 'Pencil', value: '✎' },
  { name: 'Pen', value: '✏' },
  { name: 'Lock', value: '🔒' },
  { name: 'Key', value: '🔑' },
  { name: 'Bell', value: '🔔' },
  { name: 'Bookmark', value: '🔖' },
  { name: 'Link', value: '🔗' },
  { name: 'Wrench', value: '🔧' },
  { name: 'Gear', value: '⚙' },
  { name: 'Shield', value: '🛡' },
  { name: 'Flag', value: '🏁' }
];

const STOCK_IMAGES = [
  { name: 'Abstract 1', value: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop', category: 'abstract' },
  { name: 'Abstract 2', value: 'https://images.unsplash.com/photo-1557683304-673a23048d34?w=400&h=300&fit=crop', category: 'abstract' },
  { name: 'Nature 1', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', category: 'nature' },
  { name: 'Nature 2', value: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', category: 'nature' },
  { name: 'Business 1', value: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop', category: 'business' },
  { name: 'Business 2', value: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', category: 'business' },
  { name: 'Technology 1', value: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop', category: 'technology' },
  { name: 'Technology 2', value: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop', category: 'technology' },
  { name: 'Food 1', value: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop', category: 'food' },
  { name: 'Food 2', value: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', category: 'food' },
  { name: 'Travel 1', value: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop', category: 'travel' },
  { name: 'Travel 2', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', category: 'travel' },
  { name: 'People 1', value: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop', category: 'people' },
  { name: 'People 2', value: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop', category: 'people' },
  { name: 'Architecture 1', value: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop', category: 'architecture' },
  { name: 'Architecture 2', value: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=400&h=300&fit=crop', category: 'architecture' }
];

export const StockAssetsLibrary: React.FC<StockAssetsLibraryProps> = ({
  isOpen,
  onClose,
  onSelectAsset
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'symbol' | 'image'>('emoji');
  const [imageCategory, setImageCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredImages = imageCategory === 'all' 
    ? STOCK_IMAGES 
    : STOCK_IMAGES.filter(img => img.category === imageCategory);

  const categories = ['all', ...Array.from(new Set(STOCK_IMAGES.map(img => img.category)))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Stock Assets Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('emoji')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'emoji'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Emojis
          </button>
          <button
            onClick={() => setActiveTab('symbol')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'symbol'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Symbols
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'image'
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Stock Images
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'emoji' && (
            <div className="grid grid-cols-8 gap-2">
              {EMOJIS.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onSelectAsset({ type: 'emoji', value: emoji.value, name: emoji.name })}
                  className="p-3 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title={emoji.name}
                >
                  {emoji.value}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'symbol' && (
            <div className="grid grid-cols-8 gap-2">
              {SYMBOLS.map((symbol, index) => (
                <button
                  key={index}
                  onClick={() => onSelectAsset({ type: 'symbol', value: symbol.value, name: symbol.name })}
                  className="p-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-mono"
                  title={symbol.name}
                >
                  {symbol.value}
                </button>
              ))}
            </div>
          )}

          {activeTab === 'image' && (
            <div>
              {/* Category Filter */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setImageCategory(category)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        imageCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-4 gap-4">
                {filteredImages.map((image, index) => (
                  <div
                    key={index}
                    className="group cursor-pointer"
                    onClick={() => onSelectAsset({ type: 'image', value: image.value, name: image.name })}
                  >
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={image.value}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Click on any asset to add it to your element
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockAssetsLibrary;


