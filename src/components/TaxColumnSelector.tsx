
import React from 'react';
import { Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTaxCalculations } from '@/hooks/useTaxCalculations';
import CollapsibleCard from './CollapsibleCard';
import TaxRateDisplay from './TaxRateDisplay';
import TaxCalculationDisplay from './TaxCalculationDisplay';
import TaxPieChart from './TaxPieChart';
import TaxTableDisplay from './TaxTableDisplay';
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
  hasCollectiveAgreement: boolean;
  setHasCollectiveAgreement: (value: boolean) => void;
  vacationDays: number;
  setVacationDays: (days: number) => void;
  variableSalary: number;
  setVariableSalary: (salary: number) => void;
  calculateVacationPay: () => number;
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
  skattetabellData,
  hasCollectiveAgreement,
  setHasCollectiveAgreement,
  vacationDays,
  setVacationDays,
  variableSalary,
  setVariableSalary,
  calculateVacationPay
}: TaxColumnSelectorProps) => {
  const { t } = useLanguage();
  
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
    selectedYear,
    hasCollectiveAgreement,
    vacationDays,
    variableSalary
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
      <CollapsibleCard
        title={t('taxCalculation')}
        icon={<Calculator className="h-5 w-5" />}
      >
        {/* Tax Result Display - Side by Side Layout */}
        {result.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
            <CollapsibleCard
              title={t('taxRate')}
              defaultOpen={true}
              headerClassName="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-t-xl"
              contentClassName="p-4 bg-green-50 rounded-b-xl"
            >
              <TaxRateDisplay 
                result={result}
                includeSvenskaKyrkan={includeSvenskaKyrkan}
                getSkattetabell={getSkattetabell}
              />
            </CollapsibleCard>

            {kommun && taxAmount && getTotalIncomeForTax() > 0 && (
              <CollapsibleCard
                title={t('taxCalculation')}
                defaultOpen={true}
                headerClassName="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-t-xl"
                contentClassName="p-4 bg-purple-50 rounded-b-xl"
              >
                <TaxCalculationDisplay
                  totalIncome={getTotalIncomeForTax()}
                  actualTaxAmount={getActualTaxAmount()}
                  taxPercentage={getTaxPercentage()}
                  marginalTaxRate={getMarginalTaxRate()}
                />
              </CollapsibleCard>
            )}
          </div>
        )}

        {kommun && taxAmount && getTotalIncomeForTax() > 0 ? (
          <div className="space-y-4 w-full">
            {/* Pie Chart and Tax Table - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CollapsibleCard
                title={t('taxBreakdown')}
                defaultOpen={true}
                headerClassName="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-xl"
                contentClassName="p-4 bg-orange-50 rounded-b-xl"
              >
                <TaxPieChart 
                  netSalary={getNetSalary()}
                  taxAmount={getActualTaxAmount()}
                />
              </CollapsibleCard>
              
              <TaxTableDisplay
                skattetabellData={skattetabellData}
                selectedTaxColumn={selectedTaxColumn}
                currentIncome={getTotalIncomeForTax()}
              />
            </div>

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
              monthlyIncome={monthlyIncome}
              taxableBenefit={taxableBenefit}
              calculateVacationPay={calculateVacationPay}
              hasCollectiveAgreement={hasCollectiveAgreement}
              vacationDays={vacationDays}
              variableSalary={variableSalary}
            />
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 bg-blue-100 border border-blue-300 rounded-xl w-full">
            {!kommun 
              ? t('enterMunicipality')
              : getTotalIncomeForTax() === 0
              ? t('enterIncomeToSee')
              : t('calculatingTax')
            }
          </div>
        )}
      </CollapsibleCard>
    </div>
  );
};

export default TaxColumnSelector;
