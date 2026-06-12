import { useEffect, useRef, useState } from 'react';
import { Chrome, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const configuredGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [googleClientId, setGoogleClientId] = useState(configuredGoogleClientId);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: 'student@example.com',
    password: 'Student@123',
    college: 'Demo Engineering College'
  });
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (configuredGoogleClientId) return;
    api<{ googleClientId: string }>('/auth/config')
      .then((config) => setGoogleClientId(config.googleClientId))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleOpen) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setError('');
          try {
            if (!response.credential) throw new Error('Google did not return a sign-in credential.');
            const result = await api<{ token: string; user: any }>('/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential: response.credential, college: form.college })
            });
            saveSession(result.token, result.user);
            navigate('/');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign-in failed');
          }
        }
      });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        width: 360
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => setError('Could not load Google sign-in. Check your internet connection.');
    document.head.appendChild(script);
  }, [form.college, googleClientId, googleOpen, navigate]);

  async function submitAccount(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
      const result = await api<{ token: string; user: any }>(path, { method: 'POST', body: JSON.stringify(payload) });
      saveSession(result.token, result.user);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : mode === 'login' ? 'Login failed' : 'Registration failed');
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col justify-between bg-[linear-gradient(rgba(15,23,42,.7),rgba(15,23,42,.55)),url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center p-8">
        <div className="flex items-center gap-3">
          <img className="h-12 w-12 rounded-md bg-white object-cover shadow-sm" src="/py-kidda-hub-logo.png" alt="PY Kidda Hub logo" />
          <div>
            <div className="text-xl font-bold">PY Kidda Hub(PKH)</div>
            <div className="text-sm font-semibold text-slate-100">Be a PY kidda with us</div>
          </div>
        </div>
        <div className="max-w-2xl pb-10">
          <h1 className="text-5xl font-bold leading-tight tracking-normal md:text-6xl">PY Kidda Hub(PKH)</h1>
          <div className="mt-4 text-2xl font-bold text-yellow-300">Be a PY kidda with us</div>
          <p className="mt-5 max-w-xl text-lg text-slate-100">Students create their own accounts so practice history, mock tests, and progress stay separate.</p>
        </div>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-900">
        <div className="panel w-full max-w-md p-6">
          <div className="mb-5">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-brand">
              <ShieldCheck size={15} />
              Separate student progress
            </div>
            <h2 className="text-2xl font-bold">{mode === 'login' ? 'Login to your account' : 'Create student account'}</h2>
            <p className="mt-1 text-sm text-slate-500">Each student should use their own account before practicing or taking tests.</p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
            <button type="button" className={`rounded px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-brand shadow-sm' : 'text-slate-600'}`} onClick={() => setMode('login')}>
              Login
            </button>
            <button type="button" className={`rounded px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white text-brand shadow-sm' : 'text-slate-600'}`} onClick={() => setMode('register')}>
              Sign Up
            </button>
          </div>

          <form onSubmit={submitAccount} className="space-y-3">
            {mode === 'register' && (
              <label className="block">
                <span className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <User size={15} /> Full name
                </span>
                <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </label>
            )}
            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <Mail size={15} /> Email
              </span>
              <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-sm font-semibold">
                <Lock size={15} /> Password
              </span>
              <input className="input" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
            </label>
            {mode === 'register' && (
              <label className="block">
                <span className="mb-1 text-sm font-semibold">College</span>
                <input className="input" value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} required />
              </label>
            )}

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            <button className="btn btn-primary w-full" type="submit">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <button className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500" type="button" onClick={() => setGoogleOpen(!googleOpen)}>
              <Chrome size={16} />
              {googleOpen ? 'Hide Google sign-in' : 'Use Google account'}
            </button>
            {googleOpen && (
              <div className="mt-4">
                {googleClientId ? (
                  <div className="flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white p-1" ref={googleButtonRef} />
                ) : (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Google sign-in is not configured yet. Students can use email and password accounts now.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
            Admin demo: `admin@example.com` / `Admin@123`
          </div>
        </div>
      </section>
    </div>
  );
}
