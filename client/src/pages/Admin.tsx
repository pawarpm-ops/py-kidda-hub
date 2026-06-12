import { useEffect, useState } from 'react';
import { Download, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { api, getUser } from '../lib/api';

type StudentProgress = {
  id: string;
  name: string;
  email: string;
  college: string;
  role: 'student' | 'admin';
  attempts: number;
  solved: number;
  attemptedQuestions: number;
  totalQuestions: number;
  accuracy: number;
  progress: number;
  lastSubmissionAt: string | null;
};

export default function Admin() {
  const user = getUser();
  const [questions, setQuestions] = useState<any[]>([]);
  const [report, setReport] = useState<StudentProgress[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: 'Basic Python',
    topic: 'Loops',
    difficulty: 'Easy',
    statement: '',
    constraintsText: 'Standard input/output.',
    sampleInput: '',
    sampleOutput: '',
    starterCode: '# write your code here\n'
  });

  function loadQuestions() {
    api<any[]>('/admin/questions').then(setQuestions).catch(() => {});
  }

  function loadProgress() {
    api<StudentProgress[]>('/admin/export').then(setReport).catch(() => {});
  }

  useEffect(() => {
    loadQuestions();
    loadProgress();
  }, []);

  if (user?.role !== 'admin') return <div className="panel p-6">Admin access is required.</div>;

  async function createQuestion(event: React.FormEvent) {
    event.preventDefault();
    await api('/admin/questions', { method: 'POST', body: JSON.stringify(form) });
    setForm({ ...form, title: '', statement: '', sampleInput: '', sampleOutput: '' });
    loadQuestions();
  }

  function downloadReport() {
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-progress-report.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  const students = report.filter((row) => row.role === 'student');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-slate-500">Manage questions and monitor every student’s progress separately.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-soft" onClick={loadProgress}>
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button className="btn btn-soft" onClick={downloadReport}>
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="font-bold">Student Progress</div>
          <div className="text-sm text-slate-500">{students.length} student accounts</div>
        </div>
        <div className="divide-y divide-slate-100">
          {students.map((student) => (
            <div key={student.id} className="grid gap-3 p-4 xl:grid-cols-[1.2fr_.8fr_1.2fr_120px] xl:items-center">
              <div>
                <div className="font-semibold">{student.name}</div>
                <div className="text-sm text-slate-500">{student.email}</div>
                <div className="text-xs text-slate-400">{student.college}</div>
              </div>
              <div className="text-sm text-slate-600">
                <div><b>{student.solved}</b> solved</div>
                <div><b>{student.attempts}</b> submissions</div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Progress</span>
                  <b>{student.progress}%</b>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(0, student.progress))}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {student.attemptedQuestions}/{student.totalQuestions} questions attempted · {student.accuracy}% accuracy
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {student.lastSubmissionAt ? new Date(student.lastSubmissionAt).toLocaleDateString() : 'No activity'}
              </div>
            </div>
          ))}
          {!students.length && <div className="p-4 text-sm text-slate-500">No student activity yet. Student accounts will appear here after sign-up.</div>}
        </div>
      </section>

      <form onSubmit={createQuestion} className="panel grid gap-3 p-5 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <div className="font-bold">Add Question</div>
          <div className="text-sm text-slate-500">Create new practice questions and test prompts.</div>
        </div>
        <input className="input lg:col-span-2" placeholder="Question title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Basic Python</option><option>Intermediate Python</option><option>Advanced Python</option></select>
        <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option></select>
        <input className="input" placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        <input className="input" placeholder="Constraints" value={form.constraintsText} onChange={(e) => setForm({ ...form, constraintsText: e.target.value })} />
        <textarea className="input min-h-24 lg:col-span-2" placeholder="Problem statement" value={form.statement} onChange={(e) => setForm({ ...form, statement: e.target.value })} />
        <textarea className="input min-h-20" placeholder="Sample input" value={form.sampleInput} onChange={(e) => setForm({ ...form, sampleInput: e.target.value })} />
        <textarea className="input min-h-20" placeholder="Sample output" value={form.sampleOutput} onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })} />
        <textarea className="input min-h-24 lg:col-span-2" placeholder="Starter code" value={form.starterCode} onChange={(e) => setForm({ ...form, starterCode: e.target.value })} />
        <button className="btn btn-primary lg:col-span-2"><Plus size={16} /> Add Question</button>
      </form>

      <div className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-bold">Question Management</div>
        {questions.map((q) => (
          <div key={q.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div><b>{q.title}</b><div className="text-sm text-slate-500">{q.category} · {q.topic} · {q.difficulty}</div></div>
            <button className="btn btn-soft" onClick={async () => { await api(`/admin/questions/${q.id}`, { method: 'DELETE' }); loadQuestions(); }}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
