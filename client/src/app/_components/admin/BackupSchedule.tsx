'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleConfig } from '../../../lib/backupApi';

interface BackupScheduleProps {
  schedule: ScheduleConfig;
  onUpdate: (schedule: ScheduleConfig) => void;
  className?: string;
}

const BackupSchedule: React.FC<BackupScheduleProps> = ({
  schedule,
  onUpdate,
  className = ''
}) => {
  const [formData, setFormData] = useState<ScheduleConfig>(schedule);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(schedule);
    setHasChanges(false);
  }, [schedule]);

  const handleInputChange = (field: keyof ScheduleConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onUpdate(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(schedule);
    setHasChanges(false);
  };

  const getFrequencyDescription = () => {
    if (!formData.enabled) return 'Automated backups are disabled';
    
    const time = formData.time;
    const frequency = formData.frequency;
    
    switch (frequency) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[formData.dayOfWeek || 0]} at ${time}`;
      case 'monthly':
        return `Monthly on day ${formData.dayOfMonth || 1} at ${time}`;
      default:
        return 'Invalid schedule';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Automated Backup Schedule</h2>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${formData.enabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className={`text-sm font-medium ${formData.enabled ? 'text-green-400' : 'text-gray-400'}`}>
            {formData.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Current Schedule Display */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Current Schedule</h3>
        <p className="text-white font-medium">{getFrequencyDescription()}</p>
        <div className="mt-2 text-sm text-gray-400">
          <span>Retention: {formData.retentionDays} days</span>
          {formData.autoDelete && <span className="ml-4">• Auto-delete enabled</span>}
        </div>
      </div>

      {/* Schedule Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">
            Enable Automated Backups
          </label>
          <button
            type="button"
            onClick={() => handleInputChange('enabled', !formData.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              formData.enabled ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {formData.enabled && (
          <>
            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Day of Week (for weekly) */}
            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek || 0}
                  onChange={(e) => handleInputChange('dayOfWeek', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>
            )}

            {/* Day of Month (for monthly) */}
            {formData.frequency === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Day of Month
                </label>
                <select
                  value={formData.dayOfMonth || 1}
                  onChange={(e) => handleInputChange('dayOfMonth', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {[...Array(28)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Retention Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Retention Policy (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.retentionDays}
                onChange={(e) => handleInputChange('retentionDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">
                Backups older than this will be automatically deleted
              </p>
            </div>

            {/* Auto Delete Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Auto-delete Old Backups
                </label>
                <p className="text-xs text-gray-400">
                  Automatically delete backups older than retention period
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleInputChange('autoDelete', !formData.autoDelete)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  formData.autoDelete ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.autoDelete ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-400 disabled:to-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
            >
              {isSaving ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BackupSchedule;
