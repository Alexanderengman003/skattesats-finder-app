
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
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      {/* Daily Users Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Daily Users & Sessions</CardTitle>
          <CardDescription className="text-sm">User activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
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

      {/* Two column layout for medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Top Countries</CardTitle>
            <CardDescription className="text-sm">Where your users are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCountries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="country" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis fontSize={12} />
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
            <CardTitle className="text-lg md:text-xl">Browser Usage</CardTitle>
            <CardDescription className="text-sm">Popular browsers among your users</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[200px] md:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
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
      </div>

      {/* Click Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Click Heatmap</CardTitle>
          <CardDescription className="text-sm">Most clicked elements and their positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {clickHeatmap.slice(0, 10).map((click, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium capitalize text-sm md:text-base">{click.element_type}</span>
                  <div className="text-xs md:text-sm text-gray-600">
                    Position: ({Math.round(click.avg_x)}, {Math.round(click.avg_y)})
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-right">
                    <div className="font-bold text-base md:text-lg">{click.count}</div>
                    <div className="text-xs md:text-sm text-gray-600">clicks</div>
                  </div>
                  <div className="w-16 md:w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (click.count / Math.max(...clickHeatmap.map(c => c.count))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
