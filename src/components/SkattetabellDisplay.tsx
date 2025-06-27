
import React from 'react';
import { SkatteverketData } from '@/utils/taxData';

interface SkattetabellDisplayProps {
  taxData: SkatteverketData[];
  includeSvenskaKyrkan: boolean;
}

const SkattetabellDisplay = ({ taxData, includeSvenskaKyrkan }: SkattetabellDisplayProps) => {
  const getSkattetabell = (taxRate: number): number => {
    // Round to nearest integer according to Swedish tax authority rules
    // 0.50 and above rounds up, below 0.50 rounds down
    const decimal = taxRate % 1;
    let roundedRate: number;
    
    if (decimal >= 0.50) {
      roundedRate = Math.ceil(taxRate);
    } else {
      roundedRate = Math.floor(taxRate);
    }
    
    // Ensure the table number is within the valid range (29-34)
    return Math.max(29, Math.min(34, roundedRate));
  };

  if (taxData.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {taxData.map((item, index) => {
        const taxRate = includeSvenskaKyrkan ? item.SummaInklKyrkoavgift : item.Skattesats;
        const skattetabell = getSkattetabell(taxRate);
        
        return (
          <div key={index} className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
              {item.Kommun} - {item.Församling} ({item.År})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-600 mb-1">
                  Total skatt / Skattetabell {includeSvenskaKyrkan ? '(inkl. kyrkoavgift)' : '(exkl. kyrkoavgift)'}
                </span>
                <div className="text-3xl font-bold text-green-700">
                  {taxRate}% / {skattetabell}
                </div>
              </div>
              
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-600 mb-1">
                  Kommunkod / Församlingskod
                </span>
                <div className="text-2xl font-bold text-blue-700">
                  {item.KommunKod} / {item.FörsamlingsKod}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Kommunal skatt:</span>
                <div className="text-lg font-bold text-blue-700">{item.KommunalSkatt}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Landstingsskatt:</span>
                <div className="text-lg font-bold text-blue-700">{item.LandstingsSkatt}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Kyrkoavgift:</span>
                <div className="text-lg font-bold text-purple-700">{item.Kyrkoavgift}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Begravningsavgift:</span>
                <div className="text-lg font-bold text-purple-700">{item.BegravningsAvgift}%</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SkattetabellDisplay;
