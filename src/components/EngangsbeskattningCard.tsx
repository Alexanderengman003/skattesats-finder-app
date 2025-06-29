
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, Percent, Calendar, Banknote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EngangsbeskattningCardProps {
  engangsbeskattningAmount: number;
  onEngangsbeskattningAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalIncome: number;
  onAdditionalIncomeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  adjustedSalary: number;
  onAdjustedSalaryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  adjustedMonths: number;
  onAdjustedMonthsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  engangsbeskattningLoading: boolean;
  engangsbeskattningError: string | null;
  engangsbeskattningData: any[];
  getEngangsbeskattningRate: () => number;
  calculateEngangsbeskattning: (amount: number) => number;
  calculateYearlyIncome: () => number;
  selectedYear: number | null;
  monthlyIncome: number;
  taxableBenefit: number;
  calculateVacationPay: () => number;
  hasCollectiveAgreement: boolean;
  vacationDays: number;
  variableSalary: number;
}

const EngangsbeskattningCard = ({
  engangsbeskattningAmount,
  onEngangsbeskattningAmountChange,
  additionalIncome,
  onAdditionalIncomeChange,
  adjustedSalary,
  onAdjustedSalaryChange,
  adjustedMonths,
  onAdjustedMonthsChange,
  engangsbeskattningLoading,
  engangsbeskattningError,
  engangsbeskattningData,
  getEngangsbeskattningRate,
  calculateEngangsbeskattning,
  calculateYearlyIncome,
  selectedYear,
  monthlyIncome,
  taxableBenefit,
  calculateVacationPay,
  hasCollectiveAgreement,
  vacationDays,
  variableSalary
}: EngangsbeskattningCardProps) => {
  const { t } = useLanguage();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const yearlyIncome = calculateYearlyIncome();
  const vacationPay = calculateVacationPay();
  const baseSalary = (monthlyIncome + taxableBenefit) * 12;

  return (
    <Card className="shadow-lg rounded-xl border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-xl py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-4 w-4" />
          {t('engangsbeskattning')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 bg-orange-50 rounded-b-xl space-y-4">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="engangsbeskattning" className="text-sm font-medium text-orange-900">
              {t('engangsbeskattningAmount')}
            </Label>
            <Input
              id="engangsbeskattning"
              type="number"
              value={engangsbeskattningAmount}
              onChange={onEngangsbeskattningAmountChange}
              placeholder="10000"
              className="bg-white border-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalIncome" className="text-sm font-medium text-orange-900">
              {t('additionalIncome')}
            </Label>
            <Input
              id="additionalIncome"
              type="number"
              value={additionalIncome}
              onChange={onAdditionalIncomeChange}
              placeholder="0"
              className="bg-white border-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustedSalary" className="text-sm font-medium text-orange-900">
              {t('adjustedSalary')}
            </Label>
            <Input
              id="adjustedSalary"
              type="number"
              value={adjustedSalary}
              onChange={onAdjustedSalaryChange}
              placeholder="0"
              className="bg-white border-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustedMonths" className="text-sm font-medium text-orange-900">
              {t('adjustedMonths')}
            </Label>
            <Input
              id="adjustedMonths"
              type="number"
              value={adjustedMonths}
              onChange={onAdjustedMonthsChange}
              placeholder="0"
              min="0"
              max="12"
              className="bg-white border-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <Separator className="bg-orange-200" />

        {/* Annual Income Breakdown */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('yearlyIncomeBreakdown')}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('baseSalary')} ({formatCurrency(monthlyIncome + taxableBenefit)} × 12):</span>
                <span className="font-medium">{formatCurrency(baseSalary)}</span>
              </div>
              
              {vacationPay > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('vacationPay')} ({vacationDays} {t('days')}):</span>
                  <span className="font-medium">{formatCurrency(vacationPay)}</span>
                </div>
              )}
              
              {additionalIncome > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('additionalIncome')}:</span>
                  <span className="font-medium">{formatCurrency(additionalIncome)}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {engangsbeskattningAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('engangsbeskattningAmount')}:</span>
                  <span className="font-medium">{formatCurrency(engangsbeskattningAmount)}</span>
                </div>
              )}
              
              {adjustedSalary > 0 && adjustedMonths > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('adjustedSalary')} ({formatCurrency(adjustedSalary)} × {adjustedMonths} {t('months')}):</span>
                  <span className="font-medium">{formatCurrency(adjustedSalary * adjustedMonths)}</span>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-3 bg-orange-200" />
          
          <div className="flex justify-between items-center">
            <span className="font-semibold text-orange-900">{t('totalYearlyIncome')}:</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-900 px-3 py-1">
              {formatCurrency(yearlyIncome)}
            </Badge>
          </div>
        </div>

        {/* Engångsbeskattning Results */}
        {engangsbeskattningAmount > 0 && (
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {t('engangsbeskattningCalculation')}
            </h4>
            
            {engangsbeskattningLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">{t('calculating')}...</p>
              </div>
            )}
            
            {engangsbeskattningError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {engangsbeskattningError}
              </div>
            )}
            
            {!engangsbeskattningLoading && !engangsbeskattningError && engangsbeskattningData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    {t('engangsbeskattningRate')}:
                  </span>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    {getEngangsbeskattningRate().toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    {t('preliminaryTaxDeduction')}:
                  </span>
                  <span className="font-semibold text-orange-900">
                    {formatCurrency(calculateEngangsbeskattning(engangsbeskattningAmount))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">{t('netAmount')}:</span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(engangsbeskattningAmount - calculateEngangsbeskattning(engangsbeskattningAmount))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EngangsbeskattningCard;
