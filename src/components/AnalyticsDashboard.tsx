
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AnalyticsCharts } from './AnalyticsCharts';
import { GeographicInsights } from './GeographicInsights';
import { FormInsightsCharts } from './FormInsightsCharts';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';

interface AnalyticsStats {
  totalSessions: number;
  totalEvents: number;
  totalPageViews: number;
  uniqueUsers: number;
  topEvents: Array<{ event_name: string; count: number }>;
  topPages: Array<{ page_url: string; count: number }>;
  deviceTypes: Array<{ device_type: string; count: number }>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: enhancedData, loading: enhancedLoading } = useEnhancedAnalytics();

  useEffect(() => {
    loadAnalyticsStats();
  }, []);

  const loadAnalyticsStats = async () => {
    try {
      // Get basic stats
      const { count: totalSessions } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true });

      const { count: totalEvents } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true });

      const { data: pageViewsData } = await supabase
        .from('analytics_sessions')
        .select('page_views');
      
      const totalPageViews = pageViewsData?.reduce((sum, session) => sum + session.page_views, 0) || 0;

      const { data: uniqueUsersData } = await supabase
        .from('analytics_sessions')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const uniqueUsers = new Set(uniqueUsersData?.map(s => s.user_id)).size;

      // Get top events
      const { data: topEventsData } = await supabase
        .from('analytics_events')
        .select('event_name')
        .limit(1000);

      const eventCounts = topEventsData?.reduce((acc, event) => {
        acc[event.event_name] = (acc[event.event_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topEvents = Object.entries(eventCounts)
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get top pages
      const { data: topPagesData } = await supabase
        .from('analytics_events')
        .select('page_url')
        .eq('event_type', 'page_view')
        .limit(1000);

      const pageCounts = topPagesData?.reduce((acc, event) => {
        if (event.page_url) {
          acc[event.page_url] = (acc[event.page_url] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const topPages = Object.entries(pageCounts)
        .map(([page_url, count]) => ({ page_url, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get device types
      const { data: deviceData } = await supabase
        .from('analytics_sessions')
        .select('device_type');

      const deviceCounts = deviceData?.reduce((acc, session) => {
        if (session.device_type) {
          acc[session.device_type] = (acc[session.device_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const deviceTypes = Object.entries(deviceCounts)
        .map(([device_type, count]) => ({ device_type, count }));

      setStats({
        totalSessions: totalSessions || 0,
        totalEvents: totalEvents || 0,
        totalPageViews,
        uniqueUsers,
        topEvents,
        topPages,
        deviceTypes
      });

    } catch (error) {
      console.error('Error loading analytics stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || enhancedLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!stats || !enhancedData) {
    return <div className="p-6">No analytics data available.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Enhanced Analytics Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts & Trends</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="form-insights">Form Insights</TabsTrigger>
          <TabsTrigger value="events">Top Events</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <AnalyticsCharts
            dailyUsers={enhancedData.dailyUsers}
            topCountries={enhancedData.topCountries}
            clickHeatmap={enhancedData.clickHeatmap}
            browserStats={enhancedData.browserStats}
          />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <GeographicInsights
            geographicData={enhancedData.geographicData}
            totalSessions={stats.totalSessions}
          />
        </TabsContent>

        <TabsContent value="form-insights" className="space-y-4">
          <FormInsightsCharts formInsights={enhancedData.formInsights} />
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Tracked Events</CardTitle>
              <CardDescription>The most frequently tracked user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topEvents.map((event, index) => (
                  <div key={event.event_name} className="flex items-center justify-between">
                    <span className="font-medium">{event.event_name}</span>
                    <Badge variant="secondary">{event.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Pages</CardTitle>
              <CardDescription>Pages with the most views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topPages.map((page, index) => (
                  <div key={page.page_url} className="flex items-center justify-between">
                    <span className="font-medium truncate">{page.page_url}</span>
                    <Badge variant="secondary">{page.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
              <CardDescription>Breakdown of user devices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.deviceTypes.map((device, index) => (
                  <div key={device.device_type} className="flex items-center justify-between">
                    <span className="font-medium capitalize">{device.device_type}</span>
                    <Badge variant="secondary">{device.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
