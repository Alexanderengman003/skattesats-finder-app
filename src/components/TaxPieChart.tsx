
import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TaxPieChartProps {
  netSalary: number;
  taxAmount: number;
}

const TaxPieChart = ({ netSalary, taxAmount }: TaxPieChartProps) => {
  const pieChartData = [
    {
      name: 'Nettoinkomst',
      value: Math.round(netSalary),
      color: '#3b82f6'
    },
    {
      name: 'Skatt',
      value: Math.round(taxAmount),
      color: '#60a5fa'
    }
  ];

  const COLORS = ['#3b82f6', '#60a5fa'];

  return (
    <div className="text-center p-4 bg-blue-100 border border-blue-300 rounded-xl w-full">
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="relative w-full max-w-xs" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={110}
                outerRadius={130}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                cornerRadius={0}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value.toLocaleString()} kr`,
                  name
                ]}
                labelFormatter={() => ''}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 break-words">
                {Math.round(netSalary).toLocaleString()} kr
              </div>
              <div className="text-lg font-medium text-gray-600 mt-1">
                Nettoinkomst
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend - moved closer to pie chart */}
        <div className="grid grid-cols-2 gap-6 text-center w-full">
          {pieChartData.map((entry, index) => (
            <div key={entry.name} className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span className="text-sm font-medium text-gray-600">{entry.name}</span>
              </div>
              <div className="text-xl font-bold text-gray-900 break-words">
                {entry.value.toLocaleString()} kr
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaxPieChart;
