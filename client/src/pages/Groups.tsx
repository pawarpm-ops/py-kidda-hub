import { useEffect, useState } from 'react';
import { Camera, Crown, Loader2, LogOut, Plus, Save, Send, ShieldMinus, ShieldPlus, Trash2, UserRound, Users } from 'lucide-react';
import { api, getUser } from '../lib/api';

type Student = { id: string; name: string; profilePictureUrl?: string | null; status?: string; isAdmin?: boolean };
type Group = { id: string; name: string; picture_url?: string | null; created_by: string; members?: Student[]; latestMessage?: any; isCurrentUserAdmin?: boolean; memberCount?: number };
type GroupMessage = { id: string; sender_id: string; message_text: string; created_at: string; sender?: Student };

function Avatar({ src, name, size = 'h-10 w-10' }: { src?: string | null; name?: string; size?: string }) {
  return <div className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full bg-blue-50 text-brand`}>{src ? <img className="h-full w-full object-cover" src={src} alt={name || 'Profile'} /> : <UserRound size={18} />}</div>;
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read selected image.'));
    reader.readAsDataURL(file);
  });
}

export default function Groups() {
  const user = getUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [picture, setPicture] = useState<{ name: string; type: string; dataUrl: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refreshGroups(selectId?: string) {
    const [groupRows, friendRows] = await Promise.all([api<Group[]>('/groups'), api<Student[]>('/friends')]);
    setGroups(groupRows);
    setFriends(friendRows);
    const target = groupRows.find((group) => group.id === (selectId || selected?.id)) || null;
    if (target) await openGroup(target, false);
  }

  useEffect(() => {
    refreshGroups().catch((err) => setError(err instanceof Error ? err.message : 'Could not load groups.')).finally(() => setLoading(false));
  }, []);

  async function choosePicture(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Group picture should be an image file.');
      return;
    }
    setPicture({ name: file.name, type: file.type, dataUrl: await readImage(file) });
  }

  async function openGroup(group: Group, clearError = true) {
    if (clearError) setError('');
    const [detail, groupMessages] = await Promise.all([api<Group>(`/groups/${group.id}`), api<GroupMessage[]>(`/groups/${group.id}/messages`)]);
    setSelected(detail);
    setMessages(groupMessages);
    setName(detail.name);
  }

  async function createGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      const group = await api<Group>('/groups', { method: 'POST', body: JSON.stringify({ name: name.trim(), picture }) });
      setName('');
      setPicture(undefined);
      await refreshGroups(group.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create group.');
    }
  }

  async function saveGroup() {
    if (!selected || !name.trim()) return;
    setError('');
    try {
      await api(`/groups/${selected.id}`, { method: 'PUT', body: JSON.stringify({ name: name.trim(), picture }) });
      setPicture(undefined);
      await refreshGroups(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update group.');
    }
  }

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    const text = message.trim();
    setMessage('');
    try {
      const created = await api<GroupMessage>(`/groups/${selected.id}/messages`, { method: 'POST', body: JSON.stringify({ message: text }) });
      setMessages((current) => [...current, created]);
      refreshGroups(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
      setMessage(text);
    }
  }

  async function act(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
      await refreshGroups(selected?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    }
  }

  const currentMember = selected?.members?.find((member) => member.id === user?.id);
  const isAdmin = Boolean(currentMember?.isAdmin || selected?.isCurrentUserAdmin);
  const members = selected?.members || [];
  const inviteable = friends.filter((friend) => !members.some((member) => member.id === friend.id));

  if (loading) {
    return <div className="panel flex min-h-72 items-center justify-center gap-2 p-6 text-slate-500"><Loader2 className="animate-spin" size={18} /> Loading groups</div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="space-y-5">
        <form onSubmit={createGroup} className="panel p-5">
          <h1 className="text-2xl font-bold tracking-normal">Groups</h1>
          <p className="mt-1 text-sm text-slate-600">Create study groups and discuss Python doubts with friends.</p>
          <div className="mt-4 space-y-3">
            <input className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder={selected && isAdmin ? 'Edit group name' : 'New group name'} />
            <div className="flex flex-wrap gap-2">
              <label className="btn btn-soft cursor-pointer">
                <Camera size={16} />
                Group Picture
                <input className="hidden" type="file" accept="image/*" onChange={choosePicture} />
              </label>
              <button className="btn btn-primary" type="submit"><Plus size={16} /> Create Group</button>
              {selected && isAdmin && <button className="btn btn-soft" type="button" onClick={saveGroup}><Save size={16} /> Save Selected</button>}
            </div>
          </div>
          {error && <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        </form>

        <div className="panel p-5">
          <h2 className="font-bold">My Groups</h2>
          <div className="mt-3 space-y-2">
            {groups.length === 0 && <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">No groups yet</div>}
            {groups.map((group) => (
              <button key={group.id} className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${selected?.id === group.id ? 'border-brand bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => openGroup(group)}>
                <Avatar src={group.picture_url} name={group.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{group.name}</div>
                  <div className="text-xs text-slate-500">{group.members?.length || group.memberCount || 1} members</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="panel grid min-h-[680px] overflow-hidden xl:grid-cols-[0.66fr_0.34fr]">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200 p-4">
            <Avatar src={selected?.picture_url} name={selected?.name} />
            <div>
              <h2 className="font-bold">{selected?.name || 'Group Chat'}</h2>
              <p className="text-sm text-slate-500">{selected ? `${members.length} members` : 'Select a group to start messaging.'}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {!selected && <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Create or select a group.</div>}
            {selected && messages.length === 0 && <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No messages yet.</div>}
            {messages.map((item) => {
              const mine = item.sender_id === user?.id;
              return (
                <div key={item.id} className={`flex gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine && <Avatar src={item.sender?.profilePictureUrl} name={item.sender?.name} size="h-8 w-8" />}
                  <div className={`max-w-[78%] rounded-lg px-3 py-2 ${mine ? 'bg-brand text-white' : 'bg-slate-100 text-slate-900'}`}>
                    {!mine && <div className="mb-1 text-xs font-bold text-brand">{item.sender?.name}</div>}
                    <div className="text-sm">{item.message_text}</div>
                    <div className={`mt-1 text-[11px] ${mine ? 'text-blue-100' : 'text-slate-500'}`}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-200 p-3">
            <input className="input" disabled={!selected} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={selected ? 'Message the group...' : 'Select a group first'} />
            <button className="btn btn-primary" disabled={!selected || !message.trim()}><Send size={16} /></button>
          </form>
        </div>

        <aside className="border-t border-slate-200 p-4 xl:border-l xl:border-t-0">
          <div className="flex items-center gap-2 font-bold"><Users size={17} /> Members</div>
          {!selected && <div className="mt-3 text-sm text-slate-500">No group selected</div>}
          {selected && (
            <>
              <div className="mt-3 space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="rounded-lg border border-slate-200 p-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={member.profilePictureUrl} name={member.name} size="h-8 w-8" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold">{member.name}</div>
                        {member.isAdmin && <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700"><Crown size={12} /> Admin</div>}
                      </div>
                    </div>
                    {isAdmin && member.id !== user?.id && (
                      <div className="mt-2 flex gap-1">
                        <button className="btn btn-soft flex-1 px-2 py-1 text-xs" onClick={() => act(() => api(`/groups/${selected.id}/members/${member.id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin: !member.isAdmin }) }))}>
                          {member.isAdmin ? <ShieldMinus size={13} /> : <ShieldPlus size={13} />}
                          {member.isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button className="btn btn-soft px-2 py-1 text-xs" onClick={() => act(() => api(`/groups/${selected.id}/members/${member.id}`, { method: 'DELETE' }))}><Trash2 size={13} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isAdmin && (
                <div className="mt-5">
                  <div className="text-sm font-bold">Invite Friends</div>
                  <div className="mt-2 space-y-2">
                    {inviteable.length === 0 && <div className="text-sm text-slate-500">No friends available to add</div>}
                    {inviteable.map((friend) => (
                      <button key={friend.id} className="flex w-full items-center justify-between rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50" onClick={() => act(() => api(`/groups/${selected.id}/members`, { method: 'POST', body: JSON.stringify({ userId: friend.id }) }))}>
                        <span className="flex min-w-0 items-center gap-2"><Avatar src={friend.profilePictureUrl} name={friend.name} size="h-8 w-8" /><span className="truncate text-sm font-bold">{friend.name}</span></span>
                        <Plus size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn btn-soft mt-5 w-full" onClick={() => act(() => api(`/groups/${selected.id}/leave`, { method: 'POST' }))}>
                <LogOut size={15} />
                Leave Group
              </button>
            </>
          )}
        </aside>
      </section>
    </div>
  );
}
