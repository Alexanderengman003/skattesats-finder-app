
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsChartsProps {
  dailyUsers: Array<{ date: string; users: number; sessions: number }>;
  topCountries: Array<{ country: string; count: number }>;
  clickHeatmap: Array<{ element_type: string; count: number; avg_x: number; avg_y: number }>;
  browserStats: Array<{ browser: string; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  dailyUsers,
  topCountries,
  clickHeatmap,
  browserStats
}) => {
  const chartConfig = {
    users: {
      label: "Users",
      color: "#2563eb",
    },
    sessions: {
      label: "Sessions", 
      color: "#60a5fa",
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Daily Users Chart */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Users & Sessions</CardTitle>
          <CardDescription>User activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--color-users)" 
                  strokeWidth={2}
                  name="Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="var(--color-sessions)" 
                  strokeWidth={2}
                  name="Sessions"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Top Countries</CardTitle>
          <CardDescription>Where your users are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Browser Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Usage</CardTitle>
          <CardDescription>Popular browsers among your users</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={browserStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="browser"
                >
                  {browserStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Click Heatmap */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Click Heatmap</CardTitle>
          <CardDescription>Most clicked elements and their positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clickHeatmap.slice(0, 10).map((click, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium capitalize">{click.element_type}</span>
                  <div className="text-sm text-gray-600">
                    Position: ({Math.round(click.avg_x)}, {Math.round(click.avg_y)})
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{click.count}</div>
                  <div className="text-sm text-gray-600">clicks</div>
                </div>
                <div className="ml-4 w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (click.count / Math.max(...clickHeatmap.map(c => c.count))) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
