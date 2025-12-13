'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import TemplateSelector from '../../_components/builder-legacy/TemplateSelector';
import { Template } from '../../../lib/templateApi';
import { useAuth } from '../../_components/auth/AuthContext';
import { API_ENDPOINTS, apiPost, apiGet } from '../../../lib/apiConfig';

export default function TemplatesBrowsePage() {
  const router = useRouter();
  const { token: authToken, isAuthenticated } = useAuth();
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number; canCreate: boolean } | null>(null);

  // Fetch subscription usage
  React.useEffect(() => {
    let mounted = true;
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;
        const data = await apiGet(API_ENDPOINTS.SUBSCRIPTION_USAGE);
        if (mounted && data?.success !== false) {
          setUsage({ used: data.used ?? 0, limit: data.limit ?? 0, canCreate: !!data.canCreate });
        }
      } catch (e) {
        // ignore
      }
    };
    fetchUsage();
    return () => { mounted = false; };
  }, []);

  const ensureCanCreate = () => {
    if (usage && !usage.canCreate) {
      alert(`You have reached your website limit (${usage.used}/${usage.limit}). Please upgrade to create more.`);
      return false;
    }
    return true;
  };

  const handleTemplateSelect = async (template: Template) => {
    if (isCreatingWebsite) {
      console.log('Website creation already in progress, please wait...');
      return;
    }
    
    const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!ensureCanCreate()) return;

    setIsCreatingWebsite(true);
    
    try {
      const websiteData = {
        title: `${template.name} Website`,
        template_id: template.id,
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData, { token });
      
      if (response.success) {
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error: any) {
      console.error('Error creating website:', error);
      alert('Error creating website: ' + (error?.message || 'Please try again.'));
    } finally {
      setIsCreatingWebsite(false);
    }
  };


  const handleBuildFromScratch = async () => {
    if (isCreatingWebsite) {
      console.log('Website creation already in progress, please wait...');
      return;
    }
    
    setIsCreatingWebsite(true);
    
    try {
      const token = authToken || localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token || !isAuthenticated) {
        window.location.href = '/login';
        return;
      }

      if (!ensureCanCreate()) return;

      const websiteData = {
        title: 'My Website',
        template_id: 'blank',
        html_content: '',
        css_content: '',
        is_published: false
      };

      const response = await apiPost(API_ENDPOINTS.WEBSITES, websiteData, { token });
      
      if (response.success) {
        router.push(`/user/build/${response.data.id}`);
      } else {
        throw new Error(response.message || 'Failed to create website');
      }
    } catch (error: any) {
      console.error('Error creating website:', error);
      alert('Error creating website: ' + (error?.message || 'Please try again.'));
    } finally {
      setIsCreatingWebsite(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <div className="p-4 md:p-6 lg:p-8">
            {/* Template Selector */}
            <TemplateSelector 
              onTemplateSelect={handleTemplateSelect}
              onStartFromScratch={handleBuildFromScratch}
              isCreating={isCreatingWebsite}
              canCreate={usage?.canCreate ?? true}
              usageLimit={usage}
            />
          </div>
        </MainContentWrapper>
      </div>
    </div>
  );
}












