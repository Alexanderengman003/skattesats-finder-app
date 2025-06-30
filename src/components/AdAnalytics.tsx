
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdClickData {
  element_type: string;
  count: number;
  ad_type?: string;
  ad_position?: string;
  ad_slot?: string;
}

interface AdAnalyticsProps {
  clickHeatmap: Array<{
    element_type: string;
    count: number;
    avg_x: number;
    avg_y: number;
  }>;
  topEvents: Array<{
    event_name: string;
    count: number;
  }>;
}

export const AdAnalytics: React.FC<AdAnalyticsProps> = ({ clickHeatmap, topEvents }) => {
  // Filter ad-related clicks from the heatmap data
  const adClicks = clickHeatmap.filter(item => 
    item.element_type === 'ad_banner' || 
    item.element_type === 'ad_card' ||
    item.element_type.includes('ad')
  );

  // Calculate total ad clicks
  const totalAdClicks = adClicks.reduce((sum, item) => sum + item.count, 0);

  // Prepare data for charts
  const adClicksByType = adClicks.map(item => ({
    name: item.element_type === 'ad_banner' ? 'Banner Ads' : 
          item.element_type === 'ad_card' ? 'Card Ads' : 
          item.element_type,
    clicks: item.count
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Calculate click-through rate (mock data since we don't have impressions)
  const estimatedImpressions = totalAdClicks * 20; // Rough estimate
  const ctr = totalAdClicks > 0 ? ((totalAdClicks / estimatedImpressions) * 100).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdClicks}</div>
            <p className="text-xs text-muted-foreground">
              All ad interactions tracked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estimated CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-muted-foreground">
              Click-through rate estimate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ad Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adClicksByType.length}</div>
            <p className="text-xs text-muted-foreground">
              Different ad formats
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Clicks by Type</CardTitle>
            <CardDescription>
              Distribution of clicks across different ad formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adClicksByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adClicksByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No ad click data available yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ad Performance Distribution</CardTitle>
            <CardDescription>
              Percentage breakdown of ad clicks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {adClicksByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={adClicksByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="clicks"
                  >
                    {adClicksByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-300 flex items-center justify-center text-muted-foreground">
                No ad click data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Click Details</CardTitle>
          <CardDescription>
            Detailed breakdown of ad interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adClicks.length > 0 ? (
            <div className="space-y-3">
              {adClicks.map((click, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="font-medium">
                        {click.element_type === 'ad_banner' ? 'Banner Ad' : 
                         click.element_type === 'ad_card' ? 'Card Ad' : 
                         click.element_type}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Position: {click.avg_x.toFixed(0)}x, {click.avg_y.toFixed(0)}y
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{click.count} clicks</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No ad clicks recorded yet.</p>
              <p className="text-sm">Ad clicks will appear here once users interact with your ads.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
