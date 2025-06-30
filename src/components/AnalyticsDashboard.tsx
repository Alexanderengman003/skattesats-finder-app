
import React from 'react';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { AnalyticsCharts } from './AnalyticsCharts';
import { FormInsightsCharts } from './FormInsightsCharts';
import { GeographicInsights } from './GeographicInsights';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { data, loading, error, refetch, clearAnalyticsData } = useEnhancedAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading analytics: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-600">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into user behavior and tax calculations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={clearAnalyticsData} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
        </div>
      </div>

      {/* User Activity Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity & Engagement</CardTitle>
          <CardDescription>Daily users, sessions, and interaction patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsCharts 
            dailyUsers={data.dailyUsers || []}
            topCountries={data.topCountries || []}
            clickHeatmap={data.clickHeatmap || []}
            browserStats={data.browserStats || []}
          />
        </CardContent>
      </Card>

      {/* Form Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculation Insights</CardTitle>
          <CardDescription>Analysis of user-submitted tax calculation data</CardDescription>
        </CardHeader>
        <CardContent>
          <FormInsightsCharts formInsights={data.formInsights} />
        </CardContent>
      </Card>

      {/* Geographic Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Where our users are located</CardDescription>
        </CardHeader>
        <CardContent>
          <GeographicInsights 
            geographicData={data.geographicData || []}
            totalSessions={data.totalSessions || 0}
          />
        </CardContent>
      </Card>
    </div>
  );
};
