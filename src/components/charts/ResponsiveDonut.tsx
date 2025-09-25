import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ResponsiveDonutProps {
  data: { name: string; value: number }[];
  title?: string;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(220, 70%, 60%)',
  'hsl(280, 70%, 60%)',
  'hsl(340, 70%, 60%)',
  'hsl(40, 70%, 60%)',
  'hsl(160, 70%, 60%)',
];

export function ResponsiveDonut({ data, title }: ResponsiveDonutProps) {
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}