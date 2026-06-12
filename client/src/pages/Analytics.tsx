import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Metric from '../components/Metric';
import { api } from '../lib/api';

export default function Analytics() {
  const [data, setData] = useState<any>();
  useEffect(() => {
    api('/analytics').then(setData).catch(() => {});
  }, []);
  const topics = data?.topics || [];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-slate-500">Progress, accuracy, weak topics, and weekly practice history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Attempts" value={data?.overview?.attempts ?? 0} />
        <Metric label="Solved" value={data?.overview?.solved ?? 0} tone="green" />
        <Metric label="Accuracy" value={`${data?.overview?.accuracy ?? 0}%`} tone="orange" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <div className="panel p-5">
          <div className="mb-4 font-bold">Weekly Progress</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.weekly || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="attempts" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel p-5">
          <div className="mb-4 font-bold">Topic Strength</div>
          <div className="space-y-3">
            {topics.map((topic: any) => (
              <div key={topic.topic}>
                <div className="mb-1 flex justify-between text-sm"><span>{topic.topic}</span><b>{topic.accuracy}%</b></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-mint" style={{ width: `${topic.accuracy}%` }} /></div>
              </div>
            ))}
            {!topics.length && <p className="text-sm text-slate-500">Submit a few questions to reveal strong and weak topics.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
