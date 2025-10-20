'use client';

import React, { useState, useEffect } from 'react';
import { 
  generateReport, 
  getReportTemplates, 
  ReportTemplate, 
  ReportData,
  formatPeriod,
  getReportTypeDisplayName 
} from '@/lib/reportApi';

interface ReportGeneratorProps {
  onReportGenerated?: (report: ReportData) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [templates, setTemplates] = useState<Record<string, ReportTemplate>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [period, setPeriod] = useState<string>('30d');
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templatesData = await getReportTemplates();
      setTemplates(templatesData);
      if (Object.keys(templatesData).length > 0) {
        setSelectedTemplate(Object.keys(templatesData)[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('Failed to load report templates');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      setError('Please select a report template');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const report = await generateReport(selectedTemplate, period, filters);
      setGeneratedReport(report);
      onReportGenerated?.(report);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    setGeneratedReport(null);
    setError(null);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setGeneratedReport(null);
    setError(null);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setGeneratedReport(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Report</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a template</option>
              {Object.entries(templates).map(([key, template]) => (
                <option key={key} value={key}>
                  {template.name}
                </option>
              ))}
            </select>
            {selectedTemplate && templates[selectedTemplate] && (
              <p className="mt-1 text-sm text-gray-500">
                {templates[selectedTemplate].description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          {/* Additional filters based on template */}
          {selectedTemplate === 'userActivity' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID (optional)
              </label>
              <input
                type="text"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Enter user ID for specific user report"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <button
            onClick={handleGenerateReport}
            disabled={loading || !selectedTemplate}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Preview */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {generatedReport && (
            <div className="bg-gray-50 rounded-md p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Report Preview
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">
                    {getReportTypeDisplayName(generatedReport.type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">
                    {formatPeriod(generatedReport.period)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated:</span>
                  <span className="font-medium">
                    {new Date(generatedReport.generatedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {generatedReport.data.summary && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(generatedReport.data.summary).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;

