type Props = {
  label: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'orange' | 'slate';
};

const tones = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
  slate: 'bg-slate-100 text-slate-700'
};

export default function Metric({ label, value, tone = 'blue' }: Props) {
  return (
    <div className="panel p-5">
      <div className={`mb-4 inline-flex rounded-md px-2 py-1 text-xs font-bold ${tones[tone]}`}>{label}</div>
      <div className="text-3xl font-bold tracking-normal">{value}</div>
    </div>
  );
}
