
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
import { SkatteverketData } from '@/utils/taxData';

interface SkatteverketTableProps {
  data: SkatteverketData[];
  selectedYear: number;
}

const SkatteverketTable = ({ data, selectedYear }: SkatteverketTableProps) => {
  const filteredData = data.filter(item => item.År === selectedYear);

  return (
    <ScrollArea className="h-96">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow className="bg-blue-50">
            <TableHead className="font-semibold text-blue-900">Kommun</TableHead>
            <TableHead className="font-semibold text-blue-900">Församling</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Kommunal</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Landsting</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Kyrka</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Total (exkl)</TableHead>
            <TableHead className="font-semibold text-blue-900 text-center">Total (inkl)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow 
              key={`${row.FörsamlingsKod}-${row.År}-${index}`}
              className={`hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <TableCell className="font-medium text-gray-900">
                {row.Kommun}
              </TableCell>
              <TableCell className="text-gray-600">
                {row.Församling}
              </TableCell>
              <TableCell className="text-center text-blue-700">
                {row.KommunalSkatt}%
              </TableCell>
              <TableCell className="text-center text-blue-700">
                {row.LandstingsSkatt}%
              </TableCell>
              <TableCell className="text-center text-purple-700">
                {row.Kyrkoavgift}%
              </TableCell>
              <TableCell className="text-center font-semibold text-green-700">
                {row.Skattesats}%
              </TableCell>
              <TableCell className="text-center font-semibold text-green-700">
                {row.SummaInklKyrkoavgift}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default SkatteverketTable;
