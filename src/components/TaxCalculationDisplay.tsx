
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
    <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
      <div className="text-center">
        <div className="text-sm font-medium text-black mb-1">
          Total skatt
        </div>
        <div className="text-2xl font-bold text-black mb-2 break-words">
          {Math.round(actualTaxAmount).toLocaleString()} kr
        </div>
        <div className="text-sm font-medium text-black mb-2 break-words">
          Månadsinkomst (kr) beräknad på {Math.round(totalIncome).toLocaleString()} kr
        </div>
        <div className="text-sm font-medium text-black mb-1">
          Du betalar <span className="font-bold">{taxPercentage}%</span> i skatt
        </div>
        <div className="text-sm font-medium text-black">
          Din marginalskatt är <span className="font-bold">{marginalTaxRate}%</span>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculationDisplay;
