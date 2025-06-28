
import React from 'react';

interface TaxRateDisplayProps {
  result: any[];
  includeSvenskaKyrkan: boolean;
  getSkattetabell: (taxRate: number) => number;
}

const TaxRateDisplay = ({ result, includeSvenskaKyrkan, getSkattetabell }: TaxRateDisplayProps) => {
  if (result.length === 0) return null;

  return (
    <div className="p-6 bg-gradient-to-r from-slate-100 to-blue-100/60 border border-slate-200/60 rounded-2xl shadow-sm w-full">
      <h3 className="font-bold text-slate-800 mb-4 text-lg">Skattesats för {result[0].Kommun}</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Kommunal skatt:</span>
          <span className="font-bold text-slate-800">{result[0].KommunalSkatt}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-600 font-medium">Landstingsskatt:</span>
          <span className="font-bold text-slate-800">{result[0].LandstingsSkatt}%</span>
        </div>
        {includeSvenskaKyrkan && (
          <div className="flex justify-between items-center">
            <span className="text-slate-600 font-medium">Kyrkoavgift:</span>
            <span className="font-bold text-slate-800">{result[0].Kyrkoavgift}%</span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-4">
          <span className="font-bold text-slate-700">Total skattesats:</span>
          <span className="font-bold text-blue-700 text-lg">
            {includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-700">Skattetabell:</span>
          <span className="font-bold text-blue-700 text-lg">
            {getSkattetabell(includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaxRateDisplay;
