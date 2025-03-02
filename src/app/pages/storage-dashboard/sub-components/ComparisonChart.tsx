import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { SourceGroup, Direction, Translation } from '../models';
import { GenericDropdown } from '../../../components';

type ChartMode = 'retention' | 'storage';

type ComparisonChartProps = {
  direction: Direction;
  translateNames: boolean;
  filteredSourceGroups: SourceGroup[];
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

export const ComparisonChart = ({ direction, translateNames, filteredSourceGroups, t }: ComparisonChartProps) => {
  const [chartMode, setChartMode] = useState<ChartMode>('storage');

  const chartData = chartMode === 'retention' ? filteredSourceGroups : filteredSourceGroups.map(group => ({
    ...group,
    elasticStorage: group.elasticStorage.toFixed(2) || 0,
    s3Storage: group.S3Storage.toFixed(2) || 0,
  }));

  const title = t.comparing + ' ' + (chartMode === 'retention' ? t.retentionPeriods : t.storage);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <GenericDropdown
          buttonLabel={chartMode === 'retention' ? t.retentionPeriods : t.storage}
          options={[
            { label: t.storage, value: 'storage', checked: chartMode === 'storage' },
            { label: t.retentionPeriods, value: 'retention', checked: chartMode === 'retention' },
          ]}
          onSelect={(value) => setChartMode(value as ChartMode)}
        />
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis
              dataKey={translateNames ? "hebrewName" : "name"}
              reversed={direction === 'rtl'}
            />
            <YAxis
              label={{ value: chartMode === 'retention' ? t.days : t.storage + ' (GB)', angle: direction === 'rtl' ? 90 : -90, position: direction === 'rtl' ? 'outsideLeft' : 'insideLeft', dx: direction === 'rtl' ? 35 : -8 }}
              orientation={direction === 'rtl' ? 'right' : 'left'}
              tick={{ dx: direction === 'rtl' ? 42 : 0 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {chartMode === 'storage' && <Bar dataKey="elasticStorage" stackId="a" fill="#2563eb" name={t.elasticsearchStorage} />}
            {chartMode === 'storage' && <Bar dataKey="s3Storage" stackId="a" fill="#60a5fa" name={t.s3Storage} />}
            {chartMode === 'retention' && <Bar dataKey="hotRetentionDays" stackId="a" fill="#2563eb" name={t.hotTier} />}
            {chartMode === 'retention' && <Bar dataKey="coldRetentionDays" stackId="a" fill="#60a5fa" name={t.coldTier} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
