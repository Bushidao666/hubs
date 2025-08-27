import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AdminStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  new_users_week: number;
  total_apps: number;
  online_apps: number;
  maintenance_apps: number;
  offline_apps: number;
  total_user_access: number;
  active_subscriptions: number;
  users_by_app: Record<string, number>;
  subscription_distribution: Record<string, number>;
  recent_users: Array<{
    id: string;
    email: string;
    created_at: string;
    last_sign_in: string;
  }>;
  recent_access_grants: Array<{
    user_email: string;
    app_name: string;
    tier: string;
    granted_at: string;
  }>;
}

interface AppMetrics {
  app_info: {
    id: string;
    name: string;
    slug: string;
    status: string;
    enabled: boolean;
    created_at: string;
    updated_at: string;
  };
  total_users: number;
  active_users: number;
  subscription_tiers: Record<string, number>;
  recent_users: Array<{
    email: string;
    tier: string;
    status: string;
    joined_at: string;
  }>;
  daily_active_users: number;
  weekly_active_users: number;
}

interface RealtimeMetrics {
  current_online_users: number;
  requests_last_hour: number;
  requests_today: number;
  hourly_requests: Record<string, number>;
  apps_health: Record<string, {
    status: string;
    enabled: boolean;
    last_activity: string | null;
  }>;
}

interface RailwayMetrics {
  projectId: string;
  projectName: string;
  status: string;
  deployment: {
    id: string;
    createdAt: string;
    url: string;
  };
  metrics: {
    cpu: { usage: number; unit: string };
    memory: { usage: number; limit: number; usagePercent: number; unit: string };
    disk: { usage: number; limit: number; usagePercent: number; unit: string };
    network: { rx: number; tx: number; unit: string };
  };
  services: Array<{ id: string; name: string; icon: string }>;
  environments: Array<{ id: string; name: string; status: string }>;
}

interface ActivityData {
  recent_signups: Array<{
    type: string;
    email: string;
    timestamp: string;
    metadata: { provider: string };
  }>;
  recent_logins: Array<{
    type: string;
    email: string;
    timestamp: string;
    metadata: { ip: string };
  }>;
  recent_sso_tickets: Array<{
    type: string;
    user_email: string;
    app_name: string;
    timestamp: string;
    metadata: { ticket_id: string };
  }>;
  recent_app_changes: Array<{
    type: string;
    app_name: string;
    status: string;
    timestamp: string;
    metadata: { enabled: boolean };
  }>;
}

export function useAdminMetrics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [railwayMetrics, setRailwayMetrics] = useState<Record<string, RailwayMetrics>>({});
  const [appMetrics, setAppMetrics] = useState<Record<string, AppMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    try {
      // Tenta função RPC; se falhar, usa agregação via Auth API exposta em rota local
      const { data, error } = await supabase.rpc('hub_admin_get_stats');
      if (!error && data) {
        setStats(data);
        return;
      }
    } catch {}
    try {
      const resp = await fetch('/api/admin/auth-stats');
      const j = await resp.json();
      if (resp.ok) {
        setStats(prev => ({
          ...(prev || {} as any),
          total_users: j.total_users || 0,
          active_users: j.active_users || 0,
          new_users_today: j.new_users_today || 0,
          new_users_week: j.new_users_week || 0,
          active_subscriptions: j.active_subscriptions || 0,
          total_apps: prev?.total_apps || 0,
          online_apps: prev?.online_apps || 0,
          maintenance_apps: prev?.maintenance_apps || 0,
          offline_apps: prev?.offline_apps || 0,
          total_user_access: prev?.total_user_access || 0,
          users_by_app: prev?.users_by_app || {},
          subscription_distribution: prev?.subscription_distribution || {},
          recent_users: j.recent_users || [],
          recent_access_grants: prev?.recent_access_grants || [],
        } as any));
        // fallback para current_online_users caso realtime não esteja preenchendo
        setRealtimeMetrics(prev => ({
          ...(prev || {} as any),
          current_online_users: prev?.current_online_users || j.online_now || 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching auth stats fallback:', err);
      setError('Failed to fetch admin statistics');
    }
  }, []);

  // Fetch realtime metrics
  const fetchRealtimeMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('hub_admin_realtime_metrics');
      if (error) throw error;
      setRealtimeMetrics(data);
    } catch (err) {
      console.error('Error fetching realtime metrics:', err);
    }
  }, []);

  // Fetch activity data
  const fetchActivity = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('hub_admin_get_activity');
      if (error) throw error;
      setActivity(data);
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  }, []);

  // Fetch app-specific metrics
  const fetchAppMetrics = useCallback(async (appSlug: string) => {
    try {
      const { data, error } = await supabase.rpc('hub_admin_app_metrics', { 
        app_slug: appSlug 
      });
      if (error) throw error;
      setAppMetrics(prev => ({ ...prev, [appSlug]: data }));
      return data;
    } catch (err) {
      console.error(`Error fetching metrics for ${appSlug}:`, err);
      return null;
    }
  }, []);

  // Fetch Railway metrics for a specific app
  const fetchRailwayMetrics = useCallback(async (appSlug: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return null;

      const response = await fetch(`/api/admin/railway-metrics?app=${appSlug}`, {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (result.data) {
        setRailwayMetrics(prev => ({ ...prev, [appSlug]: result.data }));
        return result.data;
      }
      
      return null;
    } catch (err) {
      console.error(`Error fetching Railway metrics for ${appSlug}:`, err);
      return null;
    }
  }, []);

  // Fetch all Railway metrics
  const fetchAllRailwayMetrics = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch('/api/admin/railway-metrics', {
        headers: {
          'Authorization': `Bearer ${session.session.access_token}`
        }
      });
      
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        const metricsMap = result.data.reduce((acc: any, metric: RailwayMetrics) => {
          const slug = metric.projectName.toLowerCase().replace(/\s+/g, '-');
          acc[slug] = metric;
          return acc;
        }, {});
        setRailwayMetrics(metricsMap);
      }
    } catch (err) {
      console.error('Error fetching all Railway metrics:', err);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    await Promise.all([
      fetchStats(),
      fetchRealtimeMetrics(),
      fetchActivity(),
      fetchAllRailwayMetrics()
    ]);
    
    setLoading(false);
  }, [fetchStats, fetchRealtimeMetrics, fetchActivity, fetchAllRailwayMetrics]);

  // Setup realtime subscriptions
  useEffect(() => {
    // Initial fetch
    refreshAll();

    // Setup realtime subscription for live updates
    const channel = supabase
      .channel('admin-metrics')
      .on(
        'postgres_changes',
        { event: '*', schema: 'hub', table: 'user_access' },
        () => {
          fetchStats();
          fetchRealtimeMetrics();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'auth', table: 'users' },
        () => {
          fetchStats();
          fetchActivity();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'hub', table: 'apps' },
        () => {
          fetchStats();
          fetchRealtimeMetrics();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'hub', table: 'sso_tickets' },
        () => {
          fetchRealtimeMetrics();
          fetchActivity();
        }
      )
      .subscribe();

    setSubscription(channel);

    // Refresh realtime metrics every 30 seconds
    const realtimeInterval = setInterval(() => {
      fetchRealtimeMetrics();
      fetchAllRailwayMetrics();
    }, 30000);

    // Refresh activity every minute
    const activityInterval = setInterval(() => {
      fetchActivity();
    }, 60000);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      clearInterval(realtimeInterval);
      clearInterval(activityInterval);
    };
  }, []);

  return {
    // Data
    stats,
    realtimeMetrics,
    activity,
    railwayMetrics,
    appMetrics,
    
    // State
    loading,
    error,
    
    // Actions
    refreshAll,
    fetchAppMetrics,
    fetchRailwayMetrics,
    fetchAllRailwayMetrics,
    
    // Computed values
    totalUsers: stats?.total_users || 0,
    activeUsers: stats?.active_users || 0,
    onlineApps: stats?.online_apps || 0,
    totalApps: stats?.total_apps || 0,
    currentOnlineUsers: realtimeMetrics?.current_online_users || 0,
    requestsToday: realtimeMetrics?.requests_today || 0,
  };
}

// Hook para métricas de uma app específica
export function useAppMetrics(appSlug: string) {
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [railwayData, setRailwayData] = useState<RailwayMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appSlug) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Supabase metrics
        const { data: appData, error: appError } = await supabase.rpc(
          'hub_admin_app_metrics',
          { app_slug: appSlug }
        );
        
        if (appError) throw appError;
        setMetrics(appData);

        // Fetch Railway metrics
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          const response = await fetch(`/api/admin/railway-metrics?app=${appSlug}`, {
            headers: {
              'Authorization': `Bearer ${session.session.access_token}`
            }
          });
          
          const result = await response.json();
          if (result.data) {
            setRailwayData(result.data);
          }
        }
      } catch (err) {
        console.error(`Error fetching metrics for ${appSlug}:`, err);
        setError('Failed to fetch app metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup realtime subscription for this app
    const channel = supabase
      .channel(`app-metrics-${appSlug}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'hub', 
          table: 'user_access',
          filter: `app_id=eq.${appSlug}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appSlug]);

  return {
    metrics,
    railwayData,
    loading,
    error,
    refresh: () => {
      if (appSlug) {
        setLoading(true);
        // Re-trigger useEffect
        setMetrics(null);
        setRailwayData(null);
      }
    }
  };
}