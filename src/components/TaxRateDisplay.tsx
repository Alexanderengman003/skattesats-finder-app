
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TaxRateDisplayProps {
  result: any[];
  includeSvenskaKyrkan: boolean;
  getSkattetabell: (taxRate: number) => number;
}

const TaxRateDisplay = ({ result, includeSvenskaKyrkan, getSkattetabell }: TaxRateDisplayProps) => {
  const { t } = useLanguage();

  if (result.length === 0) return null;

  return (
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
      <h3 className="font-semibold text-blue-800 mb-2">{t('taxRateFor')} {result[0].Kommun}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>{t('municipalTax')}</span>
          <span className="font-medium">{result[0].KommunalSkatt}%</span>
        </div>
        <div className="flex justify-between">
          <span>{t('countyTax')}</span>
          <span className="font-medium">{result[0].LandstingsSkatt}%</span>
        </div>
        {includeSvenskaKyrkan && (
          <div className="flex justify-between">
            <span>{t('churchFee')}</span>
            <span className="font-medium">{result[0].Kyrkoavgift}%</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-1 mt-2">
          <span className="font-semibold">{t('totalTaxRate')}</span>
          <span className="font-semibold text-blue-700">
            {includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">{t('taxTable')}</span>
          <span className="font-semibold text-blue-700">
            {getSkattetabell(includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaxRateDisplay;
