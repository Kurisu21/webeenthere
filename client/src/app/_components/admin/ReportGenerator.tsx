'use client';

import React, { useState } from 'react';
import { analyticsApi } from '@/lib/analyticsApi';

interface ReportGeneratorProps {
  onReportGenerated?: (report: any) => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onReportGenerated }) => {
  const [reportType, setReportType] = useState<string>('comprehensive');
  const [period, setPeriod] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Analytics', description: 'Complete overview of all metrics' },
    { value: 'user', label: 'User Analytics', description: 'User growth, retention, and segments' },
    { value: 'website', label: 'Website Analytics', description: 'Website performance and traffic' }
  ];

  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setGeneratedReport(null);

    try {
      // Always fetch JSON to display on page
      const report = await analyticsApi.generateReport(period, reportType, 'json');
      setGeneratedReport(report);
      onReportGenerated?.(report);
    } catch (err: any) {
      console.error('Error generating report:', err);
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'csv') => {
    setLoading(true);
    setError(null);
    try {
      await analyticsApi.generateReport(period, reportType, format);
    } catch (err: any) {
      console.error('Error downloading report:', err);
      setError(err.message || `Failed to download ${format.toUpperCase()} report`);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-surface-elevated rounded-lg border border-app p-6">
        <h2 className="text-2xl font-bold text-primary mb-6">Generate Analytics Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-primary mb-3">
                Report Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {reportTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setReportType(type.value);
                      setGeneratedReport(null);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      reportType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-app hover:border-primary/30'
                    }`}
                  >
                    <div className="font-semibold text-primary mb-1">{type.label}</div>
                    <div className="text-sm text-secondary">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Time Period
              </label>
              <div className="grid grid-cols-2 gap-2">
                {periods.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setPeriod(p.value);
                      setGeneratedReport(null);
                    }}
                    className={`px-4 py-2 rounded-md border transition-all ${
                      period === p.value
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-app text-secondary hover:border-primary/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-3 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
              >
                {loading ? 'Generating...' : '📊 Generate Report'}
              </button>
              
              {generatedReport && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    📄 Download PDF
                  </button>
                  <button
                    onClick={() => handleDownload('csv')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    📊 Download CSV
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-md p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-app p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Report Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Report Type:</span>
                  <span className="text-primary font-semibold">
                    {reportTypes.find(t => t.value === reportType)?.label || reportType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Period:</span>
                  <span className="text-primary font-semibold capitalize">{period}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-app">
                  <span className="text-secondary">Format:</span>
                  <span className="text-primary font-semibold">Display + Download</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-surface-elevated rounded-lg border border-app">
                <h4 className="text-sm font-semibold text-primary mb-2">What's Included:</h4>
                <ul className="text-xs text-secondary space-y-1">
                  {reportType === 'comprehensive' && (
                    <>
                      <li>• User metrics and growth</li>
                      <li>• Website performance data</li>
                      <li>• Top performing websites</li>
                      <li>• Conversion rates and engagement</li>
                    </>
                  )}
                  {reportType === 'user' && (
                    <>
                      <li>• User growth statistics</li>
                      <li>• Retention rates</li>
                      <li>• User segments (power users, new users, etc.)</li>
                      <li>• Activity metrics</li>
                      <li>• Evidence and data sources</li>
                    </>
                  )}
                  {reportType === 'website' && (
                    <>
                      <li>• Page views and unique visitors</li>
                      <li>• Traffic sources</li>
                      <li>• Performance metrics (bounce rate, return rate)</li>
                      <li>• Conversion rates</li>
                      <li>• Top performing websites with owner details</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Display */}
      {generatedReport && (
        <div className="bg-surface-elevated rounded-lg border border-app p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Report Results</h2>
            <div className="text-sm text-secondary">
              Generated: {formatDate(generatedReport.generatedAt)}
            </div>
          </div>

          {/* Comprehensive Report */}
          {reportType === 'comprehensive' && generatedReport.userMetrics && (
            <div className="space-y-6">
              {/* User Metrics */}
              <div className="bg-surface rounded-lg border border-app p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">User Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Total Users</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.totalUsers)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">New Users This Month</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.newUsersThisMonth)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Active Users (30 days)</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.activeUsers)}</div>
                  </div>
                </div>
              </div>

              {/* Website Metrics */}
              {generatedReport.websiteMetrics && (
                <div className="bg-surface rounded-lg border border-app p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Website Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-surface-elevated rounded-lg">
                      <div className="text-sm text-secondary mb-1">Total Websites</div>
                      <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.totalWebsites)}</div>
                    </div>
                    <div className="p-4 bg-surface-elevated rounded-lg">
                      <div className="text-sm text-secondary mb-1">Published Websites</div>
                      <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.publishedWebsites)}</div>
                    </div>
                    <div className="p-4 bg-surface-elevated rounded-lg">
                      <div className="text-sm text-secondary mb-1">New Websites This Month</div>
                      <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.newWebsitesThisMonth)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Breakdown */}
              {generatedReport.activityBreakdown && generatedReport.activityBreakdown.length > 0 && (
                <div className="bg-surface rounded-lg border border-app p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Activity Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-app">
                          <th className="text-left py-2 px-4 text-secondary">Action</th>
                          <th className="text-right py-2 px-4 text-secondary">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.activityBreakdown.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-app/50">
                            <td className="py-2 px-4 text-primary">{item.action || 'N/A'}</td>
                            <td className="py-2 px-4 text-right text-primary font-semibold">{formatNumber(item.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* User Activity */}
              {generatedReport.userActivity && generatedReport.userActivity.length > 0 && (
                <div className="bg-surface rounded-lg border border-app p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Top Active Users</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-app">
                          <th className="text-left py-2 px-4 text-secondary">Username</th>
                          <th className="text-left py-2 px-4 text-secondary">Email</th>
                          <th className="text-right py-2 px-4 text-secondary">Activity Count</th>
                          <th className="text-right py-2 px-4 text-secondary">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.userActivity.slice(0, 10).map((user: any, idx: number) => (
                          <tr key={idx} className="border-b border-app/50">
                            <td className="py-2 px-4 text-primary">{user.username || 'N/A'}</td>
                            <td className="py-2 px-4 text-secondary">{user.email || 'N/A'}</td>
                            <td className="py-2 px-4 text-right text-primary font-semibold">{formatNumber(user.activity_count)}</td>
                            <td className="py-2 px-4 text-right text-secondary">{formatDate(user.last_activity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Report */}
          {reportType === 'user' && generatedReport.userMetrics && (
            <div className="space-y-6">
              <div className="bg-surface rounded-lg border border-app p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">User Growth</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Total Users</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.totalUsers)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">New This Month</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.newUsersThisMonth)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Active Users</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.userMetrics?.activeUsers)}</div>
                  </div>
                </div>
              </div>

              {generatedReport.userActivity && generatedReport.userActivity.length > 0 && (
                <div className="bg-surface rounded-lg border border-app p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">User Activity</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-app">
                          <th className="text-left py-2 px-4 text-secondary">Username</th>
                          <th className="text-left py-2 px-4 text-secondary">Email</th>
                          <th className="text-right py-2 px-4 text-secondary">Activity Count</th>
                          <th className="text-right py-2 px-4 text-secondary">Last Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedReport.userActivity.map((user: any, idx: number) => (
                          <tr key={idx} className="border-b border-app/50">
                            <td className="py-2 px-4 text-primary">{user.username || 'N/A'}</td>
                            <td className="py-2 px-4 text-secondary">{user.email || 'N/A'}</td>
                            <td className="py-2 px-4 text-right text-primary font-semibold">{formatNumber(user.activity_count)}</td>
                            <td className="py-2 px-4 text-right text-secondary">{formatDate(user.last_activity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Website Report */}
          {reportType === 'website' && generatedReport.websiteMetrics && (
            <div className="space-y-6">
              <div className="bg-surface rounded-lg border border-app p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">Website Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Total Websites</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.totalWebsites)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">Published</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.publishedWebsites)}</div>
                  </div>
                  <div className="p-4 bg-surface-elevated rounded-lg">
                    <div className="text-sm text-secondary mb-1">New This Month</div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(generatedReport.websiteMetrics?.newWebsitesThisMonth)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON View (Collapsible) */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-secondary hover:text-primary font-medium">
              View Raw JSON Data
            </summary>
            <pre className="mt-4 p-4 bg-surface rounded-lg border border-app overflow-x-auto text-xs">
              {JSON.stringify(generatedReport, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
