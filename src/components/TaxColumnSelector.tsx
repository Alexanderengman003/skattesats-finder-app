
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
    
    // Find current tax bracket
    const currentBracket = skattetabellData.find(item => 
      getTotalIncomeForTax() >= item.InkomstFrån && getTotalIncomeForTax() <= item.InkomstTill
    );
    
    if (!currentBracket) return '0';
    
    // Find next bracket to calculate marginal rate
    const nextBracket = skattetabellData.find(item => 
      item.InkomstFrån > currentBracket.InkomstTill
    );
    
    if (!nextBracket) {
      // If no next bracket, use current bracket rate
      const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
      if (isPercentageValue(currentTaxValue, getTotalIncomeForTax())) {
        return currentTaxValue.toFixed(1);
      }
      return '0';
    }
    
    // Calculate marginal tax rate between current and next bracket
    const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    const nextTaxValue = parseFloat(nextBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    const incomeDiff = nextBracket.InkomstFrån - currentBracket.InkomstTill;
    let taxDiff = 0;
    
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstTill) && isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      // Both are percentages
      const currentTaxAmount = (currentTaxValue / 100) * currentBracket.InkomstTill;
      const nextTaxAmount = (nextTaxValue / 100) * nextBracket.InkomstFrån;
      taxDiff = nextTaxAmount - currentTaxAmount;
    } else if (!isPercentageValue(currentTaxValue, currentBracket.InkomstTill) && !isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      // Both are absolute values
      taxDiff = nextTaxValue - currentTaxValue;
    }
    
    if (incomeDiff > 0) {
      const marginalRate = (taxDiff / incomeDiff) * 100;
      return Math.max(0, marginalRate).toFixed(1);
    }
    
    return '0';
  };

  const getPieChartData = () => {
    const netSalary = getNetSalary();
    const taxAmount = getActualTaxAmount();
    
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

          {kommun && taxAmount && getTotalIncomeForTax() > 0 ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-blue-100 border border-blue-300 rounded-xl">
                <div className="text-lg font-medium text-blue-700 mb-2">
                  Skatt för {getTotalIncomeForTax().toLocaleString()} kr/månad:
                </div>
                <div className="text-3xl font-bold text-blue-800 mb-2">
                  {getActualTaxAmount().toLocaleString()} kr
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
                  Netto (efter skatt):
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-3xl font-bold text-blue-800">
                    {getNetSalary().toLocaleString()} kr
                  </div>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={48}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value.toLocaleString()} kr`, '']}
                          labelFormatter={(label) => label}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
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
                : 'Ingen matchande inkomstgrupp hittades'
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
