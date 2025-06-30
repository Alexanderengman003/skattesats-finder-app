import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { List, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface TaxTableDisplayProps {
  skattetabellData: SkattetabellData[];
  selectedTaxColumn: number;
  currentIncome: number;
}

const TaxTableDisplay = ({ skattetabellData, selectedTaxColumn, currentIncome }: TaxTableDisplayProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();

  if (skattetabellData.length === 0) {
    return null;
  }

  const formatIncome = (income: number): string => {
    return income.toLocaleString('sv-SE') + ' kr';
  };

  // Improved method to determine if a value is percentage or kr
  const isPercentageValue = (value: string | undefined, rowIndex: number, columnKey: string): boolean => {
    if (!value || value === 'Ej tillgänglig') return false;
    
    const numericValue = parseFloat(value.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numericValue)) return false;
    
    // Find the transition point where values start being percentages
    // Look for the first occurrence of a value > 100 in this column
    let transitionIndex = -1;
    for (let i = 0; i < skattetabellData.length; i++) {
      const testValue = skattetabellData[i][columnKey];
      if (testValue && testValue !== 'Ej tillgänglig') {
        const testNumeric = parseFloat(testValue.toString().replace(/[^\d.-]/g, ''));
        if (!isNaN(testNumeric) && testNumeric > 100) {
          transitionIndex = i;
          break;
        }
      }
    }
    
    // If we found a transition point, values after it are likely percentages
    // If no transition found, assume all small values are kr
    if (transitionIndex !== -1 && rowIndex >= transitionIndex) {
      return numericValue <= 100;
    }
    
    // Before transition point or no transition found - use stricter criteria
    // Only consider it percentage if it's a very small decimal-like value
    return numericValue < 1 && numericValue > 0;
  };

  const getTaxFromColumn = (item: any, column: number, rowIndex: number): string => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    
    if (!taxValue || taxValue === 'Ej tillgänglig') {
      return 'Ej tillgänglig';
    }
    
    const numericValue = parseFloat(taxValue.toString().replace(/[^\d.-]/g, ''));
    
    // Handle NaN values
    if (isNaN(numericValue)) {
      return '';
    }
    
    // Use improved percentage detection
    if (isPercentageValue(taxValue, rowIndex, columnKey)) {
      return numericValue + '%';
    } else {
      return numericValue + ' kr';
    }
  };

  const calculateTaxRate = (item: SkattetabellData, rowIndex: number): string => {
    const columnKey = `Kolumn${selectedTaxColumn}`;
    const taxValue = item[columnKey];
    
    if (!taxValue || taxValue === 'Ej tillgänglig') {
      return 'Ej tillgänglig';
    }
    
    const numericValue = parseFloat(taxValue.toString().replace(/[^\d.-]/g, ''));
    
    if (isNaN(numericValue)) {
      return '0%';
    }
    
    // If it's already a percentage value, return it
    if (isPercentageValue(taxValue, rowIndex, columnKey)) {
      return numericValue.toFixed(1) + '%';
    } else {
      // Calculate percentage from kr amount
      const midpoint = (item.InkomstFrån + item.InkomstTill) / 2;
      const percentage = (numericValue / midpoint) * 100;
      return percentage.toFixed(1) + '%';
    }
  };

  const calculateMarginalTax = (rowIndex: number): string => {
    if (rowIndex >= skattetabellData.length - 1) {
      // For the last row, marginal tax is the same as tax rate
      return calculateTaxRate(skattetabellData[rowIndex], rowIndex);
    }
    
    const currentItem = skattetabellData[rowIndex];
    const nextItem = skattetabellData[rowIndex + 1];
    
    const currentTaxValue = parseFloat(currentItem[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    const nextTaxValue = parseFloat(nextItem[`Kolumn${selectedTaxColumn}`]?.replace(/[^\d.-]/g, '') || '0');
    
    if (isNaN(currentTaxValue) || isNaN(nextTaxValue)) {
      return '0%';
    }
    
    // If both are percentage values, return the current one
    if (isPercentageValue(currentItem[`Kolumn${selectedTaxColumn}`], rowIndex, `Kolumn${selectedTaxColumn}`) && 
        isPercentageValue(nextItem[`Kolumn${selectedTaxColumn}`], rowIndex + 1, `Kolumn${selectedTaxColumn}`)) {
      return currentTaxValue.toFixed(1) + '%';
    }
    
    // If current is kr and next is percentage (transition point), use percentage
    if (!isPercentageValue(currentItem[`Kolumn${selectedTaxColumn}`], rowIndex, `Kolumn${selectedTaxColumn}`) && 
        isPercentageValue(nextItem[`Kolumn${selectedTaxColumn}`], rowIndex + 1, `Kolumn${selectedTaxColumn}`)) {
      return nextTaxValue.toFixed(1) + '%';
    }
    
    // If both are kr values, calculate marginal rate
    if (!isPercentageValue(currentItem[`Kolumn${selectedTaxColumn}`], rowIndex, `Kolumn${selectedTaxColumn}`) && 
        !isPercentageValue(nextItem[`Kolumn${selectedTaxColumn}`], rowIndex + 1, `Kolumn${selectedTaxColumn}`)) {
      
      const incomeDiff = nextItem.InkomstFrån - currentItem.InkomstFrån;
      const taxDiff = nextTaxValue - currentTaxValue;
      
      if (incomeDiff > 0) {
        const marginalRate = (taxDiff / incomeDiff) * 100;
        return Math.max(0, marginalRate).toFixed(1) + '%';
      }
    }
    
    return '0%';
  };

  const isCurrentIncomeBracket = (item: SkattetabellData): boolean => {
    return currentIncome >= item.InkomstFrån && currentIncome <= item.InkomstTill;
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return skattetabellData;
    
    const searchLower = searchTerm.toLowerCase();
    return skattetabellData.filter(item => 
      item.InkomstFrån.toString().includes(searchTerm) ||
      item.InkomstTill.toString().includes(searchTerm) ||
      formatIncome(item.InkomstFrån).toLowerCase().includes(searchLower) ||
      formatIncome(item.InkomstTill).toLowerCase().includes(searchLower)
    );
  }, [skattetabellData, searchTerm]);

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl py-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="h-4 w-4" />
          {t('taxTable')} {skattetabellData[0]?.Tabell}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-blue-50 rounded-b-xl">
        {/* Search Input */}
        <div className="p-3 border-b border-blue-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={t('searchIncome')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-blue-200 focus:border-blue-400 h-8"
            />
          </div>
        </div>
        
        <ScrollArea className="h-64 rounded-b-xl">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-blue-50 h-7">
                <TableHead className="font-semibold text-blue-900 sticky top-0 bg-blue-50 py-1 text-sm whitespace-nowrap">{t('incomeTo')}</TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-sm whitespace-nowrap">
                  {t('skatt')}
                </TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-sm whitespace-nowrap">
                  {t('skattesats')}
                </TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-sm whitespace-nowrap">
                  {t('marginalskatt')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => {
                const isCurrentRow = isCurrentIncomeBracket(row);
                const originalIndex = skattetabellData.indexOf(row);
                
                return (
                  <TableRow 
                    key={`${row.InkomstFrån}-${row.InkomstTill}-${index}`}
                    className={`transition-colors h-7 ${
                      isCurrentRow 
                        ? 'bg-blue-200 border-l-4 border-blue-500' 
                        : index % 2 === 0 
                        ? 'bg-white hover:bg-blue-50' 
                        : 'bg-gray-50 hover:bg-blue-50'
                    }`}
                  >
                    <TableCell className={`py-1 text-sm px-3 whitespace-nowrap ${isCurrentRow ? 'text-blue-900' : 'text-gray-600'}`}>
                      {formatIncome(row.InkomstTill)}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-1 text-sm px-3 whitespace-nowrap ${
                      isCurrentRow ? 'text-blue-900' : 'text-blue-700'
                    }`}>
                      {getTaxFromColumn(row, selectedTaxColumn, originalIndex)}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-1 text-sm px-3 whitespace-nowrap ${
                      isCurrentRow ? 'text-blue-900' : 'text-green-700'
                    }`}>
                      {calculateTaxRate(row, originalIndex)}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-1 text-sm px-3 whitespace-nowrap ${
                      isCurrentRow ? 'text-blue-900' : 'text-purple-700'
                    }`}>
                      {calculateMarginalTax(originalIndex)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TaxTableDisplay;
