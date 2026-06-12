import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileText, PlayCircle, Send, XCircle } from 'lucide-react';
import { api } from '../lib/api';

type MockTest = {
  id: string;
  title: string;
  duration_minutes: number;
};

type MockQuestion = {
  id: string;
  title: string;
  category: string;
  topic: string;
  difficulty: string;
  points: number;
};

type ActiveAttempt = {
  attemptId: string;
  test: MockTest;
  questions: MockQuestion[];
  endsAt: string;
};

type MockResult = {
  status: string;
  score: number;
  attempted: number;
  totalQuestions: number;
  results: Array<{ questionId: string; title: string; score: number; attempted: boolean }>;
};

const ACTIVE_MOCK_ATTEMPT_KEY = 'activeMockAttempt';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function MockTests() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [active, setActive] = useState<ActiveAttempt | null>(null);
  const [result, setResult] = useState<MockResult | null>(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState('');
  const submittedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_MOCK_ATTEMPT_KEY);
    if (!stored) return;
    try {
      const restored = JSON.parse(stored) as ActiveAttempt;
      if (Number.isFinite(new Date(restored.endsAt).getTime())) {
        setActive(restored);
      }
    } catch {
      localStorage.removeItem(ACTIVE_MOCK_ATTEMPT_KEY);
    }
  }, []);

  useEffect(() => {
    api<MockTest[]>('/mock-tests')
      .then(setTests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load mock tests'));
  }, []);

  useEffect(() => {
    if (!active || result) return;
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((new Date(active.endsAt).getTime() - Date.now()) / 1000));
      setTimer(secondsLeft);
      if (secondsLeft === 0 && !submittedRef.current) {
        submittedRef.current = true;
        submitAttempt(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, result]);

  async function startTest(test: MockTest) {
    setError('');
    setResult(null);
    setLoadingId(test.id);
    submittedRef.current = false;
    try {
      const attempt = await api<ActiveAttempt>(`/mock-tests/${test.id}/start`, { method: 'POST', body: JSON.stringify({}) });
      setActive(attempt);
      localStorage.setItem(ACTIVE_MOCK_ATTEMPT_KEY, JSON.stringify(attempt));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start mock test');
    } finally {
      setLoadingId('');
    }
  }

  async function submitAttempt(autoSubmitted = false) {
    if (!active) return;
    setError('');
    submittedRef.current = true;
    try {
      const response = await api<MockResult>(`/mock-attempts/${active.attemptId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ autoSubmitted })
      });
      setResult(response);
      setTimer(0);
      localStorage.removeItem(ACTIVE_MOCK_ATTEMPT_KEY);
    } catch (err) {
      submittedRef.current = false;
      setError(err instanceof Error ? err.message : 'Could not submit mock test');
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Mock Tests</h1>
        <p className="text-sm text-slate-500">Timed tests with selected coding questions, auto-submit, and instant results.</p>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      {active && !result && (
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
            <div>
              <div className="text-lg font-bold">{active.test.title}</div>
              <div className="text-sm text-slate-500">{active.questions.length} questions · solve each question, then return here to submit the test</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 rounded-md px-3 py-2 font-bold ${timer < 300 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-brand'}`}>
                <Clock size={18} />
                {formatTime(timer)}
              </div>
              <button className="btn btn-primary" onClick={() => submitAttempt(false)}>
                <Send size={16} />
                Submit Test
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {active.questions.map((question, index) => (
              <div key={question.id} className="grid gap-3 p-4 md:grid-cols-[48px_1fr_120px] md:items-center">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-sm font-bold">{index + 1}</div>
                <div>
                  <div className="font-semibold">{question.title}</div>
                  <div className="text-sm text-slate-500">{question.category} · {question.topic} · {question.difficulty}</div>
                </div>
                <Link className="btn btn-soft" to={`/questions/${question.id}`}>
                  <FileText size={16} />
                  Solve
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {result && (
        <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold">Result: {result.score}%</div>
              <div className="text-sm text-slate-500">{result.attempted} of {result.totalQuestions} questions attempted · {result.status.replace('_', ' ')}</div>
            </div>
            <button className="btn btn-soft" onClick={() => { setActive(null); setResult(null); localStorage.removeItem(ACTIVE_MOCK_ATTEMPT_KEY); }}>
              Back to Tests
            </button>
          </div>
          <div className="mt-4 grid gap-2">
            {result.results.map((item) => (
              <div key={item.questionId} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  {item.attempted ? <CheckCircle2 className="text-emerald-600" size={16} /> : <XCircle className="text-slate-400" size={16} />}
                  {item.title}
                </span>
                <b>{item.score}%</b>
              </div>
            ))}
          </div>
        </section>
      )}

      {!active && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tests.map((test) => (
            <div className="panel p-5" key={test.id}>
              <div className="mb-2 text-lg font-bold">{test.title}</div>
              <div className="text-sm text-slate-500">{test.duration_minutes} minutes</div>
              <button className="btn btn-primary mt-5 w-full" disabled={loadingId === test.id} onClick={() => startTest(test)}>
                <PlayCircle size={16} />
                {loadingId === test.id ? 'Starting...' : 'Start'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
