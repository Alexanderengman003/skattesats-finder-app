
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, PieChart } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import TaxTableChart from './TaxTableChart';

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

interface TaxColumnSelectorProps {
  age: number;
  onAgeChange: (age: number) => void;
  incomeType: string;
  onIncomeTypeChange: (type: string) => void;
  isPensionContributing: boolean;
  onPensionContributingChange: (contributing: boolean) => void;
  birthYear: number;
  onBirthYearChange: (year: number) => void;
  monthlyIncome: number;
  onMonthlyIncomeChange: (income: number) => void;
  birthday: string;
  onBirthdayChange: (birthday: string) => void;
  taxAmount: string | null;
  kommun: string;
  selectedTaxColumn: number;
  result: any[];
  includeSvenskaKyrkan: boolean;
  selectedYear: number | null;
  getSkattetabell: (taxRate: number) => number;
  onTriggerCalculation: () => void;
  taxableBenefit: number;
  onTaxableBenefitChange: (benefit: number) => void;
  skattetabellData: SkattetabellData[];
}

const TaxColumnSelector = ({
  monthlyIncome,
  taxAmount,
  kommun,
  selectedTaxColumn,
  result,
  includeSvenskaKyrkan,
  getSkattetabell,
  taxableBenefit,
  skattetabellData
}: TaxColumnSelectorProps) => {
  const getTotalIncomeForTax = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const getBaseSalary = (): number => {
    return monthlyIncome;
  };

  const isPercentageValue = (value: number, income: number): boolean => {
    if (value <= 100) {
      const potentialTaxAmount = (value / 100) * income;
      return potentialTaxAmount < income && value > 0;
    }
    return false;
  };

  const getTaxPercentage = (): string => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return '0';
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    let percentage: number;
    if (isPercentageValue(taxAmountNum, getTotalIncomeForTax())) {
      percentage = taxAmountNum;
    } else {
      percentage = (taxAmountNum / getTotalIncomeForTax()) * 100;
    }
    
    return percentage.toFixed(1);
  };

  const getActualTaxAmount = (): number => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return 0;
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    if (isPercentageValue(taxAmountNum, getTotalIncomeForTax())) {
      return (taxAmountNum / 100) * getTotalIncomeForTax();
    } else {
      return taxAmountNum;
    }
  };

  const getNetSalary = (): number => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return getBaseSalary();
    const actualTaxAmount = getActualTaxAmount();
    return getBaseSalary() - actualTaxAmount;
  };

  const getMarginalTaxRate = (): string => {
    if (skattetabellData.length === 0 || getTotalIncomeForTax() === 0) return '0';
    
    // Find current tax bracket or use the last one if income exceeds maximum
    let currentBracket = skattetabellData.find(item => 
      getTotalIncomeForTax() >= item.InkomstFrån && getTotalIncomeForTax() <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!currentBracket) {
      currentBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    if (!currentBracket) return '0';
    
    // Find the previous bracket
    const currentIndex = skattetabellData.indexOf(currentBracket);
    if (currentIndex <= 0) return '0';
    
    const previousBracket = skattetabellData[currentIndex - 1];
    
    // Get tax values for both brackets
    const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    const previousTaxValue = parseFloat(previousBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    // Calculate income and tax differences
    const incomeDiff = currentBracket.InkomstFrån - previousBracket.InkomstFrån;
    
    let currentTaxAmount = 0;
    let previousTaxAmount = 0;
    
    // Convert to actual tax amounts if they are percentages
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstFrån)) {
      currentTaxAmount = (currentTaxValue / 100) * currentBracket.InkomstFrån;
    } else {
      currentTaxAmount = currentTaxValue;
    }
    
    if (isPercentageValue(previousTaxValue, previousBracket.InkomstFrån)) {
      previousTaxAmount = (previousTaxValue / 100) * previousBracket.InkomstFrån;
    } else {
      previousTaxAmount = previousTaxValue;
    }
    
    const taxDiff = currentTaxAmount - previousTaxAmount;
    
    if (incomeDiff > 0 && taxDiff >= 0) {
      const marginalRate = (taxDiff / incomeDiff) * 100;
      return Math.max(0, marginalRate).toFixed(1);
    }
    
    return '0';
  };

  const getPieChartData = () => {
    const netSalary = Math.round(getNetSalary());
    const taxAmount = Math.round(getActualTaxAmount());
    
    return [
      {
        name: 'Netto efter skatt',
        value: netSalary,
        color: '#3b82f6'
      },
      {
        name: 'Skatt',
        value: taxAmount,
        color: '#ef4444'
      }
    ];
  };

  const COLORS = ['#3b82f6', '#ef4444'];

  // Calculate required size based on largest value
  const getChartSize = () => {
    const netSalary = Math.round(getNetSalary());
    const taxAmount = Math.round(getActualTaxAmount());
    const maxValue = Math.max(netSalary, taxAmount);
    const maxValueString = `${maxValue.toLocaleString()} kr`;
    
    // Base size + extra space for larger numbers
    const baseSize = 250;
    const charWidth = 12; // Approximate character width
    const extraSize = Math.max(0, (maxValueString.length - 8) * charWidth);
    
    return Math.max(baseSize, baseSize + extraSize);
  };

  // Get filtered tax data, using last bracket if income exceeds maximum
  const getFilteredSkattetabellData = () => {
    if (skattetabellData.length === 0) return null;
    
    const totalIncome = getTotalIncomeForTax();
    if (totalIncome === 0) return null;
    
    // Find matching bracket or use the last one
    let matchingBracket = skattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!matchingBracket) {
      matchingBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    return matchingBracket;
  };

  const getTaxFromColumn = (item: any, column: number): string => {
    const columnKey = `Kolumn${column}`;
    return item[columnKey] || 'Ej tillgänglig';
  };

  // Use the filtered data with fallback to last bracket
  const filteredTaxData = getFilteredSkattetabellData();
  const currentTaxAmount = filteredTaxData ? getTaxFromColumn(filteredTaxData, selectedTaxColumn) : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Skatteberäkning
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-blue-50 rounded-b-xl">
          {/* Tax Result Display */}
          {result.length > 0 && (
            <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Skattesats för {result[0].Kommun}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Kommunal skatt:</span>
                  <span className="font-medium">{result[0].KommunalSkatt}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Landstingsskatt:</span>
                  <span className="font-medium">{result[0].LandstingsSkatt}%</span>
                </div>
                {includeSvenskaKyrkan && (
                  <div className="flex justify-between">
                    <span>Kyrkoavgift:</span>
                    <span className="font-medium">{result[0].Kyrkoavgift}%</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 mt-2">
                  <span className="font-semibold">Total skattesats:</span>
                  <span className="font-semibold text-blue-700">
                    {includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Skattetabell:</span>
                  <span className="font-semibold text-blue-700">
                    {getSkattetabell(includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {kommun && currentTaxAmount && getTotalIncomeForTax() > 0 ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-blue-100 border border-blue-300 rounded-xl">
                <div className="text-lg font-medium text-blue-700 mb-2">
                  Skatt för {Math.round(monthlyIncome).toLocaleString()} kr/månad:
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  {Math.round(getActualTaxAmount()).toLocaleString()} kr
                </div>
                <div className="text-lg font-medium text-blue-600 mb-2">
                  Du betalar {getTaxPercentage()}% i skatt
                </div>
                <div className="text-md font-medium text-blue-600">
                  Marginalskatt: {getMarginalTaxRate()}%
                </div>
              </div>
              
              <div className="text-center p-6 bg-blue-100 border border-blue-300 rounded-xl">
                <div className="text-lg font-medium text-blue-700 mb-4">
                  Netto efter skatt:
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="relative" style={{ width: getChartSize(), height: getChartSize() }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={getChartSize() * 0.35}
                          outerRadius={getChartSize() * 0.47}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={12}
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString()} kr`,
                            name
                          ]}
                          labelFormatter={() => ''}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-800">
                          {Math.round(getNetSalary()).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">
                          kr
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-blue-100 border border-blue-300 rounded-xl">
              {!kommun 
                ? 'Gör en skattesats-sökning först'
                : getTotalIncomeForTax() === 0
                ? 'Ange månadsinkomst för att se skatteberäkning'
                : 'Beräknar skatt...'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Table Chart */}
      {skattetabellData.length > 0 && getTotalIncomeForTax() > 0 && (
        <TaxTableChart 
          skattetabellData={skattetabellData}
          selectedTaxColumn={selectedTaxColumn}
          currentIncome={getTotalIncomeForTax()}
        />
      )}
    </div>
  );
};

export default TaxColumnSelector;
