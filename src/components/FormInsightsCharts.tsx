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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Key Metrics Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Age</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formInsights.avgAge || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">years old</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formInsights.avgIncome ? `${formInsights.avgIncome.toLocaleString()} kr` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">monthly</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Taxable Benefit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formInsights.avgTaxableBenefit ? `${formInsights.avgTaxableBenefit.toLocaleString()} kr` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">monthly</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Variable Salary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formInsights.avgVariableSalary ? `${formInsights.avgVariableSalary.toLocaleString()} kr` : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">monthly</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Vacation Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formInsights.avgVacationDays || 'N/A'}</div>
          <p className="text-xs text-muted-foreground">days per year</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Church Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formInsights.churchMembershipRate}%</div>
          <p className="text-xs text-muted-foreground">
            {formInsights.churchMembershipCount} of {formInsights.churchMembershipTotal} users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Collective Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formInsights.collectiveAgreementRate}%</div>
          <p className="text-xs text-muted-foreground">
            {formInsights.collectiveAgreementCount} of {formInsights.collectiveAgreementTotal} users
          </p>
        </CardContent>
      </Card>

      {/* Popular Municipalities */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Popular Municipalities</CardTitle>
          <CardDescription>Most searched municipalities</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formInsights.popularMunicipalities.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="municipality" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
          <CardDescription>User age ranges (5-year increments)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formInsights.ageDistribution.filter(item => item.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="age_range" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  fontSize={11}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Vacation Days Distribution */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Vacation Days Distribution</CardTitle>
          <CardDescription>Distribution of vacation days per year</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formInsights.vacationDaysDistribution.filter(item => item.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vacation_days" 
                  fontSize={11}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Income Ranges */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Income Distribution</CardTitle>
          <CardDescription>Monthly income ranges (SEK)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
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
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Income Types */}
      <Card>
        <CardHeader>
          <CardTitle>Income Types</CardTitle>
          <CardDescription>Distribution of income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formInsights.incomeTypes.map((type, index) => (
              <div key={type.income_type} className="flex items-center justify-between">
                <span className="font-medium capitalize">{type.income_type || 'Unknown'}</span>
                <Badge variant="secondary">{type.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Year Selections */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Years</CardTitle>
          <CardDescription>Tax years users are looking up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formInsights.yearSelections.map((year, index) => (
              <div key={year.year} className="flex items-center justify-between">
                <span className="font-medium">{year.year}</span>
                <Badge variant="secondary">{year.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
