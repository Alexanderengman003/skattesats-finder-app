import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Coins, MapPin, Calendar, List, HelpCircle } from 'lucide-react';
import KommunSearch from '@/components/KommunSearch';
import ForsamlingSelect from '@/components/ForsamlingSelect';
import TaxColumnSelector from '@/components/TaxColumnSelector';
import { 
  fetchTaxData, 
  findTaxRateFromAPI, 
  getAvailableMunicipalities,
  getAvailableForsamlingar,
  fetchSkattetabellData,
  SkatteverketData,
  SkattetabellData
} from '@/utils/taxData';
import VacationPayCard from '@/components/VacationPayCard';

const Index = () => {
  const [kommun, setKommun] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [forsamling, setForsamling] = useState('');
  const [result, setResult] = useState<SkatteverketData[]>([]);
  const [skattetabellData, setSkattetabellData] = useState<SkattetabellData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [skattetabellLoading, setSkattetabellLoading] = useState(false);
  const [apiData, setApiData] = useState<SkatteverketData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMunicipalities, setAvailableMunicipalities] = useState<string[]>([]);
  const [availableForsamlingar, setAvailableForsamlingar] = useState<string[]>([]);
  const [includeSvenskaKyrkan, setIncludeSvenskaKyrkan] = useState(false);
  const [incomeType, setIncomeType] = useState('salary');
  const [isPensionContributing, setIsPensionContributing] = useState(false);
  const [selectedTaxColumn, setSelectedTaxColumn] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [birthday, setBirthday] = useState('');
  const [taxableBenefit, setTaxableBenefit] = useState(0);
  const [hasCollectiveAgreement, setHasCollectiveAgreement] = useState(false);
  const [vacationDays, setVacationDays] = useState(25);
  const [variableSalary, setVariableSalary] = useState(0);

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

  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      try {
        const { data, years } = await fetchTaxData();
        setApiData(data);
        setAvailableYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]); // Set most recent year as default
        }
      } catch (error) {
        console.error('Failed to load API data:', error);
        setError('Kunde inte ladda data från Skatteverket API');
      } finally {
        setLoading(false);
      }
    };

    loadApiData();
  }, []);

  useEffect(() => {
    if (selectedYear && apiData.length > 0) {
      const municipalities = getAvailableMunicipalities(apiData, selectedYear);
      setAvailableMunicipalities(municipalities);
      
      // Only clear kommun if it's not available in the new year
      if (kommun && !municipalities.includes(kommun)) {
        setKommun('');
        setForsamling('');
        setResult([]);
      }
    }
  }, [selectedYear, apiData]);

  useEffect(() => {
    if (kommun && selectedYear && apiData.length > 0) {
      const forsamlingar = getAvailableForsamlingar(apiData, kommun, selectedYear);
      setAvailableForsamlingar(forsamlingar);
      
      // Auto-select first församling if there are multiple options
      if (forsamlingar.length > 1 && !forsamling) {
        setForsamling(forsamlingar[0]);
      } else if (forsamlingar.length <= 1) {
        setForsamling('');
      }
      
      setResult([]);
    }
  }, [kommun, selectedYear, apiData]);

  // New useEffect for automatic tax calculation
  useEffect(() => {
    const performAutomaticLookup = () => {
      if (!kommun.trim() || !selectedYear) {
        return;
      }

      // If there are multiple församlingar, wait for one to be selected
      if (availableForsamlingar.length > 1 && !forsamling) {
        return;
      }

      setError('');
      setResult([]);
      setSkattetabellData([]);

      const taxData = findTaxRateFromAPI(apiData, kommun.trim(), selectedYear, forsamling);
      
      if (taxData.length > 0) {
        setResult(taxData);
        const firstResult = taxData[0];
        const taxRate = includeSvenskaKyrkan ? firstResult.SummaInklKyrkoavgift : firstResult.Skattesats;
        const skattetabell = getSkattetabell(taxRate);
        loadSkattetabellData(selectedYear, skattetabell);
      } else {
        setError('Ingen data hittad för den valda kombinationen.');
      }
    };

    performAutomaticLookup();
  }, [kommun, selectedYear, forsamling, availableForsamlingar, apiData, includeSvenskaKyrkan]);

  const loadSkattetabellData = async (year: number, tabell: number) => {
    setSkattetabellLoading(true);
    try {
      const data = await fetchSkattetabellData(year, tabell);
      setSkattetabellData(data);
    } catch (error) {
      console.error('Failed to load skattetabell data:', error);
    } finally {
      setSkattetabellLoading(false);
    }
  };

  const getCurrentTaxColumn = (): number => {
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
          return 1;
        } else {
          return 3;
        }
      case 'pension':
        if (isOver66) {
          return 2;
        } else {
          return 6;
        }
      case 'disability':
        return 4;
      case 'unemployment':
        if (isBorn1938OrLater && isPensionContributing) {
          return 5;
        }
        return 1;
      default:
        return 1;
    }
  };

  useEffect(() => {
    setSelectedTaxColumn(getCurrentTaxColumn());
  }, [birthday, incomeType, isPensionContributing]);

  const getTaxFromColumn = (item: any, column: number): string => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    if (!taxValue || taxValue === 'Ej tillgänglig') {
      // If no tax value found and this is for high income, use the highest available tax rate
      if (skattetabellData.length > 0) {
        const lastBracket = skattetabellData[skattetabellData.length - 1];
        const lastTaxValue = lastBracket[columnKey];
        return lastTaxValue || 'Ej tillgänglig';
      }
      return 'Ej tillgänglig';
    }
    return taxValue;
  };

  const getFilteredSkattetabellData = (): SkattetabellData | null => {
    if (skattetabellData.length === 0) return null;
    
    const totalIncome = monthlyIncome + taxableBenefit;
    if (totalIncome === 0) return null;
    
    // Find matching bracket or use the last one if income exceeds maximum
    let matchingBracket = skattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!matchingBracket) {
      matchingBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    return matchingBracket;
  };

  const triggerTaxCalculation = () => {
    const totalIncome = monthlyIncome + taxableBenefit;
    
    if (!kommun.trim() || !selectedYear || totalIncome === 0) {
      return;
    }

    if (availableForsamlingar.length > 1 && !forsamling) {
      return;
    }

    const taxData = findTaxRateFromAPI(apiData, kommun.trim(), selectedYear, forsamling);
    
    if (taxData.length > 0) {
      setResult(taxData);
      const firstResult = taxData[0];
      const taxRate = includeSvenskaKyrkan ? firstResult.SummaInklKyrkoavgift : firstResult.Skattesats;
      const skattetabell = getSkattetabell(taxRate);
      loadSkattetabellData(selectedYear, skattetabell);
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setMonthlyIncome(cappedValue);
  };

  const handleTaxableBenefitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string to be converted to 0, and handle leading zeros properly
    if (value === '') {
      setTaxableBenefit(0);
    } else {
      const numericValue = parseInt(value) || 0;
      setTaxableBenefit(Math.max(0, numericValue)); // Ensure non-negative
    }
  };

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value && value.length === 10) {
      const date = new Date(value);
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      
      if (year >= 1900 && year <= currentYear && !isNaN(date.getTime())) {
        setBirthday(value);
      }
    } else {
      setBirthday(value);
    }
  };

  const getTotalIncome = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const getTaxPercentage = (): string => {
    if (!taxAmount || getTotalIncome() === 0) return '0';
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    const percentage = (taxAmountNum / getTotalIncome()) * 100;
    return percentage.toFixed(1);
  };

  const getNetSalary = (): number => {
    if (!taxAmount || getTotalIncome() === 0) return getTotalIncome();
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    return getTotalIncome() - taxAmountNum;
  };

  const calculateVacationPay = (): number => {
    const baseSalary = monthlyIncome;
    
    if (hasCollectiveAgreement) {
      // Med kollektivavtal: 0.8% för grundlön + 0.5% för rörlig lön
      const baseVacationPay = vacationDays * 0.008 * baseSalary;
      const variableVacationPay = vacationDays * 0.005 * variableSalary;
      return baseVacationPay + variableVacationPay;
    } else {
      // Utan kollektivavtal: 0.43% för grundlön + (12% / 25) för rörlig lön
      const baseVacationPay = vacationDays * 0.0043 * baseSalary;
      const variableVacationPay = vacationDays * ((0.12 * variableSalary) / 25);
      return baseVacationPay + variableVacationPay;
    }
  };

  // Trigger calculation whenever relevant values change, including includeSvenskaKyrkan
  useEffect(() => {
    if (kommun && (monthlyIncome > 0 || taxableBenefit > 0) && birthday) {
      triggerTaxCalculation();
    }
  }, [birthday, incomeType, isPensionContributing, monthlyIncome, taxableBenefit, kommun, includeSvenskaKyrkan]);

  const filteredTaxData = getFilteredSkattetabellData();
  const taxAmount = filteredTaxData ? getTaxFromColumn(filteredTaxData, selectedTaxColumn) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b w-full">
        <div className="container mx-auto px-4 py-6 max-w-full">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Min skatt</h1>
              <p className="text-gray-600">Hitta din inkomstskatt på ett enklare sätt</p>
            </div>
          </div>
          
          {/* Info Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              Att hitta och förstå den skatt man som anställd i Sverige betalar på sin inkomst kan vara komplicerad och frustrerande. Denna applikation hjälper dig att snabbt och enkelt hitta exakt hur mycket du ska betala i skatt, så att du slipper leta fram det själv.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          {/* Input Section */}
          <div className="space-y-6 w-full">
            <Card className="shadow-lg rounded-xl w-full">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Skattesats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-blue-50 rounded-b-xl w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Tax Rate Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        Inkomstår
                      </label>
                      <Select 
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                        value={selectedYear?.toString() || ''}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Välj år" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="kommun" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4" />
                        Kommun
                      </label>
                      <KommunSearch
                        municipalities={availableMunicipalities}
                        value={kommun}
                        onValueChange={setKommun}
                        disabled={!selectedYear}
                        placeholder={selectedYear ? "Sök kommun..." : "Välj år först"}
                      />
                    </div>

                    {availableForsamlingar.length > 1 && (
                      <ForsamlingSelect
                        forsamlingar={availableForsamlingar}
                        value={forsamling}
                        onValueChange={setForsamling}
                        disabled={!kommun}
                      />
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="svenskaKyrkan" 
                        checked={includeSvenskaKyrkan}
                        onCheckedChange={(checked) => setIncludeSvenskaKyrkan(checked === true)}
                      />
                      <label 
                        htmlFor="svenskaKyrkan" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        Medlem i svenska kyrkan
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Ditt medlemskap i Svenska Kyrkan kan du hitta här: https://www.svenskakyrkan.se/medlem</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                    </div>

                    {/* Tax Table Display */}
                    {skattetabellData.length > 0 && (
                      <div className="mt-4">
                        <TaxTableDisplay
                          skattetabellData={skattetabellData}
                          selectedTaxColumn={selectedTaxColumn}
                          currentIncome={getTotalIncome()}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column - Income Info */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Inkomstuppgifter
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="birthday" className="flex items-center gap-2">
                        Födelsedatum
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Denna information behövs för att korrekt kunna räkna ut den skatt du ska betala, vilket baseras på födelseår och ålder vid årets ingång</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={handleBirthdayChange}
                        placeholder="Välj födelsedatum"
                        max={new Date().toISOString().split('T')[0]}
                        min="1900-01-01"
                        className="w-full"
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
                        max="1000000000"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxableBenefit">Skattepliktig förmån (kr)</Label>
                      <Input
                        id="taxableBenefit"
                        type="number"
                        value={taxableBenefit === 0 ? '' : taxableBenefit}
                        onChange={handleTaxableBenefitChange}
                        placeholder="Ange skattepliktig förmån"
                        min="0"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="incomeType">Typ av inkomst</Label>
                      <Select onValueChange={setIncomeType} value={incomeType}>
                        <SelectTrigger className="w-full">
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
                          onCheckedChange={(checked) => setIsPensionContributing(checked === true)}
                        />
                        <Label htmlFor="pensionContributing">
                          Utgör grund för allmän pensionsavgift
                        </Label>
                      </div>
                    )}

                    {/* Vacation Pay Card moved here */}
                    {monthlyIncome > 0 && (
                      <VacationPayCard
                        hasCollectiveAgreement={hasCollectiveAgreement}
                        onHasCollectiveAgreementChange={setHasCollectiveAgreement}
                        vacationDays={vacationDays}
                        onVacationDaysChange={setVacationDays}
                        variableSalary={variableSalary}
                        onVariableSalaryChange={setVariableSalary}
                        vacationPayAmount={calculateVacationPay()}
                        monthlyIncome={monthlyIncome}
                      />
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6 w-full">
            <TaxColumnSelector
              age={0}
              onAgeChange={() => {}}
              incomeType={incomeType}
              onIncomeTypeChange={setIncomeType}
              isPensionContributing={isPensionContributing}
              onPensionContributingChange={setIsPensionContributing}
              birthYear={0}
              onBirthYearChange={() => {}}
              monthlyIncome={monthlyIncome}
              onMonthlyIncomeChange={setMonthlyIncome}
              birthday={birthday}
              onBirthdayChange={setBirthday}
              taxAmount={taxAmount}
              kommun={result.length > 0 ? result[0].Kommun : ''}
              selectedTaxColumn={selectedTaxColumn}
              result={result}
              includeSvenskaKyrkan={includeSvenskaKyrkan}
              selectedYear={selectedYear}
              getSkattetabell={getSkattetabell}
              onTriggerCalculation={triggerTaxCalculation}
              taxableBenefit={taxableBenefit}
              onTaxableBenefitChange={setTaxableBenefit}
              skattetabellData={skattetabellData}
              hasCollectiveAgreement={hasCollectiveAgreement}
              setHasCollectiveAgreement={setHasCollectiveAgreement}
              vacationDays={vacationDays}
              setVacationDays={setVacationDays}
              variableSalary={variableSalary}
              setVariableSalary={setVariableSalary}
              calculateVacationPay={calculateVacationPay}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
