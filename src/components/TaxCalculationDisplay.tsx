
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaxCalculationDisplayProps {
  totalIncome: number;
  actualTaxAmount: number;
  taxPercentage: string;
  marginalTaxRate: string;
}

const TaxCalculationDisplay = ({ 
  totalIncome, 
  actualTaxAmount, 
  taxPercentage, 
  marginalTaxRate 
}: TaxCalculationDisplayProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
      <div className="text-center">
        <div className="text-sm font-medium text-black mb-1">
          {t('totalTax')}
        </div>
        <div className="text-2xl font-bold text-black mb-2 break-words">
          {Math.round(actualTaxAmount).toLocaleString()} kr
        </div>
        <div className="text-sm font-medium text-black mb-2 break-words">
          {t('taxCalculatedOn')} {Math.round(totalIncome).toLocaleString()} kr
        </div>
        <div className="text-sm font-medium text-black mb-1">
          {t('youPay')} <span className="font-bold">{taxPercentage}%</span> {t('inTax')}
        </div>
        <div className="text-sm font-medium text-black">
          {t('marginalTax')} <span className="font-bold">{marginalTaxRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculationDisplay;
