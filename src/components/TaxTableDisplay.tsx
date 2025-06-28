import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { List, Search } from 'lucide-react';
import CollapsibleCard from './CollapsibleCard';

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

  // Get all available columns
  const availableColumns = useMemo(() => {
    if (skattetabellData.length === 0) return [];
    
    const columns = [];
    for (let i = 1; i <= 7; i++) {
      const columnKey = `Kolumn${i}`;
      const hasData = skattetabellData.some(item => item[columnKey] && item[columnKey] !== 'Ej tillgänglig');
      if (hasData) {
        columns.push(i);
      }
    }
    return columns;
  }, [skattetabellData]);

  return (
    <CollapsibleCard
      title={`Skattetabell ${skattetabellData[0]?.Tabell}`}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
      headerClassName="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl"
      contentClassName="p-0 bg-blue-50 rounded-b-xl"
    >
      {/* Search Input */}
      <div className="p-4 border-b border-blue-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Sök efter inkomst..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-blue-200 focus:border-blue-400"
          />
        </div>
      </div>
      
      <div className="relative">
        <ScrollArea className="h-96 w-full">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-white z-20 shadow-sm">
                <TableRow className="bg-blue-50">
                  <TableHead className="font-semibold text-blue-900 sticky left-0 bg-blue-50 z-10 min-w-[120px] border-r-2 border-blue-200">
                    Inkomst från
                  </TableHead>
                  <TableHead className="font-semibold text-blue-900 sticky left-[120px] bg-blue-50 z-10 min-w-[120px] border-r-2 border-blue-200">
                    Inkomst till
                  </TableHead>
                  {availableColumns.map(column => (
                    <TableHead 
                      key={column} 
                      className={`font-semibold text-blue-900 text-center min-w-[100px] ${
                        column === selectedTaxColumn ? 'bg-blue-200' : ''
                      }`}
                    >
                      Kolumn {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, index) => {
                  const isCurrentRow = isCurrentIncomeBracket(row);
                  const originalIndex = skattetabellData.indexOf(row);
                  
                  return (
                    <TableRow 
                      key={`${row.InkomstFrån}-${row.InkomstTill}-${index}`}
                      className={`transition-colors ${
                        isCurrentRow 
                          ? 'bg-blue-200 border-l-4 border-blue-500' 
                          : index % 2 === 0 
                          ? 'bg-white hover:bg-blue-50' 
                          : 'bg-gray-50 hover:bg-blue-50'
                      }`}
                    >
                      <TableCell className={`font-medium sticky left-0 z-10 min-w-[120px] border-r-2 border-blue-200 ${
                        isCurrentRow ? 'text-blue-900 bg-blue-200' : 'text-gray-900 bg-inherit'
                      }`}>
                        {formatIncome(row.InkomstFrån)}
                      </TableCell>
                      <TableCell className={`sticky left-[120px] z-10 min-w-[120px] border-r-2 border-blue-200 ${
                        isCurrentRow ? 'text-blue-900 bg-blue-200' : 'text-gray-600 bg-inherit'
                      }`}>
                        {formatIncome(row.InkomstTill)}
                      </TableCell>
                      {availableColumns.map(column => (
                        <TableCell 
                          key={column}
                          className={`text-center font-semibold min-w-[100px] ${
                            isCurrentRow ? 'text-blue-900' : 'text-blue-700'
                          } ${column === selectedTaxColumn ? 'bg-blue-100' : ''}`}
                        >
                          {getTaxFromColumn(row, column, originalIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </CollapsibleCard>
  );
};

export default TaxTableDisplay;
