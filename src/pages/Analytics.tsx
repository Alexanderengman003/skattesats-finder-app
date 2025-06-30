
import React, { useState, useEffect } from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { AnalyticsLogin } from '@/components/AnalyticsLogin';

const ANALYTICS_AUTH_KEY = 'analytics_authenticated';

const Analytics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const isAuth = localStorage.getItem(ANALYTICS_AUTH_KEY) === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogin = () => {
    localStorage.setItem(ANALYTICS_AUTH_KEY, 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(ANALYTICS_AUTH_KEY);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AnalyticsLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex justify-end p-4">
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Logout
        </button>
      </div>
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;
