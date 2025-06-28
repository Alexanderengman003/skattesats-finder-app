
import React, { useState } from 'react';
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

  const getTaxFromColumn = (item: any, column: number): string => {
    const columnKey = `Kolumn${column}`;
    const taxValue = item[columnKey];
    if (!taxValue || taxValue === 'Ej tillgänglig') {
      return 'Ej tillgänglig';
    }
    
    // Check if the value is a percentage (typically values under 100 for tax rates)
    const numericValue = parseFloat(taxValue.toString().replace(/[^\d.-]/g, ''));
    
    // If the value is likely a percentage (between 0 and 100), add %
    if (numericValue > 0 && numericValue <= 100 && !taxValue.toString().includes('kr')) {
      // Check if this is actually a percentage by comparing with income ranges
      // Values under 100 in higher income brackets are likely percentages
      if (item.InkomstFrån > 50000 || numericValue < 50) {
        return taxValue + '%';
      }
    }
    
    // If it already has 'kr' or is a large number, add 'kr'
    if (!taxValue.toString().includes('kr') && !taxValue.toString().includes('%')) {
      return taxValue + ' kr';
    }
    
    return taxValue;
  };

  const isCurrentIncomeBracket = (item: SkattetabellData): boolean => {
    return currentIncome >= item.InkomstFrån && currentIncome <= item.InkomstTill;
  };

  // Get available columns (1-7)
  const availableColumns = [];
  for (let i = 1; i <= 7; i++) {
    const hasData = skattetabellData.some(row => row[`Kolumn${i}`] && row[`Kolumn${i}`] !== 'Ej tillgänglig');
    if (hasData) {
      availableColumns.push(i);
    }
  }

  // Filter data based on search term
  const filteredData = skattetabellData.filter(row => {
    const searchLower = searchTerm.toLowerCase();
    return (
      formatIncome(row.InkomstFrån).toLowerCase().includes(searchLower) ||
      formatIncome(row.InkomstTill).toLowerCase().includes(searchLower) ||
      availableColumns.some(col => 
        getTaxFromColumn(row, col).toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Skattetabell {skattetabellData[0]?.Tabell}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-blue-50 rounded-b-xl">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Sök efter inkomst eller skatt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <ScrollArea className="h-96">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-blue-50">
                <TableHead className="font-semibold text-blue-900 sticky top-0 bg-blue-50">Inkomst från</TableHead>
                <TableHead className="font-semibold text-blue-900 sticky top-0 bg-blue-50">Inkomst till</TableHead>
                {availableColumns.map(col => (
                  <TableHead key={col} className="font-semibold text-blue-900 text-center sticky top-0 bg-blue-50">
                    Kol. {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => {
                const isCurrentRow = isCurrentIncomeBracket(row);
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
                    <TableCell className={`font-medium ${isCurrentRow ? 'text-blue-900' : 'text-gray-900'}`}>
                      {formatIncome(row.InkomstFrån)}
                    </TableCell>
                    <TableCell className={`${isCurrentRow ? 'text-blue-900' : 'text-gray-600'}`}>
                      {formatIncome(row.InkomstTill)}
                    </TableCell>
                    {availableColumns.map(col => (
                      <TableCell key={col} className={`text-center font-semibold ${
                        isCurrentRow ? 'text-blue-900' : 
                        col === selectedTaxColumn ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {getTaxFromColumn(row, col)}
                      </TableCell>
                    ))}
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
