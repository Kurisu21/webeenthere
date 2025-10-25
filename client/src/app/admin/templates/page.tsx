'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import AdminSidebar from '../../_components/layout/AdminSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import TemplateManagement from '../../_components/admin/TemplateManagement';
import TemplateCustomization from '../../_components/admin/TemplateCustomization';
import { Template } from '../../../lib/templateApi';

export default function AdminTemplatesPage() {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowCustomization(true);
  };

  const handleCloseCustomization = () => {
    setShowCustomization(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = () => {
    // Template was saved successfully, refresh the management component
    // The TemplateManagement component will handle refreshing its data
    console.log('Template saved successfully');
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <MainContentWrapper>
          <TemplateManagement onEditTemplate={handleEditTemplate} />
        </MainContentWrapper>
      </div>

      {/* Template Customization Modal */}
      {showCustomization && editingTemplate && (
        <TemplateCustomization
          templateId={editingTemplate.id}
          onClose={handleCloseCustomization}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
}

