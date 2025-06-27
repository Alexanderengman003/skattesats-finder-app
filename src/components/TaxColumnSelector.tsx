
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';

interface TaxColumnSelectorProps {
  age: number;
  onAgeChange: (age: number) => void;
  incomeType: string;
  onIncomeTypeChange: (type: string) => void;
  isPensionContributing: boolean;
  onPensionContributingChange: (contributing: boolean) => void;
  birthYear: number;
  onBirthYearChange: (year: number) => void;
  monthlyIncome: number;
  onMonthlyIncomeChange: (income: number) => void;
  birthday: string;
  onBirthdayChange: (birthday: string) => void;
  taxAmount: string | null;
  kommun: string;
  selectedTaxColumn: number;
}

const TaxColumnSelector = ({
  incomeType,
  onIncomeTypeChange,
  isPensionContributing,
  onPensionContributingChange,
  monthlyIncome,
  onMonthlyIncomeChange,
  birthday,
  onBirthdayChange,
  taxAmount,
  kommun,
  selectedTaxColumn
}: TaxColumnSelectorProps) => {
  const getCurrentColumn = (): number => {
    if (!birthday) return 1;
    
    const birthDate = new Date(birthday);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDate.getFullYear();
    const birthYear = birthDate.getFullYear();
    
    const isOver66 = age >= 66;
    const isBorn1937OrEarlier = birthYear <= 1937;
    const isBorn1938OrLater = birthYear >= 1938;

    switch (incomeType) {
      case 'salary':
        if (!isOver66) {
          return 1; // Kolumn 1: Löner för under 66 år med jobbskatteavdrag
        } else {
          return 3; // Kolumn 3: Löner för över 66 år med förhöjt jobbskatteavdrag
        }
      case 'pension':
        if (isOver66) {
          return 2; // Kolumn 2: Pensioner för över 66 år
        } else {
          return 6; // Kolumn 6: Pensioner för under 66 år
        }
      case 'disability':
        return 4; // Kolumn 4: Sjuk- och aktivitetsersättning
      case 'unemployment':
        if (isBorn1938OrLater && isPensionContributing) {
          return 5; // Kolumn 5: Andra pensionsgrundande ersättningar
        }
        return 1; // Default to kolumn 1 if conditions not met
      default:
        return 1;
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove leading zeros and convert to number
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    onMonthlyIncomeChange(numericValue);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Bestäm Skattekolumn & Beräkning
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birthday">Födelsedatum</Label>
          <Input
            id="birthday"
            type="date"
            value={birthday}
            onChange={(e) => onBirthdayChange(e.target.value)}
            placeholder="Välj födelsedatum"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyIncome">Månadsinkomst (kr)</Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={monthlyIncome || ''}
            onChange={handleIncomeChange}
            placeholder="Ange månadsinkomst"
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incomeType">Typ av inkomst</Label>
          <Select onValueChange={onIncomeTypeChange} value={incomeType}>
            <SelectTrigger>
              <SelectValue placeholder="Välj inkomsttyp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salary">Lön, arvode och liknande ersättningar</SelectItem>
              <SelectItem value="pension">Pension och andra ersättningar</SelectItem>
              <SelectItem value="disability">Sjuk- och aktivitetsersättning</SelectItem>
              <SelectItem value="unemployment">Ersättning från arbetslöshetskassa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {incomeType === 'unemployment' && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pensionContributing" 
              checked={isPensionContributing}
              onCheckedChange={(checked) => onPensionContributingChange(checked === true)}
            />
            <Label htmlFor="pensionContributing">
              Utgör grund för allmän pensionsavgift
            </Label>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <span className="text-sm font-medium text-blue-600">Använd skattekolumn:</span>
            <div className="text-2xl font-bold text-blue-800">
              Kolumn {getCurrentColumn()}
            </div>
          </div>
        </div>

        {/* Tax Result Display */}
        <div className="mt-4">
          {kommun && taxAmount && monthlyIncome > 0 ? (
            <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-lg font-medium text-green-700 mb-2">
                Skatt för {monthlyIncome.toLocaleString()} kr/månad:
              </div>
              <div className="text-4xl font-bold text-green-800">
                {taxAmount} kr
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Baserat på kolumn {selectedTaxColumn} för {kommun}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-gray-50 border border-gray-200 rounded-lg">
              {!kommun 
                ? 'Gör en skattesats-sökning först'
                : !monthlyIncome 
                ? 'Ange månadsinkomst för att se skatteberäkning'
                : 'Ingen matchande inkomstgrupp hittades'
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxColumnSelector;
