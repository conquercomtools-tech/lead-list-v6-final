import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

function KV({ k, v }: { k: string; v: any }) {
  return (
    <div className="text-sm">
      <span className="text-white/60">{k}: </span>
      <span className="text-white/90">{typeof v === 'string' ? v : JSON.stringify(v)}</span>
    </div>
  );
}

export function JsonList({ data }: { data: any }) {
  if (!data) return <div className="text-white/50">No data</div>;
  if (Array.isArray(data)) {
    if (!data.length) return <div className="text-white/50">No items</div>;
    return (
      <div className="space-y-2">
        {data.map((item, i) => (
          <Card key={i} className="bg-white/5 border-white/10">
            <CardContent className="p-3 text-sm">
              {typeof item === 'object'
                ? Object.entries(item).map(([k, v]) => <KV key={k} k={k} v={v} />)
                : <div>{String(item)}</div>}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (typeof data === 'object') {
    return <div className="space-y-1">{Object.entries(data).map(([k, v]) => <KV key={k} k={k} v={v} />)}</div>;
  }
  return <div className="text-sm">{String(data)}</div>;
}
