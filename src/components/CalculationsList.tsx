import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Eye, EyeOff, Filter, X } from 'lucide-react';

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
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({} as Record<ColumnKey, string>);

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
    if (value === null || value === undefined) {
      // For boolean fields, show "No" instead of "-"
      if (key === 'includes_swedish_church' || key === 'has_collective_agreement') {
        return 'No';
      }
      return '-';
    }
    
    switch (key) {
      case 'created_at':
        return formatDate(value);
      case 'monthly_income':
      case 'taxable_benefit':
      case 'variable_salary':
        return formatCurrency(value);
      case 'includes_swedish_church':
      case 'has_collective_agreement':
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'No';
      case 'income_type':
        return value;
      default:
        return String(value);
    }
  };

  const formatValueForCSV = (key: ColumnKey, value: any) => {
    if (value === null || value === undefined) {
      // For boolean fields, show "No" instead of empty
      if (key === 'includes_swedish_church' || key === 'has_collective_agreement') {
        return 'No';
      }
      return '';
    }
    
    switch (key) {
      case 'created_at':
        return formatDate(value);
      case 'includes_swedish_church':
      case 'has_collective_agreement':
        return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'No';
      default:
        return String(value);
    }
  };

  // Filter calculations based on active filters
  const filteredCalculations = useMemo(() => {
    return calculations.filter(calc => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true; // No filter applied
        
        const columnKey = key as ColumnKey;
        const cellValue = calc[columnKey];
        
        // Handle different data types
        switch (columnKey) {
          case 'created_at':
            const formattedDate = formatDate(String(cellValue));
            return formattedDate.toLowerCase().includes(filterValue.toLowerCase());
          
          case 'municipality':
          case 'parish':
          case 'income_type':
            const stringValue = cellValue ? String(cellValue) : '';
            return stringValue.toLowerCase().includes(filterValue.toLowerCase());
          
          case 'user_age':
          case 'monthly_income':
          case 'taxable_benefit':
          case 'vacation_days':
          case 'variable_salary':
          case 'selected_year':
            if (!cellValue && cellValue !== 0) return filterValue === '';
            return String(cellValue).includes(filterValue);
          
          case 'includes_swedish_church':
          case 'has_collective_agreement':
            const boolValue = cellValue === null || cellValue === undefined ? 'No' : (cellValue ? 'Yes' : 'No');
            return boolValue.toLowerCase().includes(filterValue.toLowerCase());
          
          default:
            const defaultValue = cellValue ? String(cellValue) : '';
            return defaultValue.toLowerCase().includes(filterValue.toLowerCase());
        }
      });
    });
  }, [calculations, filters]);

  const setFilter = (columnKey: ColumnKey, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  };

  const clearFilter = (columnKey: ColumnKey) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({} as Record<ColumnKey, string>);
  };

  const exportToCSV = () => {
    const headers = visibleColumns.map(col => COLUMN_LABELS[col]);
    const csvContent = [
      headers.join(','),
      ...filteredCalculations.map(calc => 
        visibleColumns.map(col => {
          const value = formatValueForCSV(col, calc[col]);
          // Escape commas and quotes in CSV values
          return `"${String(value).replace(/"/g, '""')}"`;
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
    
    if (key === 'includes_swedish_church' || key === 'has_collective_agreement') {
      const displayValue = value === null || value === undefined ? 'No' : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 'No');
      return (
        <Badge variant={displayValue === 'Yes' ? "default" : "secondary"}>
          {displayValue}
        </Badge>
      );
    }
    
    return formatValueForDisplay(key, value);
  };

  const getUniqueValues = (columnKey: ColumnKey) => {
    const values = new Set<string>();
    calculations.forEach(calc => {
      const value = calc[columnKey];
      if (columnKey === 'includes_swedish_church' || columnKey === 'has_collective_agreement') {
        const boolValue = value === null || value === undefined ? 'No' : (value ? 'Yes' : 'No');
        values.add(boolValue);
      } else if (value !== null && value !== undefined && value !== '') {
        values.add(String(value));
      }
    });
    return Array.from(values).sort();
  };

  const renderColumnFilter = (columnKey: ColumnKey) => {
    const currentFilter = filters[columnKey] || '';
    
    // For boolean columns, use a select dropdown
    if (columnKey === 'includes_swedish_church' || columnKey === 'has_collective_agreement') {
      return (
        <div className="flex items-center gap-1">
          <Select value={currentFilter} onValueChange={(value) => setFilter(columnKey, value === 'all' ? '' : value)}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
          {currentFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => clearFilter(columnKey)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    // For income_type, use a select dropdown with unique values
    if (columnKey === 'income_type') {
      const uniqueValues = getUniqueValues(columnKey);
      return (
        <div className="flex items-center gap-1">
          <Select value={currentFilter} onValueChange={(value) => setFilter(columnKey, value === 'all' ? '' : value)}>
            <SelectTrigger className="h-8 w-24">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {uniqueValues.map(value => (
                <SelectItem key={value} value={value}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFilter && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => clearFilter(columnKey)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    // For other columns, use text input
    return (
      <div className="flex items-center gap-1">
        <Input
          placeholder="Filter..."
          value={currentFilter}
          onChange={(e) => setFilter(columnKey, e.target.value)}
          className="h-8 w-24"
        />
        {currentFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => clearFilter(columnKey)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>All Calculations</CardTitle>
              <CardDescription>
                Complete list of all tax calculations performed ({filteredCalculations.length} of {calculations.length} total)
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <Button onClick={clearAllFilters} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Column Visibility Controls */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Column Visibility</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COLUMN_LABELS).map(([key, label]) => {
                const isVisible = visibleColumns.includes(key as ColumnKey);
                return (
                  <Button
                    key={key}
                    variant={isVisible ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleColumn(key as ColumnKey)}
                    className="text-xs"
                  >
                    {isVisible ? (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        {label}
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        {label}
                      </>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((columnKey) => (
                    <TableHead key={columnKey} className="space-y-2">
                      <div className="font-medium">
                        {COLUMN_LABELS[columnKey]}
                      </div>
                      <div className="font-normal">
                        {renderColumnFilter(columnKey)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calc, index) => (
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
          {filteredCalculations.length === 0 && calculations.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No calculations match the current filters
            </div>
          )}
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
