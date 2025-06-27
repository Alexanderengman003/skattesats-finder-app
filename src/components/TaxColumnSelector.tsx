import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const getTotalIncomeForTax = (): number => {
    return monthlyIncome + taxableBenefit;
  };

  const getBaseSalary = (): number => {
    return monthlyIncome;
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
    
    // Find current tax bracket or use the last one if income exceeds maximum
    let currentBracket = skattetabellData.find(item => 
      getTotalIncomeForTax() >= item.InkomstFrån && getTotalIncomeForTax() <= item.InkomstTill
    );
    
    // If no bracket found (income too high), use the last bracket
    if (!currentBracket) {
      currentBracket = skattetabellData[skattetabellData.length - 1];
    }
    
    if (!currentBracket) return '0';
    
    // Find the previous bracket
    const currentIndex = skattetabellData.indexOf(currentBracket);
    if (currentIndex <= 0) return '0';
    
    const previousBracket = skattetabellData[currentIndex - 1];
    
    // Get tax values for both brackets
    const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    const previousTaxValue = parseFloat(previousBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    // Calculate income and tax differences
    const incomeDiff = currentBracket.InkomstFrån - previousBracket.InkomstFrån;
    
    let currentTaxAmount = 0;
    let previousTaxAmount = 0;
    
    // Convert to actual tax amounts if they are percentages
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstFrån)) {
      currentTaxAmount = (currentTaxValue / 100) * currentBracket.InkomstFrån;
    } else {
      currentTaxAmount = currentTaxValue;
    }
    
    if (isPercentageValue(previousTaxValue, previousBracket.InkomstFrån)) {
      previousTaxAmount = (previousTaxValue / 100) * previousBracket.InkomstFrån;
    } else {
      previousTaxAmount = previousTaxValue;
    }
    
    const taxDiff = currentTaxAmount - previousTaxAmount;
    
    if (incomeDiff > 0 && taxDiff >= 0) {
      const marginalRate = (taxDiff / incomeDiff) * 100;
      return Math.max(0, marginalRate).toFixed(1);
    }
    
    return '0';
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
    if (!selectedYear || getTotalIncomeForTax() === 0) {
      console.log('Missing required data for engångsbeskattning:', { selectedYear, totalIncome: getTotalIncomeForTax() });
      return;
    }
    
    setEngangsbeskattningLoading(true);
    setEngangsbeskattningError(null);
    try {
      const yearlyIncome = getTotalIncomeForTax() * 12;
      console.log('Loading engångsbeskattning data:', { selectedYear, yearlyIncome, selectedTaxColumn });
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

  // Load engångsbeskattning data when relevant values change
  useEffect(() => {
    if (selectedYear && getTotalIncomeForTax() > 0 && selectedTaxColumn) {
      loadEngangsbeskattningData();
    }
  }, [selectedYear, monthlyIncome, taxableBenefit, selectedTaxColumn]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Skatteberäkning
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-blue-50 rounded-b-xl">
          {/* Tax Result Display - Side by Side Layout */}
          {result.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Tax Rate Display */}
              <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl">
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
              {kommun && currentTaxAmount && getTotalIncomeForTax() > 0 && (
                <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-medium text-black mb-1">
                      Total skatt
                    </div>
                    <div className="text-2xl font-bold text-black mb-2">
                      {Math.round(getActualTaxAmount()).toLocaleString()} kr
                    </div>
                    <div className="text-sm font-medium text-black mb-2">
                      Skatt beräknad på {Math.round(getTotalIncomeForTax()).toLocaleString()} kr
                    </div>
                    <div className="text-sm font-medium text-black mb-1">
                      Du betalar <span className="font-bold">{getTaxPercentage()}%</span> i skatt
                    </div>
                    <div className="text-sm font-medium text-black">
                      Marginalskatt: <span className="font-bold">{getMarginalTaxRate()}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {kommun && currentTaxAmount && getTotalIncomeForTax() > 0 ? (
            <div className="space-y-4">
              {/* Net Salary Display with Pie Chart */}
              <div className="text-center p-4 bg-blue-100 border border-blue-300 rounded-xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative" style={{ width: 320, height: 300 }}>
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
                        <div className="text-3xl font-bold text-gray-900">
                          {Math.round(getNetSalary()).toLocaleString()} kr
                        </div>
                        <div className="text-lg font-medium text-gray-600 mt-1">
                          Månadsinkomst
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-8 text-center">
                    {getPieChartData().map((entry, index) => (
                      <div key={entry.name} className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {entry.value.toLocaleString()} kr
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engångsbeskattning Card */}
              <Card className="shadow-lg rounded-xl">
                <CardContent className="p-4 bg-blue-100 border border-blue-300 rounded-xl">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-800 mb-3">
                        Beskattning på engångsbelopp
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="engangsbeskattningAmount">Engångsbelopp (kr)</Label>
                      <Input
                        id="engangsbeskattningAmount"
                        type="number"
                        value={engangsbeskattningAmount || ''}
                        onChange={handleEngangsbeskattningAmountChange}
                        placeholder="Ange engångsbelopp"
                        min="0"
                        max="1000000000"
                      />
                    </div>

                    <div className="text-center">
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
                            <div className="text-sm text-gray-600">
                              På ett engångsbelopp om {engangsbeskattningAmount.toLocaleString()} kr betalar du{' '}
                              <span className="font-bold">
                                {Math.round(calculateEngangsbeskattning(engangsbeskattningAmount)).toLocaleString()} kr
                              </span>{' '}
                              i skatt
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
            <div className="text-center text-gray-500 py-8 bg-blue-100 border border-blue-300 rounded-xl">
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
