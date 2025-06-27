
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

  const isPercentageValue = (value: number, income: number): boolean => {
    // If the value is less than 100 and would make sense as a percentage
    // (i.e., when applied to income, it gives a reasonable tax amount)
    if (value <= 100) {
      const potentialTaxAmount = (value / 100) * income;
      // Check if this would be a reasonable tax amount (less than income)
      return potentialTaxAmount < income && value > 0;
    }
    return false;
  };

  const chartData = skattetabellData.map(item => {
    const midIncome = (item.InkomstFrån + item.InkomstTill) / 2;
    const taxAmount = getTaxFromColumn(item, selectedTaxColumn);
    
    let taxPercentage: number;
    
    if (midIncome > 0 && taxAmount > 0) {
      if (isPercentageValue(taxAmount, midIncome)) {
        // Tax value is already a percentage
        taxPercentage = taxAmount;
      } else {
        // Tax value is in kr, convert to percentage
        taxPercentage = (taxAmount / midIncome) * 100;
      }
    } else {
      taxPercentage = 0;
    }
    
    return {
      income: midIncome,
      taxPercentage: parseFloat(taxPercentage.toFixed(2)),
      taxAmount: taxAmount,
      isPercentage: isPercentageValue(taxAmount, midIncome)
    };
  }).filter(item => item.income > 0 && item.taxPercentage >= 0 && item.taxPercentage <= 50);

  const chartConfig = {
    taxPercentage: {
      label: "Skatt (%)",
      color: "#2563eb",
    },
  };

  if (chartData.length === 0) {
    return null;
  }

  // Get the maximum income for x-axis formatting
  const maxIncome = Math.max(...chartData.map(item => item.income));
  
  // Generate x-axis ticks
  const generateXTicks = (max: number) => {
    const ticks = [];
    const step = Math.ceil(max / 10 / 1000) * 1000; // Round to nearest thousand
    for (let i = 0; i <= max; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Kolumn {selectedTaxColumn}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="income" 
                type="number"
                domain={[0, maxIncome]}
                ticks={generateXTicks(maxIncome)}
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                domain={[0, 50]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50]}
                tickFormatter={(value) => `${value}%`}
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium">{`Inkomst: ${Math.round(Number(label)).toLocaleString()} kr`}</p>
                        <p className="text-blue-600">{`Skatt: ${payload[0].value}%`}</p>
                        <p className="text-gray-500 text-sm">
                          {data.isPercentage ? 'Värde från tabell: procent' : 'Värde från tabell: kr'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="taxPercentage" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#1d4ed8' }}
              />
              {currentIncome > 0 && (
                <ReferenceLine 
                  x={currentIncome} 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ 
                    value: "Din inkomst", 
                    position: "top",
                    style: { fill: '#ef4444', fontWeight: 'bold' }
                  }}
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
