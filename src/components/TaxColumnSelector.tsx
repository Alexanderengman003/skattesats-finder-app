import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  incomeType,
  onIncomeTypeChange,
  isPensionContributing,
  onPensionContributingChange,
  monthlyIncome,
  onMonthlyIncomeChange,
  birthday,
  onBirthdayChange,
  taxAmount,
  kommun,
  selectedTaxColumn,
  result,
  includeSvenskaKyrkan,
  selectedYear,
  getSkattetabell,
  onTriggerCalculation,
  taxableBenefit,
  onTaxableBenefitChange,
  skattetabellData
}: TaxColumnSelectorProps) => {
  const getCurrentColumn = (): number => {
    if (!birthday) return 1;
    
    const birthDate = new Date(birthday);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDate.getFullYear();
    const birthYear = birthDate.getFullYear();
    
    const isOver66 = age >= 66;
    const isBorn1937OrEarlier = birthYear <= 1937;
    const isBorn1938OrLater = birthYear >= 1938;

    switch (incomeType) {
      case 'salary':
        if (!isOver66) {
          return 1; // Kolumn 1: Löner för under 66 år med jobbskatteavdrag
        } else {
          return 3; // Kolumn 3: Löner för över 66 år med förhöjt jobbskatteavdrag
        }
      case 'pension':
        if (isOver66) {
          return 2; // Kolumn 2: Pensioner för över 66 år
        } else {
          return 6; // Kolumn 6: Pensioner för under 66 år
        }
      case 'disability':
        return 4; // Kolumn 4: Sjuk- och aktivitetsersättning
      case 'unemployment':
        if (isBorn1938OrLater && isPensionContributing) {
          return 5; // Kolumn 5: Andra pensionsgrundande ersättningar
        }
        return 1; // Default to kolumn 1 if conditions not met
      default:
        return 1;
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    onMonthlyIncomeChange(numericValue);
  };

  const handleTaxableBenefitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    onTaxableBenefitChange(numericValue);
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Basic validation for date format
    if (value && value.length === 10) {
      const date = new Date(value);
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      
      // Validate year is reasonable (between 1900 and current year)
      if (year >= 1900 && year <= currentYear && !isNaN(date.getTime())) {
        onBirthdayChange(value);
      }
    } else {
      onBirthdayChange(value);
    }
  };

  // Trigger calculation whenever relevant values change
  useEffect(() => {
    if (kommun && (monthlyIncome > 0 || taxableBenefit > 0) && birthday) {
      onTriggerCalculation();
    }
  }, [birthday, incomeType, isPensionContributing, monthlyIncome, taxableBenefit, kommun, onTriggerCalculation]);

  const getTotalIncome = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const getTaxPercentage = (): string => {
    if (!taxAmount || getTotalIncome() === 0) return '0';
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    const percentage = (taxAmountNum / getTotalIncome()) * 100;
    return percentage.toFixed(1);
  };

  const getNetSalary = (): number => {
    if (!taxAmount || getTotalIncome() === 0) return getTotalIncome();
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    return getTotalIncome() - taxAmountNum;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bestäm Skattekolumn & Beräkning
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthday">Födelsedatum</Label>
            <Input
              id="birthday"
              type="date"
              value={birthday}
              onChange={handleBirthdayChange}
              placeholder="Välj födelsedatum"
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">Månadsinkomst (kr)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              value={monthlyIncome || ''}
              onChange={handleIncomeChange}
              placeholder="Ange månadsinkomst"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxableBenefit">Beskattningsbar förmån (kr)</Label>
            <Input
              id="taxableBenefit"
              type="number"
              value={taxableBenefit || ''}
              onChange={handleTaxableBenefitChange}
              placeholder="Ange beskattningsbar förmån"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incomeType">Typ av inkomst</Label>
            <Select onValueChange={onIncomeTypeChange} value={incomeType}>
              <SelectTrigger>
                <SelectValue placeholder="Välj inkomsttyp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Lön, arvode och liknande ersättningar</SelectItem>
                <SelectItem value="pension">Pension och andra ersättningar</SelectItem>
                <SelectItem value="disability">Sjuk- och aktivitetsersättning</SelectItem>
                <SelectItem value="unemployment">Ersättning från arbetslöshetskassa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {incomeType === 'unemployment' && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pensionContributing" 
                checked={isPensionContributing}
                onCheckedChange={(checked) => onPensionContributingChange(checked === true)}
              />
              <Label htmlFor="pensionContributing">
                Utgör grund för allmän pensionsavgift
              </Label>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <span className="text-sm font-medium text-blue-600">Använd skattekolumn:</span>
              <div className="text-2xl font-bold text-blue-800">
                Kolumn {getCurrentColumn()}
              </div>
            </div>
          </div>

          {/* Tax Result Display */}
          <div className="mt-4">
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
                    {taxAmount} kr
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
          </div>
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
