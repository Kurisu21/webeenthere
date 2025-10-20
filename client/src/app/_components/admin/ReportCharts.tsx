'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ReportData } from '@/lib/reportApi';

interface ReportChartsProps {
  report: ReportData;
}

const ReportCharts: React.FC<ReportChartsProps> = ({ report }) => {
  const getChartColor = (index: number) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
      '#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#0000ff'
    ];
    return colors[index % colors.length];
  };

  const renderUserActivityCharts = () => {
    const { registrations, activeUsers, loginAttempts, topUsers } = report.data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registrations */}
        {registrations && registrations.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">User Registrations</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={registrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Active Users */}
        {activeUsers && activeUsers.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Active Users</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Login Attempts */}
        {loginAttempts && loginAttempts.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Login Attempts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginAttempts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" fill="#82ca9d" name="Successful" />
                <Bar dataKey="failed" fill="#ff7300" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Users */}
        {topUsers && topUsers.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Top Users by Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topUsers.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="username" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="activity_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSystemHealthCharts = () => {
    const { errorRates, responseTimes, resourceUsage } = report.data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rates */}
        {errorRates && errorRates.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Error Rates</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={errorRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="errors" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Response Times */}
        {responseTimes && responseTimes.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">API Response Times</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimes.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_response_time_ms" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Resource Usage */}
        {resourceUsage && resourceUsage.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg_cpu" stroke="#8884d8" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="avg_memory" stroke="#82ca9d" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="avg_disk" stroke="#ff7300" strokeWidth={2} name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSecurityCharts = () => {
    const { loginAttempts, threats, auditLogs } = report.data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Attempts */}
        {loginAttempts && loginAttempts.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Login Attempts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loginAttempts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="successful" fill="#82ca9d" name="Successful" />
                <Bar dataKey="failed" fill="#ff7300" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Security Threats */}
        {threats && threats.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Security Threats by IP</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={threats.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ip_address" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attempts" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Audit Logs */}
        {auditLogs && auditLogs.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Audit Events</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={auditLogs}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {auditLogs.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceCharts = () => {
    const { apiPerformance, resourceUsage } = report.data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        {apiPerformance && apiPerformance.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">API Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apiPerformance.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_response_time_ms" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Resource Usage */}
        {resourceUsage && resourceUsage.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">System Resources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={resourceUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avg_cpu" stroke="#8884d8" strokeWidth={2} name="CPU %" />
                <Line type="monotone" dataKey="avg_memory" stroke="#82ca9d" strokeWidth={2} name="Memory %" />
                <Line type="monotone" dataKey="avg_disk" stroke="#ff7300" strokeWidth={2} name="Disk %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderWebsiteCharts = () => {
    const { websiteCreation, popularWebsites, userJourneys } = report.data;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Creation */}
        {websiteCreation && websiteCreation.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Website Creation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={websiteCreation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Popular Websites */}
        {popularWebsites && popularWebsites.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Most Active Websites</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularWebsites.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activity_count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* User Journeys */}
        {userJourneys && userJourneys.length > 0 && (
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">User Website Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userJourneys.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="username" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="websites_accessed" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderCharts = () => {
    switch (report.type) {
      case 'userActivity':
        return renderUserActivityCharts();
      case 'systemHealth':
        return renderSystemHealthCharts();
      case 'securityAudit':
        return renderSecurityCharts();
      case 'performanceMetrics':
        return renderPerformanceCharts();
      case 'websiteAnalytics':
        return renderWebsiteCharts();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">No charts available for this report type</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Report Visualizations</h2>
      {renderCharts()}
    </div>
  );
};

export default ReportCharts;

