
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  taxableBenefit
}: EngangsbeskattningCardProps) => {
  const getYearlyIncomeBreakdown = () => {
    const baseMonthlyIncome = monthlyIncome + taxableBenefit;
    const breakdown = [];
    
    if (adjustedSalary > 0 && adjustedMonths > 0 && adjustedMonths <= 12) {
      const remainingMonths = 12 - adjustedMonths;
      breakdown.push(`Justerad lön: ${adjustedSalary.toLocaleString()} kr × ${adjustedMonths} månader = ${(adjustedSalary * adjustedMonths).toLocaleString()} kr`);
      if (remainingMonths > 0) {
        breakdown.push(`Nuvarande lön: ${baseMonthlyIncome.toLocaleString()} kr × ${remainingMonths} månader = ${(baseMonthlyIncome * remainingMonths).toLocaleString()} kr`);
      }
    } else {
      breakdown.push(`Månadslön: ${baseMonthlyIncome.toLocaleString()} kr × 12 månader = ${(baseMonthlyIncome * 12).toLocaleString()} kr`);
    }
    
    if (additionalIncome > 0) {
      breakdown.push(`Övrig inkomst: ${additionalIncome.toLocaleString()} kr`);
    }
    
    if (engangsbeskattningAmount > 0) {
      breakdown.push(`Engångsbelopp: ${engangsbeskattningAmount.toLocaleString()} kr`);
    }
    
    return breakdown;
  };

  return (
    <Card className="shadow-lg rounded-xl w-full">
      <CardContent className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-blue-800">
            Beskattning på engångsbelopp
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Left Column - Input */}
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="engangsbeskattningAmount" className="flex items-center gap-2">
                Engångsbelopp (kr)
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Som engångsbelopp räknas ersättning för arbete som inte avser en bestämd tidsperiod eller inte betalas ut regelbundet.</p>
                      <br />
                      <p>Till sådana ersättningar räknas</p>
                      <ul className="list-disc pl-4 mt-2">
                        <li>vissa slag av ackordsersättningar</li>
                        <li>retroaktiv lön</li>
                        <li>semesterersättning</li>
                        <li>tantiem (andel i vinst som tillägg till lön)</li>
                        <li>vissa provisioner och arvoden</li>
                        <li>avgångsvederlag</li>
                        <li>retroaktiv livränta</li>
                      </ul>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="engangsbeskattningAmount"
                type="number"
                value={engangsbeskattningAmount || ''}
                onChange={onEngangsbeskattningAmountChange}
                placeholder="Ange engångsbelopp"
                min="0"
                max="1000000000"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalIncome" className="flex items-center gap-2">
                Övrig inkomst (kr)
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Här kan du lägga till övrig inkomst under året som räknas in i din årslön enligt Skatteverket.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="additionalIncome"
                type="number"
                value={additionalIncome || ''}
                onChange={onAdditionalIncomeChange}
                placeholder="Ange övrig inkomst"
                min="0"
                max="1000000000"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustedSalary" className="flex items-center gap-2">
                Justera lön (kr)
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Om du har haft en annan lön än den du angav tidigare under året, kan du fylla i din tidigare lön för att få en så korrekt uträkning som möjligt. Fyll även i nedan hur många månader du hade den tidigare lönen.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="adjustedSalary"
                type="number"
                value={adjustedSalary || ''}
                onChange={onAdjustedSalaryChange}
                placeholder="Ange justerad månadslön"
                min="0"
                max="1000000000"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustedMonths" className="flex items-center gap-2">
                Antal månader
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Här fyller du i hur många månader innevarande år som du hade din tidigare lön, för att få en så korrekt uträkning som möjligt</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="adjustedMonths"
                type="number"
                value={adjustedMonths || ''}
                onChange={onAdjustedMonthsChange}
                placeholder="Antal månader med justerad lön"
                min="0"
                max="12"
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="text-center w-full">
            {engangsbeskattningLoading ? (
              <div className="text-gray-500">Beräknar...</div>
            ) : engangsbeskattningError ? (
              <div className="text-red-600">
                <div className="font-medium mb-1">Fel vid hämtning av data</div>
                <div className="text-sm">{engangsbeskattningError}</div>
              </div>
            ) : engangsbeskattningData.length > 0 ? (
              <div>
                <div className="text-sm font-medium text-black mb-1">
                  Du betalar
                </div>
                <div className="text-2xl font-bold text-black mb-1">
                  {getEngangsbeskattningRate()}%
                </div>
                <div className="text-sm font-medium text-black">
                  I engångsskatt
                </div>
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <div className="text-sm text-gray-600 break-words">
                    På ett engångsbelopp om {engangsbeskattningAmount.toLocaleString()} kr betalar du{' '}
                    <span className="font-bold">
                      {Math.round(calculateEngangsbeskattning(engangsbeskattningAmount)).toLocaleString()} kr
                    </span>{' '}
                    i skatt
                  </div>
                  <div className="text-xs text-gray-500 mt-2 break-words">
                    Baserat på total årslön: {calculateYearlyIncome().toLocaleString()} kr
                  </div>
                  <div className="text-xs text-gray-500 mt-3 text-left bg-white/60 p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="font-semibold mb-2 text-gray-700">Årslönen inkluderar:</div>
                    <div className="space-y-1.5">
                      {getYearlyIncomeBreakdown().map((item, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Ingen data tillgänglig för år {selectedYear}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngangsbeskattningCard;
