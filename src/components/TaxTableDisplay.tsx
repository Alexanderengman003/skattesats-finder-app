
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { List, Search } from 'lucide-react';

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

  const getTaxFromColumn = (item: any, column: number, rowIndex: number): { value: string; numericValue: number; isPercentage: boolean } => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    
    if (!taxValue || taxValue === 'Ej tillgänglig') {
      return { value: 'Ej tillgänglig', numericValue: 0, isPercentage: false };
    }
    
    const numericValue = parseFloat(taxValue.toString().replace(/[^\d.-]/g, ''));
    
    // Handle NaN values
    if (isNaN(numericValue)) {
      return { value: '', numericValue: 0, isPercentage: false };
    }
    
    // Use improved percentage detection
    const isPercentage = isPercentageValue(taxValue, rowIndex, columnKey);
    if (isPercentage) {
      return { value: numericValue + '%', numericValue, isPercentage: true };
    } else {
      return { value: numericValue + ' kr', numericValue, isPercentage: false };
    }
  };

  const calculateTaxRate = (item: SkattetabellData, rowIndex: number): string => {
    const taxInfo = getTaxFromColumn(item, selectedTaxColumn, rowIndex);
    
    if (taxInfo.numericValue === 0 || item.InkomstFrån === 0) {
      return '0%';
    }
    
    if (taxInfo.isPercentage) {
      return taxInfo.numericValue.toFixed(1) + '%';
    } else {
      // Calculate percentage from kr amount
      const percentage = (taxInfo.numericValue / item.InkomstFrån) * 100;
      return percentage.toFixed(1) + '%';
    }
  };

  const calculateMarginalTaxRate = (currentIndex: number): string => {
    if (currentIndex === 0) return calculateTaxRate(skattetabellData[0], 0);
    
    const currentItem = skattetabellData[currentIndex];
    const previousItem = skattetabellData[currentIndex - 1];
    
    const currentTaxInfo = getTaxFromColumn(currentItem, selectedTaxColumn, currentIndex);
    const previousTaxInfo = getTaxFromColumn(previousItem, selectedTaxColumn, currentIndex - 1);
    
    if (currentTaxInfo.numericValue === 0 || previousTaxInfo.numericValue === 0) {
      return calculateTaxRate(currentItem, currentIndex);
    }
    
    // If both are percentages, return current percentage
    if (currentTaxInfo.isPercentage && previousTaxInfo.isPercentage) {
      return currentTaxInfo.numericValue.toFixed(1) + '%';
    }
    
    // If both are kr values, calculate marginal rate
    if (!currentTaxInfo.isPercentage && !previousTaxInfo.isPercentage) {
      const incomeDiff = currentItem.InkomstFrån - previousItem.InkomstFrån;
      const taxDiff = currentTaxInfo.numericValue - previousTaxInfo.numericValue;
      
      if (incomeDiff === 0) return calculateTaxRate(currentItem, currentIndex);
      
      const marginalRate = (taxDiff / incomeDiff) * 100;
      return Math.max(0, marginalRate).toFixed(1) + '%';
    }
    
    // Mixed case - return current rate
    return calculateTaxRate(currentItem, currentIndex);
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
          Skattetabell {skattetabellData[0]?.Tabell}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-blue-50 rounded-b-xl">
        {/* Search Input */}
        <div className="p-3 border-b border-blue-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Sök efter inkomst..."
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
                <TableHead className="font-semibold text-blue-900 sticky top-0 bg-blue-50 py-1 text-xs">Inkomst från</TableHead>
                <TableHead className="font-semibold text-blue-900 sticky top-0 bg-blue-50 py-1 text-xs">Inkomst till</TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-xs">
                  Skatt
                </TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-xs">
                  Skattesats
                </TableHead>
                <TableHead className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50 py-1 text-xs">
                  Marginalskatt
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => {
                const isCurrentRow = isCurrentIncomeBracket(row);
                const originalIndex = skattetabellData.indexOf(row);
                const taxInfo = getTaxFromColumn(row, selectedTaxColumn, originalIndex);
                
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
                    <TableCell className={`font-medium py-1 text-xs px-2 ${isCurrentRow ? 'text-blue-900' : 'text-gray-900'}`}>
                      {formatIncome(row.InkomstFrån)}
                    </TableCell>
                    <TableCell className={`py-1 text-xs px-2 ${isCurrentRow ? 'text-blue-900' : 'text-gray-600'}`}>
                      {formatIncome(row.InkomstTill)}
                    </TableCell>
                    <TableCell className={`text-center font-semibold py-1 text-xs px-2 ${
                      isCurrentRow ? 'text-blue-900' : 'text-blue-700'
                    }`}>
                      {taxInfo.value}
                    </TableCell>
                    <TableCell className={`text-center py-1 text-xs px-2 ${
                      isCurrentRow ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {calculateTaxRate(row, originalIndex)}
                    </TableCell>
                    <TableCell className={`text-center py-1 text-xs px-2 ${
                      isCurrentRow ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {calculateMarginalTaxRate(originalIndex)}
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
