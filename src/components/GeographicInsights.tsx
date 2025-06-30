
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GeographicData {
  country: string;
  city: string | null;
  count: number;
  percentage: number;
}

interface GeographicInsightsProps {
  geographicData: GeographicData[];
  totalSessions: number;
}

export const GeographicInsights: React.FC<GeographicInsightsProps> = ({
  geographicData,
  totalSessions
}) => {
  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'Sweden': '🇸🇪',
      'Norway': '🇳🇴',
      'Denmark': '🇩🇰',
      'Finland': '🇫🇮',
      'Germany': '🇩🇪',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Unknown': '🌍'
    };
    return flags[country] || '🌍';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geographic Distribution</CardTitle>
        <CardDescription>Detailed breakdown of user locations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {geographicData.slice(0, 10).map((location, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCountryFlag(location.country)}</span>
                    <div>
                      <div className="font-medium">{location.country}</div>
                      {location.city && (
                        <div className="text-sm text-gray-600">{location.city}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{location.count}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{location.percentage.toFixed(1)}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${location.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
