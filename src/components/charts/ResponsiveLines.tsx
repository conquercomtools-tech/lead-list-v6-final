import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponsiveLinesProps {
  data: any[];
  lines: { dataKey: string; name: string; color?: string }[];
  title?: string;
}

export function ResponsiveLines({ data, lines, title }: ResponsiveLinesProps) {
  if (!data?.length) {
    return (
      <div className="h-[260px] w-full flex items-center justify-center text-white/50">
        {title ? `No ${title.toLowerCase()} data available` : 'No data available'}
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full">
      {title && <h4 className="text-sm font-medium text-white/80 mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.7)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
          {lines.map((l, i) => (
            <Line 
              key={l.dataKey} 
              type="monotone" 
              dataKey={l.dataKey} 
              name={l.name} 
              stroke={l.color || `hsl(${(i * 60) % 360}, 70%, 60%)`}
              dot={false} 
              strokeWidth={2} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}