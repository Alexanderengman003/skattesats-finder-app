
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaxRate } from '@/utils/taxData';

interface TaxRateTableProps {
  data: TaxRate[];
}

const TaxRateTable = ({ data }: TaxRateTableProps) => {
  return (
    <ScrollArea className="h-96">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow className="bg-blue-50">
            <TableHead className="font-semibold text-blue-900">Kommun</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Under 18 år</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">18-64 år</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Över 65 år</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={row.kommun} 
              className={`hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <TableCell className="font-medium text-gray-900">
                {row.kommun}
              </TableCell>
              <TableCell className="text-center text-gray-600">
                {row.under18 === 0 ? '0%' : `${row.under18}%`}
              </TableCell>
              <TableCell className="text-center font-semibold text-blue-700">
                {row.age18to64}%
              </TableCell>
              <TableCell className="text-center text-green-700">
                {row.over65}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default TaxRateTable;
