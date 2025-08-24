"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';

export function NoticeBanner() {
  const [notices, setNotices] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc('hub_get_current_notices');
      setNotices(data || []);
    })();
  }, []);

  if (!notices?.length) return null;

  const top = notices[0];
  const color = top.level === 'critical' ? 'bg-danger text-danger-foreground' : top.level === 'warning' ? 'bg-warning text-warning-foreground' : 'bg-primary text-primary-foreground';

  return (
    <div className={`${color} text-sm px-4 py-2 border-b border-default-100`}> 
      <strong className="mr-2">{top.title}</strong>
      <span className="opacity-90">{top.message}</span>
    </div>
  );
}
