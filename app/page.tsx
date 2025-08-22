"use client";

import React from 'react';
import { ModernHeader } from '@/components/modern-header';
import { ModernSidebar } from '@/components/modern-sidebar';
import { ModernAppGrid } from '@/components/modern-app-grid';

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <ModernHeader />
      
      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-80 h-full overflow-hidden">
          <ModernSidebar />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {/* Apps Grid */}
            <ModernAppGrid />
          </div>
        </main>
      </div>
    </div>
  );
}