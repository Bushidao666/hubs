"use client";

import React from 'react';
import { ModernHeader } from '@/components/modern-header';
import { ModernSidebar } from '@/components/modern-sidebar';
import { ModernAppGrid } from '@/components/modern-app-grid';
import { NoticeBanner } from '@/components/notice-banner';
import { BugFab } from '@/components/bug-fab';
import { supabase } from '@/lib/supabaseClient';
import { HomeBanners } from '@/components/home-banners';

export default function Dashboard() {
  const [apps, setApps] = React.useState<{slug:string; name:string}[]>([]);

  React.useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.rpc('hub_apps_catalog');
      const list = (data||[]).map((a:any)=> ({ slug: a.slug || a.id, name: a.name || a.id }));
      setApps(list);
    })();
  },[]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <NoticeBanner />
      {/* Header */}
      <ModernHeader />

      <HomeBanners />
      
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

      <BugFab apps={apps} />
    </div>
  );
}