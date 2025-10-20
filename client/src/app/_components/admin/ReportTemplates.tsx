'use client';

import React, { useState, useEffect } from 'react';
import { getReportTemplates, ReportTemplate } from '@/lib/reportApi';

interface ReportTemplatesProps {
  onTemplateSelect?: (templateKey: string, template: ReportTemplate) => void;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState<Record<string, ReportTemplate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await getReportTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load report templates');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIcon = (templateKey: string) => {
    const icons: Record<string, string> = {
      userActivity: '👥',
      systemHealth: '🏥',
      securityAudit: '🔒',
      performanceMetrics: '⚡',
      websiteAnalytics: '📊'
    };
    return icons[templateKey] || '📋';
  };

  const getTemplateColor = (templateKey: string) => {
    const colors: Record<string, string> = {
      userActivity: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      systemHealth: 'bg-green-50 border-green-200 hover:bg-green-100',
      securityAudit: 'bg-red-50 border-red-200 hover:bg-red-100',
      performanceMetrics: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      websiteAnalytics: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    };
    return colors[templateKey] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-4 h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Templates</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, template]) => (
          <div
            key={key}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${getTemplateColor(key)}`}
            onClick={() => onTemplateSelect?.(key, template)}
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{getTemplateIcon(key)}</span>
              <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
            
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700">Includes:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {template.fields.slice(0, 3).map((field, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
                {template.fields.length > 3 && (
                  <li className="text-gray-500">
                    +{template.fields.length - 3} more fields
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(templates).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No report templates available</p>
        </div>
      )}
    </div>
  );
};

export default ReportTemplates;

