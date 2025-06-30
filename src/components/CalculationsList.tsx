
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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

export const CalculationsList: React.FC<CalculationsListProps> = ({ calculations }) => {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Calculations</CardTitle>
          <CardDescription>
            Complete list of all tax calculations performed ({calculations.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Municipality</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Monthly Income</TableHead>
                  <TableHead>Income Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Taxable Benefit</TableHead>
                  <TableHead>Variable Salary</TableHead>
                  <TableHead>Vacation Days</TableHead>
                  <TableHead>Church</TableHead>
                  <TableHead>Collective</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculations.map((calc, index) => (
                  <TableRow key={calc.id || index}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(calc.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{calc.municipality || '-'}</div>
                        {calc.parish && (
                          <div className="text-sm text-gray-500">{calc.parish}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{calc.user_age || '-'}</TableCell>
                    <TableCell>
                      {calc.monthly_income ? formatCurrency(calc.monthly_income) : '-'}
                    </TableCell>
                    <TableCell>
                      {calc.income_type && (
                        <Badge variant="outline" className="text-xs">
                          {calc.income_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{calc.selected_year || '-'}</TableCell>
                    <TableCell>
                      {calc.taxable_benefit ? formatCurrency(calc.taxable_benefit) : '-'}
                    </TableCell>
                    <TableCell>
                      {calc.variable_salary ? formatCurrency(calc.variable_salary) : '-'}
                    </TableCell>
                    <TableCell>{calc.vacation_days || '-'}</TableCell>
                    <TableCell>
                      {typeof calc.includes_swedish_church === 'boolean' ? (
                        <Badge variant={calc.includes_swedish_church ? "default" : "secondary"}>
                          {calc.includes_swedish_church ? 'Yes' : 'No'}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {typeof calc.has_collective_agreement === 'boolean' ? (
                        <Badge variant={calc.has_collective_agreement ? "default" : "secondary"}>
                          {calc.has_collective_agreement ? 'Yes' : 'No'}
                        </Badge>
                      ) : '-'}
                    </TableCell>
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
