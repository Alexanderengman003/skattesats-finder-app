
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FormInsights {
  popularMunicipalities: Array<{ municipality: string; count: number }>;
  ageDistribution: Array<{ age_range: string; count: number }>;
  incomeRanges: Array<{ income_range: string; count: number }>;
  incomeTypes: Array<{ income_type: string; count: number }>;
  yearSelections: Array<{ year: number; count: number }>;
  vacationDaysDistribution: Array<{ vacation_days: number; count: number }>;
  avgAge: number;
  avgIncome: number;
  avgTaxableBenefit: number;
  avgVariableSalary: number;
  avgVacationDays: number;
  churchMembershipRate: number;
  collectiveAgreementRate: number;
  churchMembershipCount: number;
  churchMembershipTotal: number;
  collectiveAgreementCount: number;
  collectiveAgreementTotal: number;
}

interface FormInsightsChartsProps {
  formInsights: FormInsights;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const FormInsightsCharts: React.FC<FormInsightsChartsProps> = ({ formInsights }) => {
  const chartConfig = {
    count: {
      label: "Count",
      color: "#2563eb",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards - All on one row */}
      <div className="grid grid-cols-7 gap-3">
        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Average Age</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{formInsights.avgAge || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">years</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Income</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">
              {formInsights.avgIncome ? `${Math.round(formInsights.avgIncome / 1000)}k` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">SEK/month</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Benefit</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">
              {formInsights.avgTaxableBenefit ? `${Math.round(formInsights.avgTaxableBenefit / 1000)}k` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">SEK/month</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Variable</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">
              {formInsights.avgVariableSalary ? `${Math.round(formInsights.avgVariableSalary / 1000)}k` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">SEK/month</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Vacation</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{formInsights.avgVacationDays || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">days/year</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Church</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{formInsights.churchMembershipRate}%</div>
            <p className="text-xs text-muted-foreground">
              {formInsights.churchMembershipCount}/{formInsights.churchMembershipTotal}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Collective</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-lg font-bold">{formInsights.collectiveAgreementRate}%</div>
            <p className="text-xs text-muted-foreground">
              {formInsights.collectiveAgreementCount}/{formInsights.collectiveAgreementTotal}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - 2x2 grid for bigger charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Popular Municipalities */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">Popular Municipalities</CardTitle>
            <CardDescription className="text-sm">Most searched municipalities</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formInsights.popularMunicipalities.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="municipality" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">Age Distribution</CardTitle>
            <CardDescription className="text-sm">User age ranges (5-year increments)</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formInsights.ageDistribution.filter(item => item.count > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="age_range" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Vacation Days Distribution */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">Vacation Days Distribution</CardTitle>
            <CardDescription className="text-sm">Distribution of vacation days per year</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formInsights.vacationDaysDistribution.filter(item => item.count > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="vacation_days" 
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Income Ranges */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-lg">Income Distribution</CardTitle>
            <CardDescription className="text-sm">Monthly income ranges (SEK)</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formInsights.incomeRanges.filter(item => item.count > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="income_range" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Income Types and Year Selections - On one row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Income Types */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm">Income Types</CardTitle>
            <CardDescription className="text-xs">Distribution of income sources</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1">
              {formInsights.incomeTypes.map((type, index) => (
                <div key={type.income_type} className="flex items-center justify-between">
                  <span className="text-xs font-medium capitalize">{type.income_type || 'Unknown'}</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0">{type.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Year Selections */}
        <Card className="col-span-1">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm">Selected Years</CardTitle>
            <CardDescription className="text-xs">Tax years users are looking up</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1">
              {formInsights.yearSelections.map((year, index) => (
                <div key={year.year} className="flex items-center justify-between">
                  <span className="text-xs font-medium">{year.year}</span>
                  <Badge variant="secondary" className="text-xs px-2 py-0">{year.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
