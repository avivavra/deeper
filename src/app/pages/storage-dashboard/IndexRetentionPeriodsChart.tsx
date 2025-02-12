import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TooltipProps } from 'recharts';
import { Audience, IndexData } from './models';

type IndexRetentionPeriodsChartProps = {
  audience: Audience;
  filteredIndices: IndexData[];
  t: any;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-gray-700">{`${entry.name}: ${entry.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const IndexRetentionPeriodsChart = ({ audience, filteredIndices, t }: IndexRetentionPeriodsChartProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.indexRetentionPeriods}</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredIndices}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              dataKey={audience === 'developer' ? "name" : "hebrewName"}
              reversed={audience === 'user'}
            />
            <YAxis
              label={{ value: t.days, angle: audience === 'user' ? 90 : -90, position: audience === 'user' ? 'outsideLeft' : 'insideLeft', dx: audience === 'user' ? 30 : 0 }} // Add padding to the title for user mode
              orientation={audience === 'user' ? 'right' : 'left'}
              tick={{ dx: audience === 'user' ? 27 : 0 }} // Add padding to the right for user mode
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {audience === 'developer' && (
              <Bar dataKey="hotRetentionDays" stackId="a" fill="#2563eb" name={t.hotTier} />
            )}
            {audience === 'developer' && (
              <Bar dataKey="coldRetentionDays" stackId="a" fill="#60a5fa" name={t.coldTier} />
            )}
            {audience === 'user' && (
              <Bar dataKey="totalRetentionDays" fill="#2563eb" name={t.totalRetentionPeriod} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IndexRetentionPeriodsChart;
