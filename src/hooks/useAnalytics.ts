
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_name: string;
  properties?: Record<string, any>;
  page_url?: string;
  form_data?: Record<string, any>;
}

interface AnalyticsSession {
  id: string;
  user_id?: string;
  session_start: string;
  page_views: number;
  events_count: number;
  municipality?: string;
  parish?: string;
  user_age?: number;
  monthly_income?: number;
  taxable_benefit?: number;
  income_type?: string;
  has_collective_agreement?: boolean;
  vacation_days?: number;
  variable_salary?: number;
  includes_swedish_church?: boolean;
  selected_year?: number;
}

export const useAnalytics = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [session, setSession] = useState<AnalyticsSession | null>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user agent and other browser info
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      const landingPage = window.location.href;
      
      // Detect device type, browser, OS
      const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
      const browser = getBrowserName(userAgent);
      const os = getOperatingSystem(userAgent);

      // Create new session
      const { data: sessionData, error } = await supabase
        .from('analytics_sessions')
        .insert({
          user_id: user?.id || null,
          referrer,
          landing_page: landingPage,
          user_agent: userAgent,
          device_type: deviceType,
          browser,
          os,
          page_views: 1,
          events_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating analytics session:', error);
        return;
      }

      setSessionId(sessionData.id);
      setSession(sessionData);
      
      // Track page view
      await trackEvent('page_view', 'page_load', {
        page_url: window.location.href,
        page_title: document.title
      });

    } catch (error) {
      console.error('Error initializing analytics session:', error);
    }
  };

  const trackEvent = useCallback(async (
    eventType: string,
    eventName: string,
    properties: Record<string, any> = {},
    formData: Record<string, any> = {}
  ) => {
    if (!sessionId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const eventData: AnalyticsEvent = {
        event_type: eventType,
        event_name: eventName,
        properties,
        page_url: window.location.href,
        form_data: formData
      };

      await supabase.from('analytics_events').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        ...eventData,
        referrer: document.referrer,
        user_agent: navigator.userAgent
      });

      // Update session events count
      if (session) {
        const updatedEventsCount = session.events_count + 1;
        await supabase
          .from('analytics_sessions')
          .update({ events_count: updatedEventsCount })
          .eq('id', sessionId);
        
        setSession(prev => prev ? { ...prev, events_count: updatedEventsCount } : null);
      }

    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [sessionId, session]);

  const trackFormData = useCallback(async (formData: {
    municipality?: string;
    parish?: string;
    user_age?: number;
    monthly_income?: number;
    taxable_benefit?: number;
    income_type?: string;
    has_collective_agreement?: boolean;
    vacation_days?: number;
    variable_salary?: number;
    includes_swedish_church?: boolean;
    selected_year?: number;
  }) => {
    if (!sessionId) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create a new session record for each calculation instead of updating the existing one
      const { data: newSessionData, error } = await supabase
        .from('analytics_sessions')
        .insert({
          user_id: user?.id || null,
          referrer: document.referrer,
          landing_page: window.location.href,
          user_agent: navigator.userAgent,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: getBrowserName(navigator.userAgent),
          os: getOperatingSystem(navigator.userAgent),
          page_views: 1,
          events_count: 1,
          ...formData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating new analytics session:', error);
        return;
      }

      // Track form interaction event
      await trackEvent('form_interaction', 'form_data_submitted', {}, formData);

    } catch (error) {
      console.error('Error tracking form data:', error);
    }
  }, [sessionId, trackEvent]);

  const trackClick = useCallback((elementType: string, elementText: string, additionalProps: Record<string, any> = {}) => {
    trackEvent('click', 'element_click', {
      element_type: elementType,
      element_text: elementText,
      ...additionalProps
    });
  }, [trackEvent]);

  const trackPageView = useCallback((pagePath: string) => {
    trackEvent('page_view', 'page_change', {
      page_url: pagePath,
      page_title: document.title
    });
    
    // Update session page views count
    if (session && sessionId) {
      const updatedPageViews = session.page_views + 1;
      supabase
        .from('analytics_sessions')
        .update({ page_views: updatedPageViews })
        .eq('id', sessionId);
      
      setSession(prev => prev ? { ...prev, page_views: updatedPageViews } : null);
    }
  }, [trackEvent, session, sessionId]);

  return {
    trackEvent,
    trackClick,
    trackPageView,
    trackFormData,
    sessionId,
    session
  };
};

// Helper functions
function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getOperatingSystem(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}
