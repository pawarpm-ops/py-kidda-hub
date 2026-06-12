import { useEffect, useState } from 'react';
import { Crown, Medal, Sparkles, Trophy } from 'lucide-react';
import { api } from '../lib/api';

type LeaderboardRow = {
  name: string;
  college: string;
  solved: number;
  accuracy: number;
  points: number;
};

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function rankTone(index: number) {
  if (index === 0) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (index === 1) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (index === 2) return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-blue-50 text-brand border-blue-100';
}

export default function Leaderboard() {
  const [scope, setScope] = useState('global');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    api<LeaderboardRow[]>(`/leaderboard?scope=${scope}`).then(setRows).catch(() => {});
  }, [scope]);

  const top = rows[0];
  const rest = rows.slice(1);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-slate-500">College and global rankings by solved problems and points.</p>
        </div>
        <div className="rounded-md bg-slate-200 p-1">
          {['global', 'college'].map((item) => (
            <button key={item} className={`rounded px-3 py-1.5 text-sm font-bold capitalize ${scope === item ? 'bg-white text-brand shadow-sm' : 'text-slate-600'}`} onClick={() => setScope(item)}>{item}</button>
          ))}
        </div>
      </div>

      {top && (
        <section className="relative overflow-hidden rounded-lg border border-amber-200 bg-white p-5 shadow-panel">
          <div className="absolute right-4 top-4 text-amber-100">
            <Trophy size={96} />
          </div>
          <div className="relative grid gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-amber-300 bg-amber-50 text-3xl font-black text-amber-700 shadow-panel">
                  {initials(top.name)}
                </div>
                <div className="absolute -right-2 -top-2 grid h-10 w-10 place-items-center rounded-full bg-amber-400 text-white shadow-panel">
                  <Crown size={22} />
                </div>
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-normal text-amber-700">
                  <Sparkles size={14} />
                  Rank 1 Champion
                </div>
                <h2 className="text-3xl font-black tracking-normal text-slate-900">{top.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{top.college}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="text-xs font-bold text-amber-700">Points</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{top.points}</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4">
                <div className="text-xs font-bold text-emerald-700">Solved</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{top.solved}</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-xs font-bold text-brand">Accuracy</div>
                <div className="mt-1 text-3xl font-black text-slate-900">{top.accuracy}%</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 font-bold"><Trophy size={18} /> Rankings</div>
        {rows.length > 0 && (
          <div className="hidden border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-normal text-slate-500 md:grid md:grid-cols-[86px_1fr_120px_120px_120px]">
            <div>Rank</div>
            <div>Student</div>
            <div>Solved</div>
            <div>Accuracy</div>
            <div>Points</div>
          </div>
        )}
        {rest.map((row, index) => {
          const rank = index + 2;
          return (
            <div key={`${row.name}-${rank}`} className="grid gap-2 border-b border-slate-100 px-4 py-4 md:grid-cols-[86px_1fr_120px_120px_120px] md:items-center">
              <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm font-black ${rankTone(rank - 1)}`}>
                {rank <= 3 ? <Medal size={16} /> : null}
                #{rank}
              </div>
              <div>
                <b>{row.name}</b>
                <div className="text-sm text-slate-500">{row.college}</div>
              </div>
              <div className="text-sm font-semibold text-slate-700">{row.solved} solved</div>
              <div className="text-sm font-semibold text-slate-700">{row.accuracy}%</div>
              <div className="text-sm font-black text-brand">{row.points} pts</div>
            </div>
          );
        })}
        {top && !rest.length && <div className="p-5 text-sm text-slate-500">The first ranker is on the board. More student rankings will appear after submissions.</div>}
        {!rows.length && <div className="p-5 text-sm text-slate-500">Rankings appear after students submit solutions.</div>}
      </div>
    </div>
  );
}
