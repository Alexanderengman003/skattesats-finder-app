
import React, { useEffect } from 'react';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';

interface AnalyticsTrackerProps {
  children: React.ReactNode;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({ children }) => {
  const { trackClick, trackPageView } = useAnalyticsContext();

  useEffect(() => {
    // Track clicks globally
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      const elementType = target.tagName.toLowerCase();
      const elementText = target.textContent?.slice(0, 100) || '';
      const elementId = target.id || '';
      const elementClasses = target.className || '';

      trackClick(elementType, elementText, {
        element_id: elementId,
        element_classes: elementClasses,
        x_coordinate: event.clientX,
        y_coordinate: event.clientY
      });
    };

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackPageView(window.location.pathname);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackClick, trackPageView]);

  return <>{children}</>;
};
