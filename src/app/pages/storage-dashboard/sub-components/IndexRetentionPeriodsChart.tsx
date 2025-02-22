import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { IndexData, Direction, DisplayMethod, Translation } from '../models';

type IndexRetentionPeriodsChartProps = {
  direction: Direction;
  displayMethod: DisplayMethod;
  translateIndexNames: boolean;
  filteredIndices: IndexData[];
  t: Translation;
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

export const IndexRetentionPeriodsChart = ({ direction, displayMethod, translateIndexNames, filteredIndices, t }: IndexRetentionPeriodsChartProps) => {
  return (
    <div>
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
              dataKey={translateIndexNames ? "hebrewName" : "name"}
              reversed={direction === 'rtl'}
            />
            <YAxis
              label={{ value: t.days, angle: direction === 'rtl' ? 90 : -90, position: direction === 'rtl' ? 'outsideLeft' : 'insideLeft', dx: direction === 'rtl' ? 30 : 0 }}
              orientation={direction === 'rtl' ? 'right' : 'left'}
              tick={{ dx: direction === 'rtl' ? 27 : 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {displayMethod === 'separate' && (
              <Bar dataKey="hotRetentionDays" stackId="a" fill="#2563eb" name={t.hotTier} />
            )}
            {displayMethod === 'separate' && (
              <Bar dataKey="coldRetentionDays" stackId="a" fill="#60a5fa" name={t.coldTier} />
            )}
            {displayMethod === 'combined' && (
              <Bar dataKey="totalRetentionDays" fill="#2563eb" name={t.totalRetentionPeriod} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
