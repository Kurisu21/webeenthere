'use client';

import React, { useState, useEffect } from 'react';
import { 
  getReportHistory, 
  exportReport,
  ReportHistory as ReportHistoryType,
  getReportTypeDisplayName,
  formatPeriod 
} from '@/lib/reportApi';

const ReportHistory: React.FC = () => {
  const [reports, setReports] = useState<ReportHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xml'>('json');
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    loadReportHistory();
  }, []);

  const loadReportHistory = async () => {
    try {
      const history = await getReportHistory(100);
      setReports(history);
    } catch (error) {
      console.error('Error loading report history:', error);
      setError('Failed to load report history');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (report: ReportHistoryType) => {
    setExporting(report.id);
    try {
      await exportReport(report.report, selectedFormat);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    } finally {
      setExporting(null);
    }
  };

  const getTemplateIcon = (template: string) => {
    const icons: Record<string, string> = {
      userActivity: '👥',
      systemHealth: '🏥',
      securityAudit: '🔒',
      performanceMetrics: '⚡',
      websiteAnalytics: '📊'
    };
    return icons[template] || '📋';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Report History</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-4 h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Export Format:</label>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as 'json' | 'csv' | 'xml')}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="xml">XML</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No report history available</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getTemplateIcon(report.report.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getReportTypeDisplayName(report.report.type)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Period: {formatPeriod(report.report.period)}</span>
                      <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
                      <span>Stored: {new Date(report.storedAt).toLocaleString()}</span>
                      {report.email && (
                        <span>Email: {report.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExportReport(report)}
                    disabled={exporting === report.id}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exporting === report.id ? 'Exporting...' : `Export ${selectedFormat.toUpperCase()}`}
                  </button>
                </div>
              </div>

              {/* Report Summary */}
              {report.report.data.summary && (
                <div className="mt-4 bg-gray-50 rounded-md p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(report.report.data.summary).slice(0, 8).map(([key, value]) => (
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
          ))
        )}
      </div>

      {reports.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Showing {reports.length} reports. Use the export buttons to download reports in your preferred format.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;

