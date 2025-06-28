
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HelpCircle, Palmtree } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VacationPayCardProps {
  hasCollectiveAgreement: boolean;
  onHasCollectiveAgreementChange: (hasAgreement: boolean) => void;
  vacationDays: number;
  onVacationDaysChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variableSalary: number;
  onVariableSalaryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateVacationPay: () => number;
  monthlyIncome: number;
}

const VacationPayCard = ({
  hasCollectiveAgreement,
  onHasCollectiveAgreementChange,
  vacationDays,
  onVacationDaysChange,
  variableSalary,
  onVariableSalaryChange,
  calculateVacationPay,
  monthlyIncome
}: VacationPayCardProps) => {
  const getVacationPayBreakdown = () => {
    if (monthlyIncome === 0) return [];
    
    const breakdown = [];
    
    if (hasCollectiveAgreement) {
      const fixedVacationPay = vacationDays * 0.008 * monthlyIncome;
      breakdown.push(`Fast lön: ${vacationDays} dagar × 0,8% × ${monthlyIncome.toLocaleString()} kr = ${Math.round(fixedVacationPay).toLocaleString()} kr`);
      
      if (variableSalary > 0) {
        const variableVacationPay = vacationDays * 0.005 * variableSalary;
        breakdown.push(`Rörlig lön: ${vacationDays} dagar × 0,5% × ${variableSalary.toLocaleString()} kr = ${Math.round(variableVacationPay).toLocaleString()} kr`);
      }
    } else {
      const fixedVacationPay = vacationDays * 0.0043 * monthlyIncome;
      breakdown.push(`Fast lön: ${vacationDays} dagar × 0,43% × ${monthlyIncome.toLocaleString()} kr = ${Math.round(fixedVacationPay).toLocaleString()} kr`);
      
      if (variableSalary > 0) {
        const variableVacationPay = vacationDays * (0.12 * variableSalary) / 25;
        breakdown.push(`Rörlig lön: ${vacationDays} dagar × (12% × ${variableSalary.toLocaleString()} kr)/25 = ${Math.round(variableVacationPay).toLocaleString()} kr`);
      }
    }
    
    return breakdown;
  };

  return (
    <Card className="shadow-lg rounded-xl w-full">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <Palmtree className="h-5 w-5" />
          Semestertillägg
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-orange-50 border border-orange-200 rounded-b-xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Left Column - Input */}
          <div className="space-y-4 w-full">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="collectiveAgreement" 
                checked={hasCollectiveAgreement}
                onCheckedChange={(checked) => onHasCollectiveAgreementChange(checked === true)}
              />
              <Label htmlFor="collectiveAgreement" className="flex items-center gap-2">
                Kollektivavtal
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Med kollektivavtal: 0,8% för fast lön + 0,5% för rörlig lön</p>
                      <p>Utan kollektivavtal: 0,43% för fast lön + (12% × rörlig lön)/25</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacationDays">Antal semesterdagar</Label>
              <Input
                id="vacationDays"
                type="number"
                value={vacationDays || ''}
                onChange={onVacationDaysChange}
                placeholder="Antal semesterdagar"
                min="0"
                max="50"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableSalary" className="flex items-center gap-2">
                Rörlig månadslön (kr)
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Rörlig lön som provision, bonus eller liknande ersättningar som varierar från månad till månad.</p>
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="variableSalary"
                type="number"
                value={variableSalary || ''}
                onChange={onVariableSalaryChange}
                placeholder="Ange rörlig månadslön"
                min="0"
                max="1000000000"
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="text-center w-full">
            {monthlyIncome > 0 ? (
              <div>
                <div className="text-sm font-medium text-orange-600 mb-1">
                  Semestertillägg
                </div>
                <div className="text-2xl font-bold text-orange-800 mb-1">
                  {calculateVacationPay().toLocaleString()} kr
                </div>
                <div className="text-sm font-medium text-orange-600">
                  {hasCollectiveAgreement ? 'Med kollektivavtal' : 'Utan kollektivavtal'}
                </div>
                
                <div className="text-xs text-gray-500 mt-3 text-left bg-white/60 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="font-semibold mb-2 text-gray-700">Beräkning:</div>
                  <div className="space-y-1.5">
                    {getVacationPayBreakdown().map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                        <span className="text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Ange månadsinkomst för att beräkna semestertillägg
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationPayCard;
