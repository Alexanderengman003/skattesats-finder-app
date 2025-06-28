
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Calendar } from 'lucide-react';

interface VacationPayCardProps {
  hasCollectiveAgreement: boolean;
  onHasCollectiveAgreementChange: (hasCollectiveAgreement: boolean) => void;
  vacationDays: number;
  onVacationDaysChange: (days: number) => void;
  variableSalary: number;
  onVariableSalaryChange: (salary: number) => void;
  vacationPayAmount: number;
  monthlyIncome: number;
}

const VacationPayCard = ({
  hasCollectiveAgreement,
  onHasCollectiveAgreementChange,
  vacationDays,
  onVacationDaysChange,
  variableSalary,
  onVariableSalaryChange,
  vacationPayAmount,
  monthlyIncome
}: VacationPayCardProps) => {
  const handleVacationDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(Math.max(0, numericValue), 50);
    onVacationDaysChange(cappedValue);
  };

  const handleVariableSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    onVariableSalaryChange(cappedValue);
  };

  return (
    <Card className="shadow-lg rounded-xl w-full">
      <CardHeader className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Semestertillägg
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 bg-green-50 rounded-b-xl space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="collectiveAgreement" 
            checked={hasCollectiveAgreement}
            onCheckedChange={(checked) => onHasCollectiveAgreementChange(checked === true)}
          />
          <Label htmlFor="collectiveAgreement" className="flex items-center gap-2">
            Kollektivavtal
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Med kollektivavtal: 0.8% för grundlön + 0.5% för rörlig lön</p>
                  <p>Utan kollektivavtal: 0.43% för grundlön + (12% / 25) för rörlig lön</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vacationDays">Antal semesterdagar</Label>
          <Input
            id="vacationDays"
            type="number"
            value={vacationDays || ''}
            onChange={handleVacationDaysChange}
            placeholder="Antal semesterdagar"
            min="0"
            max="50"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variableSalary">Rörlig lön per månad (kr)</Label>
          <Input
            id="variableSalary"
            type="number"
            value={variableSalary === 0 ? '' : variableSalary}
            onChange={handleVariableSalaryChange}
            placeholder="Rörlig månadslön"
            min="0"
            className="w-full"
          />
        </div>

        {/* Calculation Display */}
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-xl">
          <div className="text-sm space-y-2">
            <div className="font-semibold text-green-800">Beräkning av semestertillägg:</div>
            {hasCollectiveAgreement ? (
              <div className="space-y-1 text-green-700">
                <div>Grundlön: {vacationDays} × 0.8% × {monthlyIncome.toLocaleString()} kr = {(vacationDays * 0.008 * monthlyIncome).toLocaleString()} kr</div>
                <div>Rörlig lön: {vacationDays} × 0.5% × {variableSalary.toLocaleString()} kr = {(vacationDays * 0.005 * variableSalary).toLocaleString()} kr</div>
              </div>
            ) : (
              <div className="space-y-1 text-green-700">
                <div>Grundlön: {vacationDays} × 0.43% × {monthlyIncome.toLocaleString()} kr = {(vacationDays * 0.0043 * monthlyIncome).toLocaleString()} kr</div>
                <div>Rörlig lön: {vacationDays} × (12% × {variableSalary.toLocaleString()} kr)/25 = {(vacationDays * ((0.12 * variableSalary) / 25)).toLocaleString()} kr</div>
              </div>
            )}
            <div className="font-bold text-green-800 pt-2 border-t border-green-300">
              Totalt semestertillägg: {vacationPayAmount.toLocaleString()} kr
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VacationPayCard;
