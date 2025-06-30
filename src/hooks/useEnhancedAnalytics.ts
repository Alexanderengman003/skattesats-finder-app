
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyUserData {
  date: string;
  users: number;
  sessions: number;
}

interface GeographicData {
  country: string;
  city: string | null;
  count: number;
  percentage: number;
}

interface ClickHeatmapData {
  element_type: string;
  count: number;
  avg_x: number;
  avg_y: number;
}

interface BrowserData {
  browser: string;
  count: number;
}

interface EnhancedAnalyticsData {
  dailyUsers: DailyUserData[];
  geographicData: GeographicData[];
  clickHeatmap: ClickHeatmapData[];
  browserStats: BrowserData[];
  topCountries: Array<{ country: string; count: number }>;
}

export const useEnhancedAnalytics = () => {
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnhancedAnalytics();
  }, []);

  const loadEnhancedAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get daily user statistics for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: sessionsData } = await supabase
        .from('analytics_sessions')
        .select('session_start, user_id, country, city, browser')
        .gte('session_start', thirtyDaysAgo.toISOString());

      // Process daily users data
      const dailyUsersMap = new Map<string, { users: Set<string>, sessions: number }>();
      
      sessionsData?.forEach((session) => {
        const date = new Date(session.session_start).toISOString().split('T')[0];
        if (!dailyUsersMap.has(date)) {
          dailyUsersMap.set(date, { users: new Set(), sessions: 0 });
        }
        const dayData = dailyUsersMap.get(date)!;
        if (session.user_id) {
          dayData.users.add(session.user_id);
        }
        dayData.sessions++;
      });

      const dailyUsers: DailyUserData[] = Array.from(dailyUsersMap.entries())
        .map(([date, data]) => ({
          date,
          users: data.users.size,
          sessions: data.sessions
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Process geographic data
      const geographicMap = new Map<string, number>();
      const cityMap = new Map<string, { country: string; count: number }>();
      
      sessionsData?.forEach((session) => {
        const country = session.country || 'Unknown';
        const city = session.city;
        
        geographicMap.set(country, (geographicMap.get(country) || 0) + 1);
        
        if (city) {
          const key = `${city}, ${country}`;
          cityMap.set(key, {
            country,
            count: (cityMap.get(key)?.count || 0) + 1
          });
        }
      });

      const totalSessions = sessionsData?.length || 0;
      const geographicData: GeographicData[] = Array.from(geographicMap.entries())
        .map(([country, count]) => ({
          country,
          city: null,
          count,
          percentage: totalSessions > 0 ? (count / totalSessions) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      const topCountries = geographicData.slice(0, 10).map(item => ({
        country: item.country,
        count: item.count
      }));

      // Get click heatmap data
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('event_name, properties')
        .eq('event_type', 'click')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const clickMap = new Map<string, { count: number; x_coords: number[]; y_coords: number[] }>();
      
      eventsData?.forEach((event) => {
        const props = event.properties as any;
        if (props?.element_type) {
          const key = props.element_type;
          if (!clickMap.has(key)) {
            clickMap.set(key, { count: 0, x_coords: [], y_coords: [] });
          }
          const clickData = clickMap.get(key)!;
          clickData.count++;
          if (props.x_coordinate) clickData.x_coords.push(props.x_coordinate);
          if (props.y_coordinate) clickData.y_coords.push(props.y_coordinate);
        }
      });

      const clickHeatmap: ClickHeatmapData[] = Array.from(clickMap.entries())
        .map(([element_type, data]) => ({
          element_type,
          count: data.count,
          avg_x: data.x_coords.length > 0 ? data.x_coords.reduce((a, b) => a + b, 0) / data.x_coords.length : 0,
          avg_y: data.y_coords.length > 0 ? data.y_coords.reduce((a, b) => a + b, 0) / data.y_coords.length : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Process browser statistics
      const browserMap = new Map<string, number>();
      sessionsData?.forEach((session) => {
        const browser = session.browser || 'Unknown';
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
      });

      const browserStats: BrowserData[] = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      setData({
        dailyUsers,
        geographicData,
        clickHeatmap,
        browserStats,
        topCountries
      });

    } catch (err) {
      console.error('Error loading enhanced analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadEnhancedAnalytics };
};
