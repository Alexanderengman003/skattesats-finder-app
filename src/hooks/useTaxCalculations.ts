import { useState, useEffect } from 'react';
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

interface UseTaxCalculationsProps {
  monthlyIncome: number;
  taxableBenefit: number;
  taxAmount: string | null;
  selectedTaxColumn: number;
  skattetabellData: SkattetabellData[];
  selectedYear: number | null;
}

export const useTaxCalculations = ({
  monthlyIncome,
  taxableBenefit,
  taxAmount,
  selectedTaxColumn,
  skattetabellData,
  selectedYear
}: UseTaxCalculationsProps) => {
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
      const remainingMonths = 12 - adjustedMonths;
      yearlyIncome = (adjustedSalary * adjustedMonths) + (baseMonthlyIncome * remainingMonths);
    } else {
      yearlyIncome = baseMonthlyIncome * 12;
    }
    
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

  const getTaxForIncome = (income: number): number => {
    if (skattetabellData.length === 0) return 0;
    
    let bracket = skattetabellData.find(item => 
      income >= item.InkomstFrån && income <= item.InkomstTill
    );
    
    if (!bracket) {
      bracket = skattetabellData[skattetabellData.length - 1];
    }
    
    const taxValue = parseFloat(bracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    if (isPercentageValue(taxValue, income)) {
      return (taxValue / 100) * income;
    } else {
      return taxValue;
    }
  };

  const getMarginalTaxRate = (): string => {
    if (skattetabellData.length === 0 || getTotalIncomeForTax() === 0) return '0';
    
    const currentIncome = getTotalIncomeForTax();
    
    console.log('Calculating marginal tax rate for income:', currentIncome);
    
    // Find current bracket index
    const currentBracketIndex = skattetabellData.findIndex(item => 
      currentIncome >= item.InkomstFrån && currentIncome <= item.InkomstTill
    );
    
    // If income exceeds the highest bracket, use the last bracket's tax value
    if (currentBracketIndex === -1) {
      console.log('Income exceeds highest bracket, using last bracket tax value');
      const lastBracket = skattetabellData[skattetabellData.length - 1];
      const lastTaxValue = parseFloat(lastBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
      
      if (isPercentageValue(lastTaxValue, lastBracket.InkomstFrån)) {
        return lastTaxValue.toFixed(1);
      } else {
        // For kr values in the last bracket, calculate as percentage of income
        const percentage = (lastTaxValue / lastBracket.InkomstFrån) * 100;
        return percentage.toFixed(1);
      }
    }
    
    const currentBracket = skattetabellData[currentBracketIndex];
    const nextBracket = skattetabellData[currentBracketIndex + 1];
    
    console.log('Current bracket:', currentBracket);
    console.log('Next bracket:', nextBracket);
    
    // If there's no next bracket, we're at the highest bracket
    if (!nextBracket) {
      const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
      if (isPercentageValue(currentTaxValue, currentIncome)) {
        return currentTaxValue.toFixed(1);
      }
      // For the highest bracket with kr values, use the current tax value as marginal rate
      console.log('At highest bracket with kr values, using current tax value:', currentTaxValue);
      return currentTaxValue.toFixed(1);
    }
    
    // Get tax values from both brackets
    const currentTaxValue = parseFloat(currentBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    const nextTaxValue = parseFloat(nextBracket[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    console.log('Current tax value:', currentTaxValue);
    console.log('Next tax value:', nextTaxValue);
    
    // If both are percentage values, return the current one (marginal rate is the bracket rate)
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstFrån) && 
        isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      console.log('Both are percentage values, returning current:', currentTaxValue);
      return currentTaxValue.toFixed(1);
    }
    
    // Special case: Current is kr, next is percentage (transition point)
    if (!isPercentageValue(currentTaxValue, currentBracket.InkomstFrån) && 
        isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      console.log('Transition from kr to percentage, using percentage value:', nextTaxValue);
      return nextTaxValue.toFixed(1);
    }
    
    // If both are kr values, calculate marginal rate
    if (!isPercentageValue(currentTaxValue, currentBracket.InkomstFrån) && 
        !isPercentageValue(nextTaxValue, nextBracket.InkomstFrån)) {
      
      // Use the start values of both brackets for consistency
      const currentIncomePoint = currentBracket.InkomstFrån;
      const nextIncomePoint = nextBracket.InkomstFrån;
      const incomeDiff = nextIncomePoint - currentIncomePoint;
      const taxDiff = nextTaxValue - currentTaxValue;
      
      const marginalRate = (taxDiff / incomeDiff) * 100;
      
      console.log('Kr values calculation:');
      console.log('Current income point:', currentIncomePoint);
      console.log('Next income point:', nextIncomePoint);
      console.log('Income difference:', incomeDiff);
      console.log('Tax difference:', taxDiff);
      console.log('Marginal rate:', marginalRate);
      
      return Math.max(0, marginalRate).toFixed(1);
    }
    
    // Mixed case - return current bracket rate if it's percentage
    if (isPercentageValue(currentTaxValue, currentBracket.InkomstFrån)) {
      return currentTaxValue.toFixed(1);
    }
    
    return '0';
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

  useEffect(() => {
    if (selectedYear && getTotalIncomeForTax() > 0 && selectedTaxColumn && engangsbeskattningAmount > 0) {
      loadEngangsbeskattningData();
    }
  }, [selectedYear, monthlyIncome, taxableBenefit, selectedTaxColumn, engangsbeskattningAmount, additionalIncome, adjustedSalary, adjustedMonths]);

  return {
    engangsbeskattningData,
    engangsbeskattningLoading,
    engangsbeskattningError,
    engangsbeskattningAmount,
    setEngangsbeskattningAmount,
    additionalIncome,
    setAdditionalIncome,
    adjustedSalary,
    setAdjustedSalary,
    adjustedMonths,
    setAdjustedMonths,
    getTotalIncomeForTax,
    getBaseSalary,
    calculateYearlyIncome,
    getTaxPercentage,
    getActualTaxAmount,
    getNetSalary,
    getMarginalTaxRate,
    getEngangsbeskattningRate,
    calculateEngangsbeskattning,
    loadEngangsbeskattningData,
    monthlyIncome,
    taxableBenefit
  };
};
