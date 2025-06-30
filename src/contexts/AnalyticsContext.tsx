
import React, { createContext, useContext, ReactNode } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  trackEvent: (eventType: string, eventName: string, properties?: Record<string, any>) => void;
  trackClick: (elementType: string, elementText: string, additionalProps?: Record<string, any>) => void;
  trackPageView: (pagePath: string) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useAnalytics();

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
