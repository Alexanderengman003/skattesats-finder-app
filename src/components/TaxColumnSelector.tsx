
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { useTaxCalculations } from '@/hooks/useTaxCalculations';
import TaxRateDisplay from './TaxRateDisplay';
import TaxCalculationDisplay from './TaxCalculationDisplay';
import TaxPieChart from './TaxPieChart';
import EngangsbeskattningCard from './EngangsbeskattningCard';

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
  selectedYear,
  getSkattetabell,
  taxableBenefit,
  skattetabellData
}: TaxColumnSelectorProps) => {
  const {
    engangsbeskattningData,
    engangsbeskattningLoading,
    engangsbeskattningError,
    engangsbeskattningAmount,
    setEngangsbeskattningAmount,
    additionalIncome,
    setAdditionalIncome,
    adjustedSalary,
    setAdjustedSalary,
    adjustedMonths,
    setAdjustedMonths,
    getTotalIncomeForTax,
    getTaxPercentage,
    getActualTaxAmount,
    getNetSalary,
    getMarginalTaxRate,
    getEngangsbeskattningRate,
    calculateEngangsbeskattning,
    calculateYearlyIncome
  } = useTaxCalculations({
    monthlyIncome,
    taxableBenefit,
    taxAmount,
    selectedTaxColumn,
    skattetabellData,
    selectedYear
  });

  const handleEngangsbeskattningAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setEngangsbeskattningAmount(cappedValue);
  };

  const handleAdditionalIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setAdditionalIncome(cappedValue);
  };

  const handleAdjustedSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setAdjustedSalary(cappedValue);
  };

  const handleAdjustedMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(Math.max(0, numericValue), 12);
    setAdjustedMonths(cappedValue);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="shadow-xl rounded-2xl border-0 overflow-hidden w-full">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <Calculator className="h-6 w-6" />
            Skatteberäkning
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-slate-50 to-blue-50/30 w-full">
          {/* Tax Result Display - Side by Side Layout */}
          {result.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full">
              <TaxRateDisplay 
                result={result}
                includeSvenskaKyrkan={includeSvenskaKyrkan}
                getSkattetabell={getSkattetabell}
              />

              {kommun && taxAmount && getTotalIncomeForTax() > 0 && (
                <TaxCalculationDisplay
                  totalIncome={getTotalIncomeForTax()}
                  actualTaxAmount={getActualTaxAmount()}
                  taxPercentage={getTaxPercentage()}
                  marginalTaxRate={getMarginalTaxRate()}
                />
              )}
            </div>
          )}

          {kommun && taxAmount && getTotalIncomeForTax() > 0 ? (
            <div className="space-y-6 w-full">
              {/* Net Salary Display with Pie Chart */}
              <TaxPieChart 
                netSalary={getNetSalary()}
                taxAmount={getActualTaxAmount()}
              />

              {/* Engångsbeskattning Card */}
              <EngangsbeskattningCard
                engangsbeskattningAmount={engangsbeskattningAmount}
                onEngangsbeskattningAmountChange={handleEngangsbeskattningAmountChange}
                additionalIncome={additionalIncome}
                onAdditionalIncomeChange={handleAdditionalIncomeChange}
                adjustedSalary={adjustedSalary}
                onAdjustedSalaryChange={handleAdjustedSalaryChange}
                adjustedMonths={adjustedMonths}
                onAdjustedMonthsChange={handleAdjustedMonthsChange}
                engangsbeskattningLoading={engangsbeskattningLoading}
                engangsbeskattningError={engangsbeskattningError}
                engangsbeskattningData={engangsbeskattningData}
                getEngangsbeskattningRate={getEngangsbeskattningRate}
                calculateEngangsbeskattning={calculateEngangsbeskattning}
                calculateYearlyIncome={calculateYearlyIncome}
                selectedYear={selectedYear}
              />
            </div>
          ) : (
            <div className="text-center text-slate-600 py-12 bg-gradient-to-r from-slate-100 to-blue-100/60 border border-slate-200/60 rounded-2xl w-full">
              <div className="text-lg font-medium">
                {!kommun 
                  ? 'Gör en skattesats-sökning först'
                  : getTotalIncomeForTax() === 0
                  ? 'Ange månadsinkomst (kr) för att se skatteberäkning'
                  : 'Beräknar skatt...'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxColumnSelector;
