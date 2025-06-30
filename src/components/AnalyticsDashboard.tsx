
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedAnalytics } from '@/hooks/useEnhancedAnalytics';
import { AnalyticsCharts } from './AnalyticsCharts';
import { FormInsightsCharts } from './FormInsightsCharts';
import { GeographicInsights } from './GeographicInsights';
import { AdAnalytics } from './AdAnalytics';
import { CalculationsList } from './CalculationsList';
import { Loader2 } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { data, loading, error, refetch } = useEnhancedAnalytics();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights into your tax calculator usage</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="form-insights">Form Insights</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="calculations">All Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCharts data={data} />
        </TabsContent>

        <TabsContent value="form-insights" className="space-y-6">
          <FormInsightsCharts formInsights={data.formInsights} />
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <GeographicInsights 
            geographicData={data.geographicData}
            topCountries={data.topCountries}
          />
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <AdAnalytics />
        </TabsContent>

        <TabsContent value="calculations" className="space-y-6">
          <CalculationsList 
            calculations={data.allCalculations}
            onCalculationDeleted={refetch}
            onRefresh={refetch}
            isRefreshing={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
