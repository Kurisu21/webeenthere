'use client';

import React, { useState, useEffect } from 'react';
import type { Editor } from 'grapesjs';
import { SegmentedControl } from './properties/SegmentedControl';
import { InputWithClear } from './properties/InputWithClear';
import { SectionHeader } from './properties/SectionHeader';

interface GlobalResponsiveSettingsProps {
  editor: Editor | null;
  isDark?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalResponsiveSettings: React.FC<GlobalResponsiveSettingsProps> = ({
  editor,
  isDark = true,
  isOpen,
  onClose,
}) => {
  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(false);
  const [globalMaxWidth, setGlobalMaxWidth] = useState('1200px');
  const [mobilePadding, setMobilePadding] = useState('1rem');
  const [tabletPadding, setTabletPadding] = useState('2rem');
  const [desktopPadding, setDesktopPadding] = useState('3rem');
  const [applyToAllSections, setApplyToAllSections] = useState(false);

  // Load current settings from editor
  useEffect(() => {
    if (!editor || !isOpen) return;

    try {
      const canvas = editor.Canvas;
      const frame = canvas?.getFrameEl?.();
      if (frame && frame.contentDocument) {
        const frameDoc = frame.contentDocument;
        const body = frameDoc.body;
        const html = frameDoc.documentElement;

        // Check if auto-adjust is enabled
        const hasAutoAdjust = body.classList.contains('auto-adjust-page') || 
                             html.classList.contains('auto-adjust-page');
        setAutoAdjustEnabled(hasAutoAdjust);

        // Get global max-width from body or html
        const bodyMaxWidth = window.getComputedStyle(body).maxWidth;
        const htmlMaxWidth = window.getComputedStyle(html).maxWidth;
        if (bodyMaxWidth && bodyMaxWidth !== 'none') {
          setGlobalMaxWidth(bodyMaxWidth);
        } else if (htmlMaxWidth && htmlMaxWidth !== 'none') {
          setGlobalMaxWidth(htmlMaxWidth);
        }
      }
    } catch (error) {
      console.warn('Could not load global responsive settings:', error);
    }
  }, [editor, isOpen]);

  // Apply global responsive settings
  const applyGlobalSettings = () => {
    if (!editor) return;

    try {
      const canvas = editor.Canvas;
      const frame = canvas?.getFrameEl?.();
      if (frame && frame.contentDocument) {
        const frameDoc = frame.contentDocument;
        const body = frameDoc.body;
        const html = frameDoc.documentElement;
        const head = frameDoc.head;

        // Remove existing global responsive style
        const existingStyle = frameDoc.getElementById('global-responsive-styles');
        if (existingStyle) {
          existingStyle.remove();
        }

        // Create new style tag
        const styleTag = frameDoc.createElement('style');
        styleTag.id = 'global-responsive-styles';
        
        let css = '';

        if (autoAdjustEnabled) {
          // Add auto-adjust classes
          body.classList.add('auto-adjust-page');
          html.classList.add('auto-adjust-page');

          // Generate responsive CSS
          css += `
            body.auto-adjust-page,
            html.auto-adjust-page {
              overflow-x: hidden;
            }
            
            body.auto-adjust-page > *,
            html.auto-adjust-page > * {
              max-width: 100vw;
            }
          `;
        } else {
          body.classList.remove('auto-adjust-page');
          html.classList.remove('auto-adjust-page');
        }

        // Apply global max-width
        if (globalMaxWidth) {
          css += `
            body.auto-adjust-page {
              max-width: ${globalMaxWidth};
              margin-left: auto;
              margin-right: auto;
            }
          `;
        }

        // Apply responsive padding to body
        css += `
          body.auto-adjust-page {
            padding-left: ${mobilePadding};
            padding-right: ${mobilePadding};
          }
          
          @media (min-width: 640px) {
            body.auto-adjust-page {
              padding-left: ${tabletPadding};
              padding-right: ${tabletPadding};
            }
          }
          
          @media (min-width: 1024px) {
            body.auto-adjust-page {
              padding-left: ${desktopPadding};
              padding-right: ${desktopPadding};
            }
          }
        `;

        // Apply to all sections if enabled
        if (applyToAllSections) {
          css += `
            section:not([class*="auto-padding"]):not([class*="safe-edge"]) {
              padding-left: max(${mobilePadding}, env(safe-area-inset-left));
              padding-right: max(${mobilePadding}, env(safe-area-inset-right));
            }
            
            @media (min-width: 640px) {
              section:not([class*="auto-padding"]):not([class*="safe-edge"]) {
                padding-left: max(${tabletPadding}, env(safe-area-inset-left));
                padding-right: max(${tabletPadding}, env(safe-area-inset-right));
              }
            }
            
            @media (min-width: 1024px) {
              section:not([class*="auto-padding"]):not([class*="safe-edge"]) {
                padding-left: max(${desktopPadding}, env(safe-area-inset-left));
                padding-right: max(${desktopPadding}, env(safe-area-inset-right));
              }
            }
          `;
        }

        styleTag.textContent = css;
        head.appendChild(styleTag);

        // Trigger update
        editor.trigger('update');
        editor.trigger('canvas:update');
      }
    } catch (error) {
      console.error('Error applying global responsive settings:', error);
    }
  };

  // Apply settings when they change
  useEffect(() => {
    if (isOpen && editor) {
      const timeoutId = setTimeout(() => {
        applyGlobalSettings();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAdjustEnabled, globalMaxWidth, mobilePadding, tabletPadding, desktopPadding, applyToAllSections, isOpen]);

  if (!isOpen) return null;

  const bgPrimary = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (action) {
      action();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div 
        className={`${bgPrimary} ${borderColor} border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={handleModalClick}
        onKeyDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        {/* Header */}
        <div className={`${bgSecondary} ${borderColor} border-b px-6 py-4 flex items-center justify-between`}>
          <div>
            <h2 className={`${textPrimary} text-xl font-bold`}>Global Responsive Settings</h2>
            <p className={`${textSecondary} text-sm mt-1`}>Configure responsive behavior for the entire page</p>
          </div>
          <button
            type="button"
            onClick={(e) => handleButtonClick(e, onClose)}
            className={`${textSecondary} ${isDark ? 'hover:text-white hover:bg-gray-700' : 'hover:text-gray-900 hover:bg-gray-200'} transition-colors p-2 rounded-lg`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Auto-Adjust Toggle */}
          <div className="space-y-3">
            <SectionHeader
              title="Page-Level Auto-Adjust"
              isExpanded={true}
              onToggle={() => {}}
              isDark={isDark}
            />
            <div className="pl-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`${textPrimary} font-medium block mb-1`}>Enable Auto-Adjust</label>
                  <p className={`${textSecondary} text-xs`}>Automatically adjust padding for all screen sizes</p>
                </div>
                <SegmentedControl
                  options={[
                    { value: 'enabled', label: 'On' },
                    { value: 'disabled', label: 'Off' },
                  ]}
                  value={autoAdjustEnabled ? 'enabled' : 'disabled'}
                  onChange={(value) => setAutoAdjustEnabled(value === 'enabled')}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>

          {/* Global Max-Width */}
          <div className="space-y-3">
            <SectionHeader
              title="Page Container"
              isExpanded={true}
              onToggle={() => {}}
              isDark={isDark}
            />
            <div className="pl-4 space-y-3">
              <div>
                <label className={`${textPrimary} font-medium block mb-2`}>Max Width</label>
                <div className="flex gap-2">
                  <InputWithClear
                    value={globalMaxWidth}
                    onChange={(value) => setGlobalMaxWidth(value || '1200px')}
                    placeholder="1200px"
                    isDark={isDark}
                  />
                  <select
                    value={(() => {
                      if (globalMaxWidth.includes('%')) return '%';
                      if (globalMaxWidth.includes('rem')) return 'rem';
                      if (globalMaxWidth.includes('vw')) return 'vw';
                      return 'px';
                    })()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      const num = globalMaxWidth.replace(/[^0-9.]/g, '');
                      setGlobalMaxWidth(`${num}${e.target.value}`);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`px-3 py-2 ${bgSecondary} ${borderColor} border rounded-md ${textPrimary} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  >
                    <option value="px">px</option>
                    <option value="%">%</option>
                    <option value="rem">rem</option>
                    <option value="vw">vw</option>
                  </select>
                </div>
                <p className={`${textSecondary} text-xs mt-1`}>Maximum width for the entire page content</p>
              </div>
            </div>
          </div>

          {/* Responsive Padding */}
          <div className="space-y-3">
            <SectionHeader
              title="Responsive Padding"
              isExpanded={true}
              onToggle={() => {}}
              isDark={isDark}
            />
            <div className="pl-4 space-y-4">
              <div>
                <label className={`${textPrimary} font-medium block mb-2`}>Mobile Padding (&lt;640px)</label>
                <div className="flex gap-2">
                  <InputWithClear
                    value={mobilePadding}
                    onChange={(value) => setMobilePadding(value || '1rem')}
                    placeholder="1rem"
                    isDark={isDark}
                  />
                  <select
                    value={(() => {
                      if (mobilePadding.includes('rem')) return 'rem';
                      if (mobilePadding.includes('%')) return '%';
                      return 'px';
                    })()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      const num = mobilePadding.replace(/[^0-9.]/g, '');
                      setMobilePadding(`${num}${e.target.value}`);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`px-3 py-2 ${bgSecondary} ${borderColor} border rounded-md ${textPrimary} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`${textPrimary} font-medium block mb-2`}>Tablet Padding (640px - 1024px)</label>
                <div className="flex gap-2">
                  <InputWithClear
                    value={tabletPadding}
                    onChange={(value) => setTabletPadding(value || '2rem')}
                    placeholder="2rem"
                    isDark={isDark}
                  />
                  <select
                    value={(() => {
                      if (tabletPadding.includes('rem')) return 'rem';
                      if (tabletPadding.includes('%')) return '%';
                      return 'px';
                    })()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      const num = tabletPadding.replace(/[^0-9.]/g, '');
                      setTabletPadding(`${num}${e.target.value}`);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`px-3 py-2 ${bgSecondary} ${borderColor} border rounded-md ${textPrimary} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`${textPrimary} font-medium block mb-2`}>Desktop Padding (&gt;1024px)</label>
                <div className="flex gap-2">
                  <InputWithClear
                    value={desktopPadding}
                    onChange={(value) => setDesktopPadding(value || '3rem')}
                    placeholder="3rem"
                    isDark={isDark}
                  />
                  <select
                    value={(() => {
                      if (desktopPadding.includes('rem')) return 'rem';
                      if (desktopPadding.includes('%')) return '%';
                      return 'px';
                    })()}
                    onChange={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      const num = desktopPadding.replace(/[^0-9.]/g, '');
                      setDesktopPadding(`${num}${e.target.value}`);
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`px-3 py-2 ${bgSecondary} ${borderColor} border rounded-md ${textPrimary} text-sm focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-300'}`}
                  >
                    <option value="px">px</option>
                    <option value="rem">rem</option>
                    <option value="%">%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Apply to All Sections */}
          <div className="space-y-3">
            <SectionHeader
              title="Section Settings"
              isExpanded={true}
              onToggle={() => {}}
              isDark={isDark}
            />
            <div className="pl-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className={`${textPrimary} font-medium block mb-1`}>Apply to All Sections</label>
                  <p className={`${textSecondary} text-xs`}>Automatically apply responsive padding to all sections</p>
                </div>
                <SegmentedControl
                  options={[
                    { value: 'enabled', label: 'On' },
                    { value: 'disabled', label: 'Off' },
                  ]}
                  value={applyToAllSections ? 'enabled' : 'disabled'}
                  onChange={(value) => setApplyToAllSections(value === 'enabled')}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${bgSecondary} ${borderColor} border-t px-6 py-4 flex justify-end gap-3`}>
          <button
            type="button"
            onClick={(e) => handleButtonClick(e, onClose)}
            className={`px-4 py-2 ${textPrimary} ${borderColor} border rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
          >
            Close
          </button>
          <button
            type="button"
            onClick={(e) => handleButtonClick(e, () => {
              applyGlobalSettings();
              onClose();
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};

