
import React, { createContext, useContext, useCallback } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsContextType {
  trackClick: (elementType: string, elementText: string, additionalProps?: Record<string, any>) => void;
  trackPageView: (pagePath: string) => void;
  trackFormData: (formData: {
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
  }) => void;
  trackEvent: (eventType: string, eventName: string, properties?: Record<string, any>, formData?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { trackClick, trackPageView, trackFormData, trackEvent } = useAnalytics();

  return (
    <AnalyticsContext.Provider value={{
      trackClick,
      trackPageView,
      trackFormData,
      trackEvent
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
};
