
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { List } from 'lucide-react';

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
    // Add 'kr' suffix for tax amounts
    return taxValue + ' kr';
  };

  const isCurrentIncomeBracket = (item: SkattetabellData): boolean => {
    return currentIncome >= item.InkomstFrån && currentIncome <= item.InkomstTill;
  };

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2">
          <List className="h-5 w-5" />
          Skattetabell {skattetabellData[0]?.Tabell} - Kolumn {selectedTaxColumn}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-blue-50 rounded-b-xl">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-blue-50">
                <TableHead className="font-semibold text-blue-900">Inkomst från</TableHead>
                <TableHead className="font-semibold text-blue-900">Inkomst till</TableHead>
                <TableHead className="font-semibold text-blue-900 text-center">Skatt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skattetabellData.map((row, index) => {
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
                    <TableCell className={`text-center font-semibold ${isCurrentRow ? 'text-blue-900' : 'text-blue-700'}`}>
                      {getTaxFromColumn(row, selectedTaxColumn)}
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
