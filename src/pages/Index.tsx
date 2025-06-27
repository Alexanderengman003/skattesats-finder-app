import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, Coins, MapPin, Calendar, List } from 'lucide-react';
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
      setKommun('');
      setForsamling('');
      setResult([]);
    }
  }, [selectedYear, apiData]);

  useEffect(() => {
    if (kommun && selectedYear && apiData.length > 0) {
      const forsamlingar = getAvailableForsamlingar(apiData, kommun, selectedYear);
      setAvailableForsamlingar(forsamlingar);
      setForsamling('');
      setResult([]);
    }
  }, [kommun, selectedYear, apiData]);

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
    return item[columnKey] || 'Ej tillgänglig';
  };

  const getFilteredSkattetabellData = (): SkattetabellData | null => {
    if (skattetabellData.length === 0) return null;
    
    const totalIncome = monthlyIncome + taxableBenefit;
    if (totalIncome === 0) return null;
    
    return skattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    ) || null;
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

  const handleLookup = () => {
    setError('');
    setResult([]);
    setSkattetabellData([]);

    if (!kommun.trim() || !selectedYear) {
      setError('Vänligen välj både kommun och år');
      return;
    }

    if (availableForsamlingar.length > 1 && !forsamling) {
      setError('Denna kommun har flera församlingar. Vänligen välj en församling.');
      return;
    }

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

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    setMonthlyIncome(numericValue);
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

  // Convert linear value to logarithmic for slider
  const valueToLog = (value: number): number => {
    if (value <= 0) return 0;
    return Math.log(value + 1);
  };

  // Convert logarithmic value back to linear
  const logToValue = (log: number): number => {
    return Math.max(0, Math.round(Math.exp(log) - 1));
  };

  const maxLog = valueToLog(1500000);

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

  // Trigger calculation whenever relevant values change
  useEffect(() => {
    if (kommun && (monthlyIncome > 0 || taxableBenefit > 0) && birthday) {
      triggerTaxCalculation();
    }
  }, [birthday, incomeType, isPensionContributing, monthlyIncome, taxableBenefit, kommun]);

  const filteredTaxData = getFilteredSkattetabellData();
  const taxAmount = filteredTaxData ? getTaxFromColumn(filteredTaxData, selectedTaxColumn) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Coins className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Min skatt</h1>
              <p className="text-gray-600">Hitta din inkomstskatt på ett enklare sätt</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Skattesats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 bg-blue-50 rounded-b-xl">
                <div className="space-y-2">
                  <label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    År
                  </label>
                  <Select 
                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                    value={selectedYear?.toString() || ''}
                  >
                    <SelectTrigger>
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Medlem i svenska kyrkan
                  </label>
                </div>

                <Button 
                  onClick={handleLookup} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  size="lg"
                  disabled={loading || !kommun || !selectedYear || (availableForsamlingar.length > 1 && !forsamling)}
                >
                  <Search className="mr-2 h-5 w-5" />
                  {loading ? 'Laddar...' : 'Sök Skattesats'}
                </Button>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                {/* Income Input Fields */}
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Inkomstuppgifter
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Födelsedatum</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={birthday}
                      onChange={handleBirthdayChange}
                      placeholder="Välj födelsedatum"
                      max={new Date().toISOString().split('T')[0]}
                      min="1900-01-01"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="monthlyIncome">Månadsinkomst</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      value={monthlyIncome || ''}
                      onChange={handleIncomeChange}
                      placeholder="Ange månadsinkomst"
                      min="0"
                    />
                    <Slider
                      value={[valueToLog(monthlyIncome)]}
                      onValueChange={(value) => setMonthlyIncome(logToValue(value[0]))}
                      max={maxLog}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxableBenefit">Beskattningsbar förmån (kr)</Label>
                    <Input
                      id="taxableBenefit"
                      type="number"
                      value={taxableBenefit === 0 ? '' : taxableBenefit}
                      onChange={handleTaxableBenefitChange}
                      placeholder="Ange beskattningsbar förmån (0 om ingen)"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="incomeType">Typ av inkomst</Label>
                    <Select onValueChange={setIncomeType} value={incomeType}>
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
                        onCheckedChange={(checked) => setIsPensionContributing(checked === true)}
                      />
                      <Label htmlFor="pensionContributing">
                        Utgör grund för allmän pensionsavgift
                      </Label>
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-xl">
                    <div className="text-center">
                      <span className="text-sm font-medium text-blue-600">Använd skattekolumn:</span>
                      <div className="text-2xl font-bold text-blue-800">
                        Kolumn {getCurrentTaxColumn()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
