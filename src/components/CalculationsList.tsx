
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface CalculationData {
  id: string;
  created_at: string;
  municipality?: string;
  parish?: string;
  user_age?: number;
  monthly_income?: number;
  taxable_benefit?: number;
  income_type?: string;
  has_collective_agreement?: boolean;
  vacation_days?: number;
  variable_salary?: number;
  includes_swedish_church?: boolean;
  selected_year?: number;
}

interface CalculationsListProps {
  calculations: CalculationData[];
}

type ColumnKey = keyof CalculationData;

const COLUMN_LABELS: Record<ColumnKey, string> = {
  id: 'ID',
  created_at: 'Date & Time',
  municipality: 'Municipality',
  parish: 'Parish',
  user_age: 'Age',
  monthly_income: 'Monthly Income',
  taxable_benefit: 'Taxable Benefit',
  income_type: 'Income Type',
  has_collective_agreement: 'Collective Agreement',
  vacation_days: 'Vacation Days',
  variable_salary: 'Variable Salary',
  includes_swedish_church: 'Church Membership',
  selected_year: 'Year'
};

const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  'created_at',
  'municipality',
  'user_age',
  'monthly_income',
  'income_type',
  'selected_year',
  'taxable_benefit',
  'variable_salary',
  'vacation_days',
  'includes_swedish_church',
  'has_collective_agreement'
];

export const CalculationsList: React.FC<CalculationsListProps> = ({ calculations }) => {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatValueForDisplay = (key: ColumnKey, value: any) => {
    if (value === null || value === undefined) return '-';
    
    switch (key) {
      case 'created_at':
        return formatDate(value);
      case 'monthly_income':
      case 'taxable_benefit':
      case 'variable_salary':
        return formatCurrency(value);
      case 'includes_swedish_church':
      case 'has_collective_agreement':
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '-';
      case 'income_type':
        return value;
      default:
        return value.toString();
    }
  };

  const formatValueForCSV = (key: ColumnKey, value: any) => {
    if (value === null || value === undefined) return '';
    
    switch (key) {
      case 'created_at':
        return formatDate(value);
      case 'includes_swedish_church':
      case 'has_collective_agreement':
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : '';
      default:
        return value.toString();
    }
  };

  const exportToCSV = () => {
    const headers = visibleColumns.map(col => COLUMN_LABELS[col]);
    const csvContent = [
      headers.join(','),
      ...calculations.map(calc => 
        visibleColumns.map(col => {
          const value = formatValueForCSV(col, calc[col]);
          // Escape commas and quotes in CSV values
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tax_calculations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setVisibleColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(col => col !== columnKey)
        : [...prev, columnKey]
    );
  };

  const renderCellContent = (calc: CalculationData, key: ColumnKey) => {
    const value = calc[key];
    
    if (key === 'municipality') {
      return (
        <div>
          <div className="font-medium">{calc.municipality || '-'}</div>
          {calc.parish && (
            <div className="text-sm text-gray-500">{calc.parish}</div>
          )}
        </div>
      );
    }
    
    if (key === 'income_type' && value) {
      return (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      );
    }
    
    if ((key === 'includes_swedish_church' || key === 'has_collective_agreement') && typeof value === 'boolean') {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    return formatValueForDisplay(key, value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>All Calculations</CardTitle>
              <CardDescription>
                Complete list of all tax calculations performed ({calculations.length} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(value) => toggleColumn(value as ColumnKey)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Toggle columns" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLUMN_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {visibleColumns.includes(key as ColumnKey) ? '✓ ' : ''}{label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((columnKey) => (
                    <TableHead key={columnKey}>
                      {COLUMN_LABELS[columnKey]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc, index) => (
                  <TableRow key={calc.id || index}>
                    {visibleColumns.map((columnKey) => (
                      <TableCell key={columnKey} className={columnKey === 'created_at' ? 'font-mono text-sm' : ''}>
                        {renderCellContent(calc, columnKey)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {calculations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No calculations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
