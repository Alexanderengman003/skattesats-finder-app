
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
      color: '#94a3b8'
    }
  ];

  const COLORS = ['#3b82f6', '#94a3b8'];

  return (
    <div className="text-center p-6 bg-gradient-to-r from-slate-100 to-blue-100/60 border border-slate-200/60 rounded-2xl shadow-sm w-full">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full max-w-xs" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={110}
                outerRadius={130}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
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
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 break-words">
                {Math.round(netSalary).toLocaleString()} kr
              </div>
              <div className="text-lg font-semibold text-slate-600 mt-1">
                Nettoinkomst
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-8 text-center w-full">
          {pieChartData.map((entry, index) => (
            <div key={entry.name} className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm" 
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span className="text-sm font-semibold text-slate-600">{entry.name}</span>
              </div>
              <div className="text-xl font-bold text-slate-800 break-words">
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
