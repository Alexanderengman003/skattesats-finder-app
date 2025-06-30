import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Eye, EyeOff, Filter, X, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  onCalculationDeleted?: () => void;
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

export const CalculationsList: React.FC<CalculationsListProps> = ({ calculations, onCalculationDeleted }) => {
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_VISIBLE_COLUMNS);
  const [filters, setFilters] = useState<Record<ColumnKey, string>>({} as Record<ColumnKey, string>);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localCalculations, setLocalCalculations] = useState<CalculationData[]>(calculations);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Update local calculations when props change
  React.useEffect(() => {
    setLocalCalculations(calculations);
  }, [calculations]);

  const deleteCalculation = async (id: string) => {
    console.log('Starting delete operation for calculation ID:', id);
    
    try {
      setDeletingIds(prev => new Set(prev).add(id));
      
      // Optimistic update - remove from local state immediately
      setLocalCalculations(prev => prev.filter(calc => calc.id !== id));
      
      console.log('Attempting to delete from analytics_events table...');
      
      const { error, count } = await supabase
        .from('analytics_events')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        console.error('Supabase delete error:', error);
        // Restore the item on error
        const originalCalc = calculations.find(calc => calc.id === id);
        if (originalCalc) {
          setLocalCalculations(prev => [...prev, originalCalc].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }
        throw error;
      }

      console.log('Delete operation completed. Rows affected:', count);
      
      if (count === 0) {
        console.warn('No rows were deleted. The calculation might not exist.');
        toast.error('Calculation not found or already deleted');
        
        // Still trigger refresh to sync with database state
        if (onCalculationDeleted) {
          onCalculationDeleted();
        }
        return;
      }

      console.log('Delete successful, triggering refresh callback');
      toast.success('Calculation deleted successfully');
      
      // Trigger refresh to ensure data consistency
      if (onCalculationDeleted) {
        onCalculationDeleted();
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      toast.error('Failed to delete calculation. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const deleteSelectedCalculations = async () => {
    if (selectedIds.size === 0) return;

    const idsToDelete = Array.from(selectedIds);
    console.log('Starting bulk delete operation for IDs:', idsToDelete);
    
    try {
      setBulkDeleting(true);
      
      // Optimistic update - remove from local state immediately
      setLocalCalculations(prev => prev.filter(calc => !selectedIds.has(calc.id)));
      
      console.log('Attempting bulk delete from analytics_events table...');
      
      const { error, count } = await supabase
        .from('analytics_events')
        .delete({ count: 'exact' })
        .in('id', idsToDelete);

      if (error) {
        console.error('Supabase bulk delete error:', error);
        // Restore the items on error
        const originalCalcs = calculations.filter(calc => selectedIds.has(calc.id));
        setLocalCalculations(prev => [...prev, ...originalCalcs].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
        throw error;
      }

      console.log('Bulk delete operation completed. Rows affected:', count);
      
      if (count === 0) {
        console.warn('No rows were deleted. The calculations might not exist.');
        toast.error('No calculations were found to delete');
      } else if (count < idsToDelete.length) {
        console.warn(`Only ${count} of ${idsToDelete.length} calculations were deleted`);
        toast.success(`${count} calculation${count > 1 ? 's' : ''} deleted successfully (${idsToDelete.length - count} were already gone)`);
      } else {
        toast.success(`${count} calculation${count > 1 ? 's' : ''} deleted successfully`);
      }
      
      setSelectedIds(new Set());
      
      console.log('Bulk delete successful, triggering refresh callback');
      
      // Trigger refresh to ensure data consistency
      if (onCalculationDeleted) {
        onCalculationDeleted();
      }
    } catch (error) {
      console.error('Error deleting calculations:', error);
      toast.error('Failed to delete calculations. Please try again.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredCalculations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCalculations.map(calc => calc.id)));
    }
  };

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

  // Filter calculations based on active filters - use localCalculations instead of calculations
  const filteredCalculations = useMemo(() => {
    return localCalculations.filter(calc => {
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
  }, [localCalculations, filters]);

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
    localCalculations.forEach(calc => {
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
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-lg md:text-xl">All Calculations</CardTitle>
              <CardDescription className="text-sm">
                Complete list of all tax calculations performed ({filteredCalculations.length} of {localCalculations.length} total)
                {activeFiltersCount > 0 && (
                  <span className="ml-2 text-blue-600">
                    • {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="w-full sm:w-auto" disabled={bulkDeleting}>
                      {bulkDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected ({selectedIds.size})
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Calculations</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedIds.size} calculation{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deleteSelectedCalculations}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {activeFiltersCount > 0 && (
                <Button onClick={clearAllFilters} variant="outline" size="sm" className="w-full sm:w-auto">
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
              <Button onClick={exportToCSV} variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Column Visibility Controls */}
          <div className="mb-4 p-3 md:p-4 bg-gray-50 rounded-lg">
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
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{label.length > 8 ? label.substring(0, 8) + '...' : label}</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{label.length > 8 ? label.substring(0, 8) + '...' : label}</span>
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
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredCalculations.length && filteredCalculations.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  {visibleColumns.map((columnKey) => (
                    <TableHead key={columnKey} className="space-y-2 min-w-[120px]">
                      <div className="font-medium text-xs md:text-sm">
                        {COLUMN_LABELS[columnKey]}
                      </div>
                      <div className="font-normal">
                        {renderColumnFilter(columnKey)}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-[80px]">
                    <div className="font-medium text-xs md:text-sm">Actions</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calc, index) => (
                  <TableRow key={calc.id || index} className={deletingIds.has(calc.id) ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(calc.id)}
                        onCheckedChange={() => toggleSelection(calc.id)}
                        aria-label={`Select calculation ${calc.id}`}
                        disabled={deletingIds.has(calc.id)}
                      />
                    </TableCell>
                    {visibleColumns.map((columnKey) => (
                      <TableCell key={columnKey} className={`text-xs md:text-sm ${columnKey === 'created_at' ? 'font-mono' : ''}`}>
                        {renderCellContent(calc, columnKey)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deletingIds.has(calc.id)}>
                            {deletingIds.has(calc.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this calculation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCalculation(calc.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredCalculations.length === 0 && localCalculations.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No calculations match the current filters
            </div>
          )}
          {localCalculations.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No calculations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
