
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
}

const TaxColumnSelector = ({
  age,
  onAgeChange,
  incomeType,
  onIncomeTypeChange,
  isPensionContributing,
  onPensionContributingChange,
  birthYear,
  onBirthYearChange
}: TaxColumnSelectorProps) => {
  const getCurrentColumn = (): number => {
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

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Bestäm Skattekolumn
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Ålder vid årets ingång</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => onAgeChange(parseInt(e.target.value) || 0)}
              placeholder="Ange ålder"
              min="0"
              max="120"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="birthYear">Födelseår</Label>
            <Input
              id="birthYear"
              type="number"
              value={birthYear}
              onChange={(e) => onBirthYearChange(parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="Ange födelseår"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
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
      </CardContent>
    </Card>
  );
};

export default TaxColumnSelector;
