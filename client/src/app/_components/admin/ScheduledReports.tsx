'use client';

import React, { useState, useEffect } from 'react';
import { 
  getScheduledReports, 
  cancelScheduledReport, 
  scheduleReport,
  ScheduledReport,
  formatSchedule,
  getReportTypeDisplayName 
} from '@/lib/reportApi';

const ScheduledReports: React.FC = () => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    template: '',
    schedule: 'daily',
    email: ''
  });

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = async () => {
    try {
      const reports = await getScheduledReports();
      setScheduledReports(reports);
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
      setError('Failed to load scheduled reports');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReport = async (reportId: string) => {
    try {
      await cancelScheduledReport(reportId);
      await loadScheduledReports();
    } catch (error) {
      console.error('Error cancelling report:', error);
      setError('Failed to cancel scheduled report');
    }
  };

  const handleScheduleNewReport = async () => {
    if (!newSchedule.template) {
      setError('Please select a template');
      return;
    }

    try {
      await scheduleReport(
        newSchedule.template,
        newSchedule.schedule,
        newSchedule.email || undefined
      );
      setNewSchedule({ template: '', schedule: 'daily', email: '' });
      setShowScheduleForm(false);
      await loadScheduledReports();
    } catch (error) {
      console.error('Error scheduling report:', error);
      setError('Failed to schedule report');
    }
  };

  const getScheduleIcon = (schedule: string) => {
    const icons: Record<string, string> = {
      'hourly': '🕐',
      'daily': '📅',
      'weekly': '📆',
      'monthly': '🗓️'
    };
    return icons[schedule] || '⏰';
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Scheduled Reports</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
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
        <h2 className="text-2xl font-bold text-gray-900">Scheduled Reports</h2>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {showScheduleForm ? 'Cancel' : 'Schedule New Report'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Schedule New Report Form */}
      {showScheduleForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={newSchedule.template}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, template: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select template</option>
                <option value="userActivity">User Activity</option>
                <option value="systemHealth">System Health</option>
                <option value="securityAudit">Security Audit</option>
                <option value="performanceMetrics">Performance Metrics</option>
                <option value="websiteAnalytics">Website Analytics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule
              </label>
              <select
                value={newSchedule.schedule}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, schedule: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={newSchedule.email}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowScheduleForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleScheduleNewReport}
              disabled={!newSchedule.template}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Report
            </button>
          </div>
        </div>
      )}

      {/* Scheduled Reports List */}
      <div className="space-y-4">
        {scheduledReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No scheduled reports</p>
          </div>
        ) : (
          scheduledReports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getTemplateIcon(report.template)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getReportTypeDisplayName(report.template)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <span className="mr-1">{getScheduleIcon(report.schedule)}</span>
                        {formatSchedule(report.schedule)}
                      </span>
                      <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.email && (
                        <span>Email: {report.email}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCancelReport(report.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduledReports;

