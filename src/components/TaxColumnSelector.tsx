
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
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
  const getTotalIncome = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const isPercentageValue = (value: number, income: number): boolean => {
    if (value <= 100) {
      const potentialTaxAmount = (value / 100) * income;
      return potentialTaxAmount < income && value > 0;
    }
    return false;
  };

  const getTaxPercentage = (): string => {
    if (!taxAmount || getTotalIncome() === 0) return '0';
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    let percentage: number;
    if (isPercentageValue(taxAmountNum, getTotalIncome())) {
      // Tax amount is already a percentage
      percentage = taxAmountNum;
    } else {
      // Tax amount is in kr, convert to percentage
      percentage = (taxAmountNum / getTotalIncome()) * 100;
    }
    
    return percentage.toFixed(1);
  };

  const getActualTaxAmount = (): number => {
    if (!taxAmount || getTotalIncome() === 0) return 0;
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    if (isPercentageValue(taxAmountNum, getTotalIncome())) {
      // Convert percentage to actual amount
      return (taxAmountNum / 100) * getTotalIncome();
    } else {
      // Already in kr
      return taxAmountNum;
    }
  };

  const getNetSalary = (): number => {
    if (!taxAmount || getTotalIncome() === 0) return getTotalIncome();
    const actualTaxAmount = getActualTaxAmount();
    return getTotalIncome() - actualTaxAmount;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Skatteberäkning Resultat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Tax Result Display */}
          {result.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Skattesats för {result[0].Kommun}</h3>
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
                  <span className="font-semibold text-green-700">
                    {includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Skattetabell:</span>
                  <span className="font-semibold text-green-700">
                    {getSkattetabell(includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {kommun && taxAmount && getTotalIncome() > 0 ? (
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-lg font-medium text-green-700 mb-2">
                  Skatt för {getTotalIncome().toLocaleString()} kr/månad:
                </div>
                <div className="text-3xl font-bold text-green-800 mb-2">
                  {getActualTaxAmount().toLocaleString()} kr
                </div>
                <div className="text-lg font-medium text-green-600">
                  Du betalar {getTaxPercentage()}% i skatt
                </div>
              </div>
              
              <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-lg font-medium text-blue-700 mb-2">
                  Netto (efter skatt):
                </div>
                <div className="text-3xl font-bold text-blue-800">
                  {getNetSalary().toLocaleString()} kr
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-gray-50 border border-gray-200 rounded-lg">
              {!kommun 
                ? 'Gör en skattesats-sökning först'
                : getTotalIncome() === 0
                ? 'Ange månadsinkomst för att se skatteberäkning'
                : 'Ingen matchande inkomstgrupp hittades'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Table Chart */}
      {skattetabellData.length > 0 && getTotalIncome() > 0 && (
        <TaxTableChart 
          skattetabellData={skattetabellData}
          selectedTaxColumn={selectedTaxColumn}
          currentIncome={getTotalIncome()}
        />
      )}
    </div>
  );
};

export default TaxColumnSelector;
