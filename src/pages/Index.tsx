import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Coins, MapPin, Calendar, List, HelpCircle, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import CollapsibleCard from '@/components/CollapsibleCard';
import KommunSearch from '@/components/KommunSearch';
import ForsamlingSelect from '@/components/ForsamlingSelect';
import TaxColumnSelector from '@/components/TaxColumnSelector';
import TaxTableDisplay from '@/components/TaxTableDisplay';
import VacationPayCard from '@/components/VacationPayCard';
import { FormAnalyticsTracker } from '@/components/FormAnalyticsTracker';
import { useAnalyticsContext } from '@/contexts/AnalyticsContext';
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
  const { t } = useLanguage();
  const { trackFormData, trackEvent } = useAnalyticsContext();
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
  const [age, setAge] = useState(0);
  const [taxableBenefit, setTaxableBenefit] = useState(0);
  const [hasCollectiveAgreement, setHasCollectiveAgreement] = useState(false);
  const [vacationDays, setVacationDays] = useState(25);
  const [variableSalary, setVariableSalary] = useState(0);
  const [calculationTriggered, setCalculationTriggered] = useState(false);
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState(false);

  // Frozen calculation states - these hold the values at the time of calculation
  const [frozenResult, setFrozenResult] = useState<SkatteverketData[]>([]);
  const [frozenSkattetabellData, setFrozenSkattetabellData] = useState<SkattetabellData[]>([]);
  const [frozenKommun, setFrozenKommun] = useState('');
  const [frozenForsamling, setFrozenForsamling] = useState('');
  const [frozenMonthlyIncome, setFrozenMonthlyIncome] = useState(0);
  const [frozenTaxableBenefit, setFrozenTaxableBenefit] = useState(0);
  const [frozenAge, setFrozenAge] = useState(0);
  const [frozenIncomeType, setFrozenIncomeType] = useState('salary');
  const [frozenIsPensionContributing, setFrozenIsPensionContributing] = useState(false);
  const [frozenSelectedTaxColumn, setFrozenSelectedTaxColumn] = useState(1);
  const [frozenIncludeSvenskaKyrkan, setFrozenIncludeSvenskaKyrkan] = useState(false);
  const [frozenSelectedYear, setFrozenSelectedYear] = useState<number | null>(null);
  const [frozenHasCollectiveAgreement, setFrozenHasCollectiveAgreement] = useState(false);
  const [frozenVacationDays, setFrozenVacationDays] = useState(25);
  const [frozenVariableSalary, setFrozenVariableSalary] = useState(0);

  const getSkattetabell = (taxRate: number): number => {
    const decimal = taxRate % 1;
    let roundedRate: number;
    
    if (decimal >= 0.50) {
      roundedRate = Math.ceil(taxRate);
    } else {
      roundedRate = Math.floor(taxRate);
    }
    
    return Math.max(29, Math.min(34, roundedRate));
  };

  useEffect(() => {
    const loadApiData = async () => {
      setLoading(true);
      try {
        const { data, years } = await fetchTaxData();
        setApiData(data);
        const filteredYears = years.filter(year => year >= 2020);
        setAvailableYears(filteredYears);
        if (filteredYears.length > 0) {
          setSelectedYear(filteredYears[0]);
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
      
      if (kommun && !municipalities.includes(kommun)) {
        setKommun('');
        setForsamling('');
        if (hasCalculatedOnce) {
          setHasCalculatedOnce(false);
        }
        setResult([]);
      }
    }
  }, [selectedYear, apiData]);

  useEffect(() => {
    if (kommun && selectedYear && apiData.length > 0) {
      const forsamlingar = getAvailableForsamlingar(apiData, kommun, selectedYear);
      setAvailableForsamlingar(forsamlingar);
      
      if (forsamlingar.length > 1 && !forsamling) {
        setForsamling(forsamlingar[0]);
      } else if (forsamlingar.length <= 1) {
        setForsamling('');
      }
      
      if (hasCalculatedOnce) {
        setHasCalculatedOnce(false);
      }
      setResult([]);
    }
  }, [kommun, selectedYear, apiData]);

  const loadSkattetabellData = async (year: number, tabell: number) => {
    setSkattetabellLoading(true);
    try {
      const data = await fetchSkattetabellData(year, tabell);
      setSkattetabellData(data);
      return data;
    } catch (error) {
      console.error('Failed to load skattetabell data:', error);
      return [];
    } finally {
      setSkattetabellLoading(false);
    }
  };

  const getCurrentTaxColumn = (): number => {
    if (!age || age === 0) return 1;
    
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    
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
  }, [age, incomeType, isPensionContributing]);

  const getTaxFromColumn = (item: any, column: number): string => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    if (!taxValue || taxValue === 'Ej tillgänglig') {
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
    
    let matchingBracket = skattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    );
    
    if (!matchingBracket) {
      matchingBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    return matchingBracket;
  };

  const handleCalculate = async () => {
    const totalIncome = monthlyIncome + taxableBenefit;
    
    if (!kommun.trim() || !selectedYear || totalIncome === 0) {
      setError('Vänligen fyll i kommun, år och inkomst för att beräkna skatt.');
      return;
    }

    if (availableForsamlingar.length > 1 && !forsamling) {
      setError('Vänligen välj en församling.');
      return;
    }

    setError('');
    setResult([]);
    setSkattetabellData([]);

    // Track analytics when user explicitly calculates
    const formData = {
      municipality: kommun || undefined,
      parish: forsamling || undefined,
      user_age: age || undefined,
      monthly_income: monthlyIncome || undefined,
      taxable_benefit: taxableBenefit || undefined,
      income_type: incomeType || undefined,
      has_collective_agreement: hasCollectiveAgreement || undefined,
      vacation_days: vacationDays || undefined,
      variable_salary: variableSalary || undefined,
      includes_swedish_church: includeSvenskaKyrkan || undefined,
      selected_year: selectedYear || undefined
    };

    // Track the calculation event
    await trackEvent('calculation', 'tax_calculated', {
      total_income: totalIncome,
      has_form_data: Object.keys(formData).length > 0
    }, formData);

    // Track form data
    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanedFormData).length > 0) {
      await trackFormData(cleanedFormData);
    }

    // Perform the actual calculation
    const taxData = findTaxRateFromAPI(apiData, kommun.trim(), selectedYear, forsamling);
    
    if (taxData.length > 0) {
      setResult(taxData);
      const firstResult = taxData[0];
      const taxRate = includeSvenskaKyrkan ? firstResult.SummaInklKyrkoavgift : firstResult.Skattesats;
      const skattetabell = getSkattetabell(taxRate);
      const skattetabellDataResult = await loadSkattetabellData(selectedYear, skattetabell);
      
      // Freeze all the calculation values
      setFrozenResult(taxData);
      setFrozenSkattetabellData(skattetabellDataResult);
      setFrozenKommun(kommun);
      setFrozenForsamling(forsamling);
      setFrozenMonthlyIncome(monthlyIncome);
      setFrozenTaxableBenefit(taxableBenefit);
      setFrozenAge(age);
      setFrozenIncomeType(incomeType);
      setFrozenIsPensionContributing(isPensionContributing);
      setFrozenSelectedTaxColumn(selectedTaxColumn);
      setFrozenIncludeSvenskaKyrkan(includeSvenskaKyrkan);
      setFrozenSelectedYear(selectedYear);
      setFrozenHasCollectiveAgreement(hasCollectiveAgreement);
      setFrozenVacationDays(vacationDays);
      setFrozenVariableSalary(variableSalary);
      
      setCalculationTriggered(true);
      setHasCalculatedOnce(true);
    } else {
      setError(t('noDataFound'));
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
    if (value === '') {
      setTaxableBenefit(0);
    } else {
      const numericValue = parseInt(value) || 0;
      setTaxableBenefit(Math.max(0, numericValue));
    }
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(Math.max(0, numericValue), 120);
    setAge(cappedValue);
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
    const baseSalary = frozenMonthlyIncome;
    
    if (frozenHasCollectiveAgreement) {
      const baseVacationPay = frozenVacationDays * 0.008 * baseSalary;
      const variableVacationPay = frozenVacationDays * 0.005 * frozenVariableSalary;
      return baseVacationPay + variableVacationPay;
    } else {
      const baseVacationPay = frozenVacationDays * 0.0043 * baseSalary;
      const variableVacationPay = frozenVacationDays * ((0.12 * frozenVariableSalary) / 25);
      return baseVacationPay + variableVacationPay;
    }
  };

  // Use frozen data for tax calculations when displaying results
  const filteredTaxData = hasCalculatedOnce ? (() => {
    if (frozenSkattetabellData.length === 0) return null;
    
    const totalIncome = frozenMonthlyIncome + frozenTaxableBenefit;
    if (totalIncome === 0) return null;
    
    let matchingBracket = frozenSkattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    );
    
    if (!matchingBracket) {
      matchingBracket = frozenSkattetabellData[frozenSkattetabellData.length - 1];
    }
    
    return matchingBracket;
  })() : getFilteredSkattetabellData();

  const taxAmount = filteredTaxData ? getTaxFromColumn(filteredTaxData, hasCalculatedOnce ? frozenSelectedTaxColumn : selectedTaxColumn) : null;

  // Check if we can calculate (have required data)
  const canCalculate = kommun.trim() && selectedYear && (monthlyIncome > 0 || taxableBenefit > 0) && age > 0 && 
    (availableForsamlingar.length <= 1 || forsamling);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b w-full">
        <div className="container mx-auto px-4 py-6 max-w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('appTitle')}</h1>
                <p className="text-gray-600">{t('appSubtitle')}</p>
              </div>
            </div>
            <LanguageSelector />
          </div>
          
          {/* Info Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              {t('infoText')}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          {/* Input Section */}
          <div className="space-y-6 w-full">
            <CollapsibleCard
              title={t('taxRate')}
              icon={<Search className="h-5 w-5" />}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5" />
                    {t('personalInfo')}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="year" className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4" />
                        {t('incomeYear')}
                      </label>
                      <Select 
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                        value={selectedYear?.toString() || ''}
                      >
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder={t('selectYear')} />
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

                    <div className="space-y-3">
                      <label htmlFor="kommun" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4" />
                        {t('municipality')}
                      </label>
                      <KommunSearch
                        municipalities={availableMunicipalities}
                        value={kommun}
                        onValueChange={setKommun}
                        disabled={!selectedYear}
                        placeholder={selectedYear ? t('searchMunicipality') : t('selectYearFirst')}
                      />
                    </div>

                    {availableForsamlingar.length > 1 && (
                      <div className="space-y-3">
                        <ForsamlingSelect
                          forsamlingar={availableForsamlingar}
                          value={forsamling}
                          onValueChange={setForsamling}
                          disabled={!kommun}
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="age" className="flex items-center gap-2 text-sm font-medium">
                        {t('age')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{t('ageTooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={age || ''}
                        onChange={handleAgeChange}
                        placeholder={t('enterAge')}
                        min="0"
                        max="120"
                        className="w-full h-10"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <Checkbox 
                        id="svenskaKyrkan" 
                        checked={includeSvenskaKyrkan}
                        onCheckedChange={(checked) => setIncludeSvenskaKyrkan(checked === true)}
                      />
                      <label 
                        htmlFor="svenskaKyrkan" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        {t('swedishChurchMember')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>
                                {t('swedishChurchTooltip')}{' '}
                                <a 
                                  href="https://www.svenskakyrkan.se/medlem" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline hover:text-blue-800 transition-colors"
                                >
                                  här
                                </a>
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Income Info */}
                <div className="space-y-6">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Coins className="h-5 w-5" />
                    {t('incomeInfo')}
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="monthlyIncome" className="flex items-center gap-2 text-sm font-medium">
                        {t('monthlyIncome')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{t('monthlyIncomeTooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={monthlyIncome || ''}
                        onChange={handleIncomeChange}
                        placeholder={t('enterMonthlyIncome')}
                        min="0"
                        max="1000000000"
                        className="w-full h-10"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="taxableBenefit" className="flex items-center gap-2 text-sm font-medium">
                        {t('taxableBenefit')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{t('taxableBenefitTooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="taxableBenefit"
                        type="number"
                        value={taxableBenefit === 0 ? '' : taxableBenefit}
                        onChange={handleTaxableBenefitChange}
                        placeholder={t('enterTaxableBenefit')}
                        min="0"
                        className="w-full h-10"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="incomeType" className="flex items-center gap-2 text-sm font-medium">
                        {t('incomeType')}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{t('incomeTypeTooltip')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Select onValueChange={setIncomeType} value={incomeType}>
                        <SelectTrigger className="w-full h-10">
                          <SelectValue placeholder={t('selectIncomeType')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">{t('salary')}</SelectItem>
                          <SelectItem value="pension">{t('pension')}</SelectItem>
                          <SelectItem value="disability">{t('disability')}</SelectItem>
                          <SelectItem value="unemployment">{t('unemployment')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {incomeType === 'unemployment' && (
                      <div className="flex items-center space-x-3 pt-2">
                        <Checkbox 
                          id="pensionContributing" 
                          checked={isPensionContributing}
                          onCheckedChange={(checked) => setIsPensionContributing(checked === true)}
                        />
                        <Label htmlFor="pensionContributing" className="text-sm font-medium">
                          Utgör grund för allmän pensionsavgift
                        </Label>
                      </div>
                    )}

                    {monthlyIncome > 0 && (
                      <div className="space-y-4 pt-4 border-t border-blue-200">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {t('vacationPay')}
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Checkbox 
                              id="collectiveAgreement" 
                              checked={hasCollectiveAgreement}
                              onCheckedChange={(checked) => setHasCollectiveAgreement(checked === true)}
                            />
                            <Label htmlFor="collectiveAgreement" className="flex items-center gap-2 text-sm font-medium">
                              {t('collectiveAgreement')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{t('collectiveAgreementTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="vacationDays" className="flex items-center gap-2 text-sm font-medium">
                              {t('vacationDays')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{t('vacationDaysTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <Input
                              id="vacationDays"
                              type="number"
                              value={vacationDays || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
                                const cappedValue = Math.min(Math.max(0, numericValue), 50);
                                setVacationDays(cappedValue);
                              }}
                              placeholder={t('vacationDays')}
                              min="0"
                              max="50"
                              className="w-full h-10"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="variableSalary" className="flex items-center gap-2 text-sm font-medium">
                              {t('variableSalary')}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{t('variableSalaryTooltip')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                            <Input
                              id="variableSalary"
                              type="number"
                              value={variableSalary === 0 ? '' : variableSalary}
                              onChange={(e) => {
                                const value = e.target.value;
                                const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
                                const cappedValue = Math.min(numericValue, 1000000000);
                                setVariableSalary(cappedValue);
                              }}
                              placeholder={t('variableMonthlySalary')}
                              min="0"
                              className="w-full h-10"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calculate Button */}
              <div className="mt-8 pt-6 border-t border-blue-200">
                <Button 
                  onClick={handleCalculate}
                  disabled={!canCalculate || loading}
                  className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  {loading ? 'Beräknar...' : 'Beräkna skatt'}
                </Button>
                
                {!canCalculate && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Fyll i kommun, år, ålder och inkomst för att beräkna
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {error}
                </div>
              )}
            </CollapsibleCard>
          </div>

          {/* Results Section - Use frozen data when available */}
          <div className="space-y-6 w-full">
            <TaxColumnSelector
              age={hasCalculatedOnce ? frozenAge : age}
              onAgeChange={setAge}
              incomeType={hasCalculatedOnce ? frozenIncomeType : incomeType}
              onIncomeTypeChange={setIncomeType}
              isPensionContributing={hasCalculatedOnce ? frozenIsPensionContributing : isPensionContributing}
              onPensionContributingChange={setIsPensionContributing}
              birthYear={0}
              onBirthYearChange={() => {}}
              monthlyIncome={hasCalculatedOnce ? frozenMonthlyIncome : monthlyIncome}
              onMonthlyIncomeChange={setMonthlyIncome}
              birthday=""
              onBirthdayChange={() => {}}
              taxAmount={taxAmount}
              kommun={hasCalculatedOnce ? frozenKommun : (result.length > 0 ? result[0].Kommun : '')}
              selectedTaxColumn={hasCalculatedOnce ? frozenSelectedTaxColumn : selectedTaxColumn}
              result={hasCalculatedOnce ? frozenResult : result}
              includeSvenskaKyrkan={hasCalculatedOnce ? frozenIncludeSvenskaKyrkan : includeSvenskaKyrkan}
              selectedYear={hasCalculatedOnce ? frozenSelectedYear : selectedYear}
              getSkattetabell={getSkattetabell}
              onTriggerCalculation={handleCalculate}
              taxableBenefit={hasCalculatedOnce ? frozenTaxableBenefit : taxableBenefit}
              onTaxableBenefitChange={setTaxableBenefit}
              skattetabellData={hasCalculatedOnce ? frozenSkattetabellData : skattetabellData}
              hasCollectiveAgreement={hasCalculatedOnce ? frozenHasCollectiveAgreement : hasCollectiveAgreement}
              setHasCollectiveAgreement={setHasCollectiveAgreement}
              vacationDays={hasCalculatedOnce ? frozenVacationDays : vacationDays}
              setVacationDays={setVacationDays}
              variableSalary={hasCalculatedOnce ? frozenVariableSalary : variableSalary}
              setVariableSalary={setVariableSalary}
              calculateVacationPay={calculateVacationPay}
            />
          </div>
        </div>
      </div>
      
      {/* Only show FormAnalyticsTracker after calculation is triggered */}
      {calculationTriggered && (
        <FormAnalyticsTracker
          municipality={frozenKommun}
          parish={frozenForsamling}
          age={frozenAge}
          monthlyIncome={frozenMonthlyIncome}
          taxableBenefit={frozenTaxableBenefit}
          incomeType={frozenIncomeType}
          hasCollectiveAgreement={frozenHasCollectiveAgreement}
          vacationDays={frozenVacationDays}
          variableSalary={frozenVariableSalary}
          includesSvenskaKyrkan={frozenIncludeSvenskaKyrkan}
          selectedYear={frozenSelectedYear}
        />
      )}
    </div>
  );
};

export default Index;
