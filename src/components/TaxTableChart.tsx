
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface SkattetabellData {
  År: number;
  Tabell: number;
  InkomstFrån: number;
  InkomstTill: number;
  Skatt: number;
  AntalDagar?: number;
  Kolumn1?: string;
  Kolumn2?: string;
  Kolumn3?: string;
  Kolumn4?: string;
  Kolumn5?: string;
  Kolumn6?: string;
  Kolumn7?: string;
  [key: string]: any;
}

interface TaxTableChartProps {
  skattetabellData: SkattetabellData[];
  selectedTaxColumn: number;
  currentIncome: number;
}

const TaxTableChart = ({ skattetabellData, selectedTaxColumn, currentIncome }: TaxTableChartProps) => {
  const getTaxFromColumn = (item: any, column: number): number => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    if (!taxValue || taxValue === 'Ej tillgänglig') return 0;
    return parseFloat(taxValue.replace(/[^\d.-]/g, '')) || 0;
  };

  const chartData = skattetabellData.map(item => {
    const midIncome = (item.InkomstFrån + item.InkomstTill) / 2;
    const taxAmount = getTaxFromColumn(item, selectedTaxColumn);
    const taxPercentage = midIncome > 0 ? (taxAmount / midIncome) * 100 : 0;
    
    return {
      income: midIncome,
      taxPercentage: parseFloat(taxPercentage.toFixed(2)),
      taxAmount: taxAmount
    };
  }).filter(item => item.income > 0 && item.taxPercentage > 0);

  const chartConfig = {
    taxPercentage: {
      label: "Skatt (%)",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Skattetabell Visualisering - Kolumn {selectedTaxColumn}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="income" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [
                      `${value}%`,
                      'Skatt (%)'
                    ]}
                    labelFormatter={(value) => `Inkomst: ${Math.round(Number(value)).toLocaleString()} kr`}
                  />
                }
              />
              <Line 
                type="monotone" 
                dataKey="taxPercentage" 
                stroke="var(--color-taxPercentage)" 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {currentIncome > 0 && (
                <ReferenceLine 
                  x={currentIncome} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "Din inkomst", position: "top" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-2 text-sm text-gray-600">
          Grafen visar skatteprocent baserat på inkomst för skattetabell kolumn {selectedTaxColumn}.
          {currentIncome > 0 && " Den röda linjen visar din nuvarande inkomst."}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxTableChart;
