"use client";
import React from 'react';
import { supabase } from '@/lib/supabaseClient';

export function HomeBanners() {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.rpc('hub_list_banners');
      setItems(data || []);
    })();
  },[]);

  if (!items.length) return null;

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {items.map((b)=> (
          <a key={b.id} href={b.link_url || '#'} target={b.link_url? '_blank':'_self'} className="block">
            <div className="aspect-video rounded-md overflow-hidden border border-default-100 bg-default-100">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
