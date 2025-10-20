'use client';

import React, { useState } from 'react';
import { exportReport, ReportData } from '@/lib/reportApi';

interface ReportExporterProps {
  report: ReportData;
  onExport?: (format: string) => void;
}

const ReportExporter: React.FC<ReportExporterProps> = ({ report, onExport }) => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formats = [
    { key: 'json', label: 'JSON', description: 'Structured data format', icon: '📄' },
    { key: 'csv', label: 'CSV', description: 'Spreadsheet format', icon: '📊' },
    { key: 'xml', label: 'XML', description: 'Markup format', icon: '📋' }
  ];

  const handleExport = async (format: string) => {
    setExporting(format);
    setError(null);

    try {
      await exportReport(report, format as 'json' | 'csv' | 'xml');
      onExport?.(format);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError(`Failed to export as ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  const getFileSizeEstimate = (format: string) => {
    const dataSize = JSON.stringify(report).length;
    const estimates: Record<string, number> = {
      json: dataSize,
      csv: Math.round(dataSize * 0.8),
      xml: Math.round(dataSize * 1.2)
    };
    return estimates[format] || dataSize;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Report</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {formats.map((format) => (
          <div
            key={format.key}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{format.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{format.label}</h3>
                <p className="text-sm text-gray-600">{format.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-500">
                Estimated size: {formatFileSize(getFileSizeEstimate(format.key))}
              </div>
              <div className="text-xs text-gray-500">
                Report type: {report.type}
              </div>
              <div className="text-xs text-gray-500">
                Period: {report.period}
              </div>
            </div>

            <button
              onClick={() => handleExport(format.key)}
              disabled={exporting === format.key}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting === format.key ? 'Exporting...' : `Export ${format.label}`}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Export Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• <strong>JSON:</strong> Best for data analysis and integration with other systems</p>
          <p>• <strong>CSV:</strong> Ideal for spreadsheet applications and data analysis</p>
          <p>• <strong>XML:</strong> Suitable for structured data exchange and legacy systems</p>
          <p>• All exports include report metadata and summary information</p>
          <p>• Files are automatically downloaded to your default download folder</p>
        </div>
      </div>
    </div>
  );
};

export default ReportExporter;

