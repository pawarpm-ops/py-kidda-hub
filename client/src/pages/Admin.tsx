import { useEffect, useState } from 'react';
import { AlertTriangle, Bell, Download, Edit2, FileText, Plus, RefreshCcw, Send, ShieldAlert, Trash2 } from 'lucide-react';
import { api, getToken, getUser } from '../lib/api';

type StudentProgress = {
  id: string;
  name: string;
  email: string;
  college: string;
  role: 'student' | 'admin';
  authProvider?: string;
  emailVerified?: boolean;
  lastLogin?: string | null;
  accountStatus?: string;
  attempts: number;
  solved: number;
  attemptedQuestions: number;
  totalQuestions: number;
  accuracy: number;
  progress: number;
  lastSubmissionAt: string | null;
};

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  target: string;
  specific_user_id?: string | null;
  publish_at?: string;
  expires_at?: string | null;
  status: 'Draft' | 'Published';
  createdByName?: string;
  readCount?: number;
};

type AdminReport = {
  id: string;
  reporter_id: string;
  reporterName?: string;
  reporterEmail?: string;
  title: string;
  category: string;
  description: string;
  related_module?: string | null;
  related_question_id?: string | null;
  reported_user_identifier?: string | null;
  reportedUserName?: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'New' | 'Under Review' | 'Resolved' | 'Rejected';
  admin_remarks?: string | null;
  assigned_admin_id?: string | null;
  assignedAdminName?: string | null;
  moderation_action?: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  created_at: string;
  comments?: Array<{ id: string; comment: string; is_admin: boolean; authorName?: string; created_at: string }>;
  history?: Array<{ id: string; old_status?: string | null; new_status: string; note?: string | null; created_at: string }>;
};

type CheatingReport = {
  attemptId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  testId: string;
  testName: string;
  startedAt: string;
  submittedAt?: string | null;
  finalScore: number;
  status: 'Normal' | 'Suspicious' | 'Auto-submitted';
  violationCount: number;
  violationTypes: string[];
  violations: Array<{ id: string; type?: string; violation_type?: string; message?: string; violation_message?: string; timestamp?: string; created_at?: string; webcamStatus?: string; webcam_status?: string }>;
  autoSubmitted: boolean;
  cheatingSuspected: boolean;
  cheatingReason?: string | null;
  deviceInfo?: Record<string, unknown>;
  webcamStatus?: string;
  reviewedByAdmin?: string | null;
  adminRemarks?: string | null;
};

const emptyNotification = {
  title: '',
  message: '',
  type: 'General',
  priority: 'Medium',
  target: 'All Users',
  specificUserId: '',
  publishAt: new Date().toISOString().slice(0, 16),
  expiresAt: '',
  status: 'Draft'
};

export default function Admin() {
  const user = getUser();
  const [questions, setQuestions] = useState<any[]>([]);
  const [report, setReport] = useState<StudentProgress[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [adminReports, setAdminReports] = useState<AdminReport[]>([]);
  const [cheatingReports, setCheatingReports] = useState<CheatingReport[]>([]);
  const [cheatingFilters, setCheatingFilters] = useState({ test: '', student: '', suspicious: 'true' });
  const [selectedCheatingId, setSelectedCheatingId] = useState('');
  const [cheatingError, setCheatingError] = useState('');
  const [cheatingSavingId, setCheatingSavingId] = useState('');
  const [cheatingDraft, setCheatingDraft] = useState({ adminRemarks: '', cheatingSuspected: true });
  const [reportFilters, setReportFilters] = useState({ status: '', category: '', priority: '', user: '', date: '' });
  const [selectedReportId, setSelectedReportId] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSavingId, setReportSavingId] = useState('');
  const [reportDraft, setReportDraft] = useState({ admin_remarks: '', assigned_admin_id: '', moderation_action: 'None' });
  const [editingNotificationId, setEditingNotificationId] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [notificationForm, setNotificationForm] = useState(emptyNotification);
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

  function loadNotifications() {
    api<AdminNotification[]>('/admin/notifications').then(setNotifications).catch(() => {});
  }

  function loadAdminReports() {
    const qs = new URLSearchParams(reportFilters).toString();
    api<AdminReport[]>(`/admin/reports?${qs}`).then((rows) => {
      setAdminReports(rows);
      if (!selectedReportId && rows[0]) setSelectedReportId(rows[0].id);
    }).catch((err) => setReportError(err instanceof Error ? err.message : 'Could not load reports.'));
  }

  function loadCheatingReports() {
    const qs = new URLSearchParams(cheatingFilters).toString();
    api<CheatingReport[]>(`/admin/cheating-reports?${qs}`).then((rows) => {
      setCheatingReports(rows);
      if (!selectedCheatingId && rows[0]) setSelectedCheatingId(rows[0].attemptId);
    }).catch((err) => setCheatingError(err instanceof Error ? err.message : 'Could not load cheating reports.'));
  }

  useEffect(() => {
    loadQuestions();
    loadProgress();
    loadNotifications();
  }, []);

  useEffect(() => {
    loadAdminReports();
  }, [reportFilters]);

  useEffect(() => {
    loadCheatingReports();
  }, [cheatingFilters]);

  if (user?.role !== 'admin') return <div className="panel p-6">Admin access is required.</div>;

  async function createQuestion(event: React.FormEvent) {
    event.preventDefault();
    await api('/admin/questions', { method: 'POST', body: JSON.stringify(form) });
    setForm({ ...form, title: '', statement: '', sampleInput: '', sampleOutput: '' });
    loadQuestions();
  }

  async function saveNotification(event: React.FormEvent) {
    event.preventDefault();
    setNotificationError('');
    try {
      const payload = {
        ...notificationForm,
        specificUserId: notificationForm.target === 'Specific User' ? notificationForm.specificUserId : ''
      };
      if (editingNotificationId) {
        await api(`/admin/notifications/${editingNotificationId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/admin/notifications', { method: 'POST', body: JSON.stringify(payload) });
      }
      setNotificationForm({ ...emptyNotification, publishAt: new Date().toISOString().slice(0, 16) });
      setEditingNotificationId('');
      loadNotifications();
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : 'Could not save notification.');
    }
  }

  function editNotification(item: AdminNotification) {
    setEditingNotificationId(item.id);
    setNotificationForm({
      title: item.title,
      message: item.message,
      type: item.type,
      priority: item.priority,
      target: item.target,
      specificUserId: item.specific_user_id || '',
      publishAt: item.publish_at ? new Date(item.publish_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      expiresAt: item.expires_at ? new Date(item.expires_at).toISOString().slice(0, 16) : '',
      status: item.status
    });
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
  const admins = report.filter((row) => row.role === 'admin');
  const selectedReport = adminReports.find((item) => item.id === selectedReportId) || adminReports[0];
  const selectedCheatingReport = cheatingReports.find((item) => item.attemptId === selectedCheatingId) || cheatingReports[0];

  useEffect(() => {
    if (!selectedReport) return;
    setReportDraft({
      admin_remarks: selectedReport.admin_remarks || '',
      assigned_admin_id: selectedReport.assigned_admin_id || '',
      moderation_action: selectedReport.moderation_action || 'None'
    });
  }, [selectedReport?.id]);

  useEffect(() => {
    if (!selectedCheatingReport) return;
    setCheatingDraft({
      adminRemarks: selectedCheatingReport.adminRemarks || '',
      cheatingSuspected: selectedCheatingReport.cheatingSuspected
    });
  }, [selectedCheatingReport?.attemptId]);

  async function updateAdminReport(item: AdminReport, updates: Partial<AdminReport>) {
    setReportSavingId(item.id);
    setReportError('');
    try {
      await api(`/admin/reports/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: updates.status || item.status,
          adminRemarks: updates.admin_remarks ?? item.admin_remarks ?? '',
          assignedAdminId: updates.assigned_admin_id ?? item.assigned_admin_id ?? '',
          moderationAction: updates.moderation_action || item.moderation_action || 'None'
        })
      });
      loadAdminReports();
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Could not update report.');
    } finally {
      setReportSavingId('');
    }
  }

  async function updateCheatingReport(item: CheatingReport) {
    setCheatingSavingId(item.attemptId);
    setCheatingError('');
    try {
      await api(`/admin/cheating-reports/${item.attemptId}`, {
        method: 'PATCH',
        body: JSON.stringify(cheatingDraft)
      });
      loadCheatingReports();
    } catch (err) {
      setCheatingError(err instanceof Error ? err.message : 'Could not update cheating report.');
    } finally {
      setCheatingSavingId('');
    }
  }

  async function downloadCheatingCsv() {
    const qs = new URLSearchParams({ ...cheatingFilters, format: 'csv' }).toString();
    const headers = new Headers();
    const token = getToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/admin/cheating-reports?${qs}`, { headers });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cheating-reports.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

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
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] font-bold">
                  <span className="rounded bg-blue-50 px-2 py-1 text-brand">{student.authProvider || 'password'}</span>
                  <span className={`rounded px-2 py-1 ${student.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {student.emailVerified ? 'Email verified' : 'Email pending'}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-1 text-slate-600">{student.accountStatus || 'active'}</span>
                </div>
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
                <div>{student.lastSubmissionAt ? new Date(student.lastSubmissionAt).toLocaleDateString() : 'No activity'}</div>
                <div className="text-xs text-slate-400">Login: {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>
          ))}
          {!students.length && <div className="p-4 text-sm text-slate-500">No student activity yet. Student accounts will appear here after sign-up.</div>}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 font-bold"><ShieldAlert size={18} /> Cheating Reports</div>
            <div className="text-sm text-slate-500">Review mock-test proctoring violations, auto-submissions, device data, and webcam events.</div>
          </div>
          <button className="btn btn-soft" onClick={downloadCheatingCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-3">
          <input className="input" placeholder="Filter by test" value={cheatingFilters.test} onChange={(event) => setCheatingFilters({ ...cheatingFilters, test: event.target.value })} />
          <input className="input" placeholder="Filter by student" value={cheatingFilters.student} onChange={(event) => setCheatingFilters({ ...cheatingFilters, student: event.target.value })} />
          <select className="input" value={cheatingFilters.suspicious} onChange={(event) => setCheatingFilters({ ...cheatingFilters, suspicious: event.target.value })}>
            <option value="true">Suspicious only</option>
            <option value="">All violation logs</option>
          </select>
        </div>
        {cheatingError && <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{cheatingError}</div>}
        <div className="grid min-h-[440px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-r border-slate-200">
            {cheatingReports.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No cheating/proctoring reports found.</div>}
            <div className="divide-y divide-slate-100">
              {cheatingReports.map((item) => (
                <button key={item.attemptId} type="button" onClick={() => setSelectedCheatingId(item.attemptId)} className={`block w-full p-4 text-left hover:bg-slate-50 ${selectedCheatingReport?.attemptId === item.attemptId ? 'bg-red-50' : ''} ${item.autoSubmitted ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{item.studentName}</div>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.cheatingSuspected ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{item.testName} · {item.violationCount} violation(s)</div>
                  <div className="mt-1 text-xs text-slate-400">{new Date(item.startedAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {selectedCheatingReport ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedCheatingReport.testName}</h2>
                    <div className="mt-1 text-sm text-slate-500">{selectedCheatingReport.studentName} · {selectedCheatingReport.studentEmail}</div>
                    <div className="mt-1 text-xs text-slate-400">Attempt ID: {selectedCheatingReport.attemptId}</div>
                  </div>
                  <div className={`rounded px-3 py-2 text-sm font-black ${selectedCheatingReport.autoSubmitted ? 'bg-red-100 text-red-700' : selectedCheatingReport.cheatingSuspected ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {selectedCheatingReport.status}
                  </div>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-md bg-slate-50 p-3"><b>Score</b><div>{selectedCheatingReport.finalScore || 0}%</div></div>
                  <div className="rounded-md bg-slate-50 p-3"><b>Violations</b><div>{selectedCheatingReport.violationCount}</div></div>
                  <div className="rounded-md bg-slate-50 p-3"><b>Webcam</b><div>{selectedCheatingReport.webcamStatus || 'not_required'}</div></div>
                </div>
                {selectedCheatingReport.cheatingReason && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                    Reason: {selectedCheatingReport.cheatingReason}
                  </div>
                )}
                <div>
                  <div className="mb-2 text-sm font-bold">Violation Log</div>
                  <div className="space-y-2">
                    {selectedCheatingReport.violations.length === 0 && <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No detailed events stored.</div>}
                    {selectedCheatingReport.violations.map((event, index) => (
                      <div key={event.id || index} className="rounded-md border border-slate-200 p-3 text-sm">
                        <div className="font-bold text-slate-900">{event.type || event.violation_type || 'violation'}</div>
                        <div className="text-slate-600">{event.message || event.violation_message}</div>
                        <div className="mt-1 text-xs text-slate-400">{new Date(event.timestamp || event.created_at || selectedCheatingReport.startedAt).toLocaleString()} · Webcam: {event.webcamStatus || event.webcam_status || 'not_required'}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <details className="rounded-md border border-slate-200 p-3 text-sm">
                  <summary className="cursor-pointer font-bold">Device / browser information</summary>
                  <pre className="mt-2 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-50">{JSON.stringify(selectedCheatingReport.deviceInfo || {}, null, 2)}</pre>
                </details>
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">Review decision</span>
                    <select className="input" value={cheatingDraft.cheatingSuspected ? 'suspicious' : 'approved'} onChange={(event) => setCheatingDraft({ ...cheatingDraft, cheatingSuspected: event.target.value === 'suspicious' })}>
                      <option value="suspicious">Keep suspicious/rejected</option>
                      <option value="approved">Approve as normal</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">Admin remarks</span>
                    <input className="input" value={cheatingDraft.adminRemarks} onChange={(event) => setCheatingDraft({ ...cheatingDraft, adminRemarks: event.target.value })} placeholder="Add review notes" />
                  </label>
                </div>
                <button className="btn btn-primary" disabled={cheatingSavingId === selectedCheatingReport.attemptId} onClick={() => updateCheatingReport(selectedCheatingReport)}>
                  <Send size={16} />
                  {cheatingSavingId === selectedCheatingReport.attemptId ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">Select a cheating report to view details.</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> Reports</div>
          <div className="text-sm text-slate-500">Review bugs, feedback, abuse reports, wrong test cases, and account issues.</div>
        </div>
        <div className="grid gap-3 border-b border-slate-200 p-4 md:grid-cols-5">
          <select className="input" value={reportFilters.status} onChange={(event) => setReportFilters({ ...reportFilters, status: event.target.value })}>
            <option value="">All status</option><option>New</option><option>Under Review</option><option>Resolved</option><option>Rejected</option>
          </select>
          <select className="input" value={reportFilters.category} onChange={(event) => setReportFilters({ ...reportFilters, category: event.target.value })}>
            <option value="">All categories</option>
            {['Technical Bug', 'App Glitch', 'Question/Test Problem', 'Wrong Test Case or Output', 'Abusive Language', 'Misbehavior', 'Group/Chat Issue', 'Account/Login Issue', 'Suggestion', 'General Feedback'].map((category) => <option key={category}>{category}</option>)}
          </select>
          <select className="input" value={reportFilters.priority} onChange={(event) => setReportFilters({ ...reportFilters, priority: event.target.value })}>
            <option value="">All priority</option><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
          </select>
          <input className="input" placeholder="Search user" value={reportFilters.user} onChange={(event) => setReportFilters({ ...reportFilters, user: event.target.value })} />
          <input className="input" type="date" value={reportFilters.date} onChange={(event) => setReportFilters({ ...reportFilters, date: event.target.value })} />
        </div>
        {reportError && <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{reportError}</div>}
        <div className="grid min-h-[460px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border-r border-slate-200">
            {adminReports.length === 0 && <div className="p-6 text-center text-sm text-slate-500">No reports found.</div>}
            <div className="divide-y divide-slate-100">
              {adminReports.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelectedReportId(item.id)} className={`block w-full p-4 text-left hover:bg-slate-50 ${selectedReport?.id === item.id ? 'bg-blue-50' : ''} ${item.priority === 'Urgent' ? 'border-l-4 border-l-red-500' : ''}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">{item.title}</div>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Under Review' ? 'bg-blue-100 text-brand' : item.status === 'Rejected' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.priority === 'Urgent' ? 'bg-red-100 text-red-700' : item.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{item.priority}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{item.category} · {item.reporterName || 'User'}</div>
                  <div className="mt-1 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedReport.title}</h2>
                    <div className="mt-1 text-sm text-slate-500">{selectedReport.category} · {selectedReport.priority} priority</div>
                  </div>
                  <select className="input w-auto" value={selectedReport.status} onChange={(event) => updateAdminReport(selectedReport, { status: event.target.value as AdminReport['status'] })}>
                    <option>New</option><option>Under Review</option><option>Resolved</option><option>Rejected</option>
                  </select>
                </div>
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3">
                    <b>Reporter</b>
                    <div>{selectedReport.reporterName || 'Unknown user'}</div>
                    <div className="text-slate-500">{selectedReport.reporterEmail}</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <b>Related</b>
                    <div>{selectedReport.related_module || 'No module/page'}</div>
                    <div className="text-slate-500">Question: {selectedReport.related_question_id || 'Not provided'}</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 md:col-span-2">
                    <b>Reported user details</b>
                    <div>{selectedReport.reported_user_identifier || selectedReport.reportedUserName || 'Not applicable'}</div>
                    <div className="text-slate-500">Reporter identity is not shown to the reported user.</div>
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-sm font-bold">Description</div>
                  <div className="whitespace-pre-line rounded-md border border-slate-200 p-3 text-sm text-slate-700">{selectedReport.description}</div>
                </div>
                {selectedReport.attachment_url && (
                  <a className="btn btn-soft" href={selectedReport.attachment_url} target="_blank" rel="noreferrer">
                    <FileText size={16} />
                    {selectedReport.attachment_name || 'Open attachment'}
                  </a>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">Assign to admin/moderator</span>
                    <select className="input" value={reportDraft.assigned_admin_id} onChange={(event) => setReportDraft({ ...reportDraft, assigned_admin_id: event.target.value })}>
                      <option value="">Unassigned</option>
                      {admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-bold">Moderation action</span>
                    <select className="input" value={reportDraft.moderation_action} onChange={(event) => setReportDraft({ ...reportDraft, moderation_action: event.target.value })}>
                      <option>None</option><option>Warning Placeholder</option><option>Suspend Placeholder</option><option>Ban Placeholder</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Admin remarks</span>
                  <textarea className="input min-h-24" value={reportDraft.admin_remarks} onChange={(event) => setReportDraft({ ...reportDraft, admin_remarks: event.target.value })} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary" disabled={reportSavingId === selectedReport.id} onClick={() => updateAdminReport(selectedReport, reportDraft as Partial<AdminReport>)}>
                    <Send size={16} />
                    {reportSavingId === selectedReport.id ? 'Saving...' : 'Save Report'}
                  </button>
                  <button className="btn btn-soft" onClick={async () => { await api(`/admin/reports/${selectedReport.id}`, { method: 'DELETE' }); setSelectedReportId(''); loadAdminReports(); }}>
                    <Trash2 size={16} />
                    Delete Spam/False Report
                  </button>
                </div>
                <div>
                  <div className="mb-2 text-sm font-bold">Comments & Follow-ups</div>
                  <div className="space-y-2">
                    {(selectedReport.comments || []).length === 0 && <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No follow-up comments yet.</div>}
                    {(selectedReport.comments || []).map((comment) => (
                      <div key={comment.id} className={`rounded-md p-3 text-sm ${comment.is_admin ? 'bg-blue-50 text-brand' : 'bg-slate-50 text-slate-700'}`}>
                        <b>{comment.is_admin ? 'Admin' : comment.authorName || 'User'}:</b> {comment.comment}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid h-full place-items-center text-sm text-slate-500">Select a report to view details.</div>
            )}
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 font-bold"><Bell size={18} /> Notifications</div>
          <div className="text-sm text-slate-500">Create announcements, app updates, maintenance alerts, and custom messages.</div>
        </div>
        <form onSubmit={saveNotification} className="grid gap-3 p-5 lg:grid-cols-2">
          <input className="input lg:col-span-2" placeholder="Notification title" value={notificationForm.title} onChange={(event) => setNotificationForm({ ...notificationForm, title: event.target.value })} required />
          <textarea className="input min-h-24 lg:col-span-2" placeholder="Notification message" value={notificationForm.message} onChange={(event) => setNotificationForm({ ...notificationForm, message: event.target.value })} required />
          <select className="input" value={notificationForm.type} onChange={(event) => setNotificationForm({ ...notificationForm, type: event.target.value })}>
            <option>Feature Update</option><option>App Change</option><option>Announcement</option><option>Maintenance</option><option>General</option>
          </select>
          <select className="input" value={notificationForm.priority} onChange={(event) => setNotificationForm({ ...notificationForm, priority: event.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <select className="input" value={notificationForm.target} onChange={(event) => setNotificationForm({ ...notificationForm, target: event.target.value })}>
            <option>All Users</option><option>Students</option><option>Admins</option><option>Specific User</option>
          </select>
          {notificationForm.target === 'Specific User' ? (
            <select className="input" value={notificationForm.specificUserId} onChange={(event) => setNotificationForm({ ...notificationForm, specificUserId: event.target.value })} required>
              <option value="">Select user</option>
              {report.map((row) => <option key={row.id} value={row.id}>{row.name} ({row.email})</option>)}
            </select>
          ) : (
            <div className="input bg-slate-50 text-slate-500">No specific user needed</div>
          )}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Publish date/time</span>
            <input className="input" type="datetime-local" value={notificationForm.publishAt} onChange={(event) => setNotificationForm({ ...notificationForm, publishAt: event.target.value })} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Expiry date/time</span>
            <input className="input" type="datetime-local" value={notificationForm.expiresAt} onChange={(event) => setNotificationForm({ ...notificationForm, expiresAt: event.target.value })} />
          </label>
          <select className="input" value={notificationForm.status} onChange={(event) => setNotificationForm({ ...notificationForm, status: event.target.value as 'Draft' | 'Published' })}>
            <option>Draft</option><option>Published</option>
          </select>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1"><Plus size={16} /> {editingNotificationId ? 'Save Notification' : 'Create Notification'}</button>
            {editingNotificationId && <button className="btn btn-soft" type="button" onClick={() => { setEditingNotificationId(''); setNotificationForm({ ...emptyNotification, publishAt: new Date().toISOString().slice(0, 16) }); }}>Cancel</button>}
          </div>
          {notificationError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 lg:col-span-2">{notificationError}</div>}
        </form>
        <div className="divide-y divide-slate-100 border-t border-slate-200">
          {notifications.length === 0 && <div className="p-4 text-sm text-slate-500">No notifications yet.</div>}
          {notifications.map((item) => (
            <div key={item.id} className="grid gap-3 p-4 xl:grid-cols-[1fr_160px_140px_210px] xl:items-center">
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-slate-600">{item.message}</div>
                <div className="mt-1 text-xs text-slate-500">{item.type} · {item.priority} · {item.target}</div>
              </div>
              <div className={`rounded px-2 py-1 text-center text-xs font-bold ${item.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</div>
              <div className="text-sm text-slate-500">{item.readCount || 0} reads</div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-soft" onClick={() => editNotification(item)}><Edit2 size={15} /></button>
                {item.status !== 'Published' && <button className="btn btn-soft" onClick={async () => { await api(`/admin/notifications/${item.id}/publish`, { method: 'PATCH' }); loadNotifications(); }}><Send size={15} /></button>}
                <button className="btn btn-soft" onClick={async () => { await api(`/admin/notifications/${item.id}`, { method: 'DELETE' }); loadNotifications(); }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
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
