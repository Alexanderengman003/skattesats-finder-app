
import React from 'react';

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
  return (
    <div className="p-6 bg-gradient-to-r from-slate-100 to-blue-100/60 border border-slate-200/60 rounded-2xl shadow-sm w-full">
      <div className="text-center">
        <div className="text-sm font-semibold text-slate-600 mb-2">
          Total skatt
        </div>
        <div className="text-3xl font-bold text-slate-800 mb-3 break-words">
          {Math.round(actualTaxAmount).toLocaleString()} kr
        </div>
        <div className="text-sm font-semibold text-slate-600 mb-3 break-words">
          Månadsinkomst (kr) beräknad på {Math.round(totalIncome).toLocaleString()} kr
        </div>
        <div className="text-sm font-semibold text-slate-700 mb-2">
          Du betalar <span className="font-bold text-blue-700 text-lg">{taxPercentage}%</span> i skatt
        </div>
        <div className="text-sm font-semibold text-slate-700">
          Din marginalskatt är <span className="font-bold text-blue-700 text-lg">{marginalTaxRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculationDisplay;
