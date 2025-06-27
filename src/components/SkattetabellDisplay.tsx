
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info } from 'lucide-react';
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
    <Card className="shadow-lg mt-6">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Skattetabell
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">Om skattetabeller:</p>
              <p className="mb-2">
                I beräkningen av skattetabellerna ingår kommunal och statlig inkomstskatt på förvärvsinkomster, 
                allmän pensionsavgift, begravningsavgift och avgift till registrerat trossamfund.
              </p>
              <p className="mb-2">
                Skattesatsen avrundas uppåt om den är lika med eller över 0,50 och nedåt om den är under 0,50.
              </p>
            </div>
          </div>

          {taxData.map((item, index) => {
            const taxRate = includeSvenskaKyrkan ? item.SummaInklKyrkoavgift : item.Skattesats;
            const skattetabell = getSkattetabell(taxRate);
            
            return (
              <div key={index} className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
                  {item.Kommun} - {item.Församling}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="block text-sm font-medium text-gray-600 mb-1">
                      Total skattesats {includeSvenskaKyrkan ? '(inkl. kyrkoavgift)' : '(exkl. kyrkoavgift)'}
                    </span>
                    <div className="text-3xl font-bold text-green-700">
                      {taxRate}%
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="block text-sm font-medium text-gray-600 mb-1">
                      Din skattetabell
                    </span>
                    <div className="text-3xl font-bold text-blue-700">
                      Tabell {skattetabell}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="text-sm text-gray-600 text-center">
                    Skattetabell {skattetabell} används för kommunalskatt på {taxRate}% 
                    {taxRate % 1 >= 0.50 ? ' (avrundad uppåt)' : taxRate % 1 > 0 ? ' (avrundad nedåt)' : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkattetabellDisplay;
