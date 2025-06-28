import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, HelpCircle } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchEngangsbeskattningData } from '@/utils/taxData';

interface SkattetabellData {
  År: number;
  Tabell: number;
  InkomstFrån: number;
  InkomstTill: number;
  Skatt: number;
  AntalDagar?: number;
  Kolumn1?: string;
  Kolumn2?: string;
  Kolumn3?: string;
  Kolumn4?: string;
  Kolumn5?: string;
  Kolumn6?: string;
  Kolumn7?: string;
  [key: string]: any;
}

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
  result: any[];
  includeSvenskaKyrkan: boolean;
  selectedYear: number | null;
  getSkattetabell: (taxRate: number) => number;
  onTriggerCalculation: () => void;
  taxableBenefit: number;
  onTaxableBenefitChange: (benefit: number) => void;
  skattetabellData: SkattetabellData[];
}

const TaxColumnSelector = ({
  monthlyIncome,
  taxAmount,
  kommun,
  selectedTaxColumn,
  result,
  includeSvenskaKyrkan,
  selectedYear,
  getSkattetabell,
  taxableBenefit,
  skattetabellData
}: TaxColumnSelectorProps) => {
  const [engangsbeskattningData, setEngangsbeskattningData] = useState<any[]>([]);
  const [engangsbeskattningLoading, setEngangsbeskattningLoading] = useState(false);
  const [engangsbeskattningError, setEngangsbeskattningError] = useState<string | null>(null);
  const [engangsbeskattningAmount, setEngangsbeskattningAmount] = useState(10000);
  const [additionalIncome, setAdditionalIncome] = useState(0);
  const [adjustedSalary, setAdjustedSalary] = useState(0);
  const [adjustedMonths, setAdjustedMonths] = useState(0);

  const getTotalIncomeForTax = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const getBaseSalary = (): number => {
    return monthlyIncome;
  };

  const calculateYearlyIncome = (): number => {
    const baseMonthlyIncome = monthlyIncome + taxableBenefit;
    let yearlyIncome = 0;
    
    if (adjustedSalary > 0 && adjustedMonths > 0 && adjustedMonths <= 12) {
      // Use adjusted salary for specified months, regular salary for remaining months
      const remainingMonths = 12 - adjustedMonths;
      yearlyIncome = (adjustedSalary * adjustedMonths) + (baseMonthlyIncome * remainingMonths);
    } else {
      // Use regular monthly income for all 12 months
      yearlyIncome = baseMonthlyIncome * 12;
    }
    
    // Add additional income and one-time amount
    return yearlyIncome + additionalIncome + engangsbeskattningAmount;
  };

  const isPercentageValue = (value: number, income: number): boolean => {
    if (value <= 100) {
      const potentialTaxAmount = (value / 100) * income;
      return potentialTaxAmount < income && value > 0;
    }
    return false;
  };

  const getTaxPercentage = (): string => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return '0';
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    let percentage: number;
    if (isPercentageValue(taxAmountNum, getTotalIncomeForTax())) {
      percentage = taxAmountNum;
    } else {
      percentage = (taxAmountNum / getTotalIncomeForTax()) * 100;
    }
    
    return percentage.toFixed(1);
  };

  const getActualTaxAmount = (): number => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return 0;
    const taxAmountNum = parseFloat(taxAmount.replace(/[^\d.-]/g, ''));
    
    if (isPercentageValue(taxAmountNum, getTotalIncomeForTax())) {
      return (taxAmountNum / 100) * getTotalIncomeForTax();
    } else {
      return taxAmountNum;
    }
  };

  const getNetSalary = (): number => {
    if (!taxAmount || getTotalIncomeForTax() === 0) return getBaseSalary();
    const actualTaxAmount = getActualTaxAmount();
    return getBaseSalary() - actualTaxAmount;
  };

  const getMarginalTaxRate = (): string => {
    if (skattetabellData.length === 0 || getTotalIncomeForTax() === 0) return '0';
    
    const currentIncome = getTotalIncomeForTax();
    
    // Find current tax bracket
    let currentBracket = skattetabellData.find(item => 
      currentIncome >= item.InkomstFrån && currentIncome <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!currentBracket) {
      currentBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    if (!currentBracket) return '0';
    
    // Get the tax value for current bracket
    const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    // Find the next bracket (one income level higher)
    const currentIndex = skattetabellData.indexOf(currentBracket);
    
    // If we're in the last bracket or close to it, return the current tax rate as marginal rate
    if (currentIndex >= skattetabellData.length - 1) {
      // For high income brackets, the marginal rate is typically the current rate
      if (isPercentageValue(currentTaxValue, currentIncome)) {
        return currentTaxValue.toFixed(1);
      } else {
        // Convert absolute tax amount to percentage for marginal rate
        const percentage = (currentTaxValue / currentIncome) * 100;
        return percentage.toFixed(1);
      }
    }
    
    const nextBracket = skattetabellData[currentIndex + 1];
    const nextTaxValue = parseFloat(nextBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    // If the next bracket has a percentage value, use it directly as marginal rate
    if (isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      return nextTaxValue.toFixed(1);
    }
    
    // If we're transitioning from absolute values to percentage values
    if (!isPercentageValue(currentTaxValue, currentBracket.InkomstFrån) && 
        isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      // Use the percentage value from the next bracket
      return nextTaxValue.toFixed(1);
    }
    
    // Calculate marginal rate based on the difference between brackets
    let currentTaxAmount = 0;
    let nextTaxAmount = 0;
    
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstFrån)) {
      currentTaxAmount = (currentTaxValue / 100) * currentBracket.InkomstFrån;
    } else {
      currentTaxAmount = currentTaxValue;
    }
    
    if (isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      nextTaxAmount = (nextTaxValue / 100) * nextBracket.InkomstFrån;
    } else {
      nextTaxAmount = nextTaxValue;
    }
    
    // Calculate the marginal rate: difference in tax divided by difference in income
    const incomeDiff = nextBracket.InkomstFrån - currentBracket.InkomstFrån;
    const taxDiff = nextTaxAmount - currentTaxAmount;
    
    if (incomeDiff > 0) {
      const marginalRate = (taxDiff / incomeDiff) * 100;
      return Math.max(0, marginalRate).toFixed(1);
    }
    
    // Fallback: return current tax rate
    if (isPercentageValue(currentTaxValue, currentIncome)) {
      return currentTaxValue.toFixed(1);
    } else {
      const percentage = (currentTaxValue / currentIncome) * 100;
      return percentage.toFixed(1);
    }
  };

  const getPieChartData = () => {
    const netSalary = Math.round(getNetSalary());
    const taxAmount = Math.round(getActualTaxAmount());
    
    return [
      {
        name: 'Nettoinkomst',
        value: netSalary,
        color: '#3b82f6'
      },
      {
        name: 'Skatt',
        value: taxAmount,
        color: '#60a5fa'
      }
    ];
  };

  const COLORS = ['#3b82f6', '#60a5fa'];

  // Fixed chart size based on maximum possible value (1 billion + "kr")
  const getChartSize = () => {
    const maxValueString = `1,000,000,000 kr`;
    const charWidth = 12; // Approximate character width
    const baseSize = 280;
    const extraSize = maxValueString.length * charWidth;
    
    return Math.max(baseSize, baseSize + extraSize * 0.8);
  };

  // Get filtered tax data, using last bracket if income exceeds maximum
  const getFilteredSkattetabellData = () => {
    if (skattetabellData.length === 0) return null;
    
    const totalIncome = getTotalIncomeForTax();
    if (totalIncome === 0) return null;
    
    // Find matching bracket or use the last one
    let matchingBracket = skattetabellData.find(item => 
      totalIncome >= item.InkomstFrån && totalIncome <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!matchingBracket) {
      matchingBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    return matchingBracket;
  };

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

  const loadEngangsbeskattningData = async () => {
    if (!selectedYear || getTotalIncomeForTax() === 0 || engangsbeskattningAmount === 0) {
      console.log('Missing required data for engångsbeskattning:', { 
        selectedYear, 
        totalIncome: getTotalIncomeForTax(), 
        engangsbeskattningAmount 
      });
      return;
    }
    
    setEngangsbeskattningLoading(true);
    setEngangsbeskattningError(null);
    try {
      // Use the new calculation method for yearly income
      const yearlyIncome = calculateYearlyIncome();
      console.log('Loading engångsbeskattning data:', { 
        selectedYear, 
        monthlyIncome: getTotalIncomeForTax(),
        engangsbeskattningAmount,
        additionalIncome,
        adjustedSalary,
        adjustedMonths,
        calculatedYearlyIncome: yearlyIncome, 
        selectedTaxColumn 
      });
      const data = await fetchEngangsbeskattningData(selectedYear, yearlyIncome, selectedTaxColumn);
      console.log('Engångsbeskattning data received:', data);
      setEngangsbeskattningData(data);
    } catch (error: any) {
      console.error('Failed to load engångsbeskattning data:', error);
      setEngangsbeskattningError(error.message || 'Failed to load data');
      setEngangsbeskattningData([]);
    } finally {
      setEngangsbeskattningLoading(false);
    }
  };

  const getEngangsbeskattningRate = (): number => {
    if (engangsbeskattningData.length === 0) return 0;
    const data = engangsbeskattningData[0];
    return data.PreliminärtSkatteavdragIProcent || 0;
  };

  const calculateEngangsbeskattning = (amount: number): number => {
    const rate = getEngangsbeskattningRate();
    return (amount * rate) / 100;
  };

  const handleEngangsbeskattningAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setEngangsbeskattningAmount(cappedValue);
  };

  const handleAdditionalIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setAdditionalIncome(cappedValue);
  };

  const handleAdjustedSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(numericValue, 1000000000);
    setAdjustedSalary(cappedValue);
  };

  const handleAdjustedMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value === '' ? 0 : parseInt(value.replace(/^0+/, '') || '0');
    const cappedValue = Math.min(Math.max(0, numericValue), 12);
    setAdjustedMonths(cappedValue);
  };

  // Load engångsbeskattning data when relevant values change
  useEffect(() => {
    if (selectedYear && getTotalIncomeForTax() > 0 && selectedTaxColumn && engangsbeskattningAmount > 0) {
      loadEngangsbeskattningData();
    }
  }, [selectedYear, monthlyIncome, taxableBenefit, selectedTaxColumn, engangsbeskattningAmount, additionalIncome, adjustedSalary, adjustedMonths]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <Card className="shadow-lg rounded-xl w-full">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Skatteberäkning
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-blue-50 rounded-b-xl w-full">
          {/* Tax Result Display - Side by Side Layout */}
          {result.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 w-full">
              {/* Tax Rate Display */}
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
                <h3 className="font-semibold text-blue-800 mb-2">Skattesats för {result[0].Kommun}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Kommunal skatt:</span>
                    <span className="font-medium">{result[0].KommunalSkatt}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Landstingsskatt:</span>
                    <span className="font-medium">{result[0].LandstingsSkatt}%</span>
                  </div>
                  {includeSvenskaKyrkan && (
                    <div className="flex justify-between">
                      <span>Kyrkoavgift:</span>
                      <span className="font-medium">{result[0].Kyrkoavgift}%</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="font-semibold">Total skattesats:</span>
                    <span className="font-semibold text-blue-700">
                      {includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Skattetabell:</span>
                    <span className="font-semibold text-blue-700">
                      {getSkattetabell(includeSvenskaKyrkan ? result[0].SummaInklKyrkoavgift : result[0].Skattesats)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tax Calculation Display */}
              {kommun && taxAmount && getTotalIncomeForTax() > 0 && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
                  <div className="text-center">
                    <div className="text-sm font-medium text-black mb-1">
                      Total skatt
                    </div>
                    <div className="text-2xl font-bold text-black mb-2 break-words">
                      {Math.round(getActualTaxAmount()).toLocaleString()} kr
                    </div>
                    <div className="text-sm font-medium text-black mb-2 break-words">
                      Månadsinkomst (kr) beräknad på {Math.round(getTotalIncomeForTax()).toLocaleString()} kr
                    </div>
                    <div className="text-sm font-medium text-black mb-1">
                      Du betalar <span className="font-bold">{getTaxPercentage()}%</span> i skatt
                    </div>
                    <div className="text-sm font-medium text-black">
                      Din marginalskatt är <span className="font-bold">{getMarginalTaxRate()}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {kommun && taxAmount && getTotalIncomeForTax() > 0 ? (
            <div className="space-y-4 w-full">
              {/* Net Salary Display with Pie Chart */}
              <div className="text-center p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="relative w-full max-w-xs" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={110}
                          outerRadius={130}
                          paddingAngle={0}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={0}
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString()} kr`,
                            name
                          ]}
                          labelFormatter={() => ''}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 break-words">
                          {Math.round(getNetSalary()).toLocaleString()} kr
                        </div>
                        <div className="text-lg font-medium text-gray-600 mt-1">
                          Nettoinkomst
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-8 text-center w-full">
                    {getPieChartData().map((entry, index) => (
                      <div key={entry.name} className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900 break-words">
                          {entry.value.toLocaleString()} kr
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engångsbeskattning Card with Two Column Layout */}
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
                          onChange={handleEngangsbeskattningAmountChange}
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
                          onChange={handleAdditionalIncomeChange}
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
                          onChange={handleAdjustedSalaryChange}
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
                          onChange={handleAdjustedMonthsChange}
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
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8 bg-blue-100 border border-blue-300 rounded-xl w-full">
              {!kommun 
                ? 'Gör en skattesats-sökning först'
                : getTotalIncomeForTax() === 0
                ? 'Ange månadsinkomst (kr) för att se skatteberäkning'
                : 'Beräknar skatt...'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxColumnSelector;
