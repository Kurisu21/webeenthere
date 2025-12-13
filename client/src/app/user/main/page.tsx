'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../_components/layout/DashboardHeader';
import DashboardSidebar from '../../_components/layout/DashboardSidebar';
import MainContent from '../../_components/layout/MainContent';
import MainContentWrapper from '../../_components/layout/MainContentWrapper';
import InstructionOverlay from '../../_components/ui/InstructionOverlay';

export default function UserMainPage() {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleShowInstructions = () => {
    console.log('📢 handleShowInstructions called - setting state to true');
    setShowInstructions(true);
  };

  const handleCloseInstructions = () => {
    console.log('📢 handleCloseInstructions called - setting state to false');
    setShowInstructions(false);
  };

  console.log('🔄 UserMainPage render - showInstructions:', showInstructions);

  return (
    <div className="min-h-screen bg-surface">
      <DashboardHeader />
      <div className="flex flex-col md:flex-row">
        <DashboardSidebar />
        <MainContentWrapper>
          <MainContent onShowInstructions={handleShowInstructions} />
        </MainContentWrapper>
      </div>
      <InstructionOverlay 
        isOpen={showInstructions} 
        onClose={handleCloseInstructions} 
      />
    </div>
  );
}
