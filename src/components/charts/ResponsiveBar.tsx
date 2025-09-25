import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponsiveBarProps {
  data: any[];
  x: string;
  y: string;
  title?: string;
}

export function ResponsiveBar({ data, x, y, title }: ResponsiveBarProps) {
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
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey={x} 
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
          <Bar dataKey={y} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}