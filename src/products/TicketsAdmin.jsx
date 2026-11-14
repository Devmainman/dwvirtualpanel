// Support inbox: every user ticket, the conversation, reply, close / reopen.
import { useEffect, useRef, useState } from 'react';
import { LifeBuoy, Send, Paperclip, X, Lock, Unlock, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { STATIC_BASE_URL } from '../api/config';
import { Page, Card, Button, Badge, Loading, ErrorBox, Empty, SearchBox, useApi, useLoad, useAction, date } from './kit';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const PRIORITY_TONE = { High: 'red', Medium: 'amber', Low: 'gray' };

function Conversation({ ticketId, onChanged }) {
  const api = useApi();
  const t = useLoad(() => api.get(`/tickets/${ticketId}`).then((r) => r.data.ticket), [ticketId]);
  const { busy, run } = useAction();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const ticket = t.data;

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [ticket?.messages?.length]);
  useEffect(() => {
    const id = setInterval(() => t.reload(), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  const send = () => run('send', async () => {
    const fd = new FormData();
    if (text.trim()) fd.append('text', text.trim());
    if (file) fd.append('attachment', file);
    await api.post(`/tickets/${ticketId}/messages`, fd);
    setText('');
    setFile(null);
    t.reload();
    onChanged();
  }, 'Reply sent — the user was notified');

  const setStatus = (action) => run(action, async () => {
    await api.put(`/tickets/${ticketId}/${action}`);
    t.reload();
    onChanged();
  }, action === 'close' ? 'Ticket closed' : 'Ticket reopened');

  if (t.error) return <div className="p-4"><ErrorBox message={t.error} onRetry={t.reload} /></div>;
  if (!ticket) return <Loading />;
  return (
    <div className="flex flex-col h-full min-h-[560px]">
      <header className="flex items-start gap-3 px-5 py-4 border-b border-[#2F3944]">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{ticket.subject}</p>
          <p className="text-[11px] text-[#8C96A8] truncate">{ticket.customer?.name} · {ticket.customer?.email} · {ticket.customer?.accountType}</p>
          <div className="flex gap-1 mt-1.5"><Badge>{ticket.status === 'Open' ? 'open' : 'closed'}</Badge><Badge tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority}</Badge></div>
        </div>
        {ticket.status === 'Open'
          ? <Button size="sm" variant="secondary" busy={busy === 'close'} onClick={() => setStatus('close')}><Lock size={12} />Close</Button>
          : <Button size="sm" variant="secondary" busy={busy === 'reopen'} onClick={() => setStatus('reopen')}><Unlock size={12} />Reopen</Button>}
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[520px]">
        {ticket.messages.map((m, i) => {
          const support = m.sender === 'support';
          return (
            <div key={m._id || i} className={`flex ${support ? 'justify-end' : 'justify-start'} pk-row`} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${support ? 'bg-blue-600 text-white rounded-br-md' : 'bg-[#303943] text-[#DDE3EC] rounded-bl-md'}`}>
                <p className="text-[10px] opacity-70 mb-0.5">{support ? 'Support' : ticket.customer?.name || 'Customer'} · {date(m.timestamp)}</p>
                <p className="text-xs whitespace-pre-wrap break-words">{m.text}</p>
                {(m.attachments || []).map((a) => (/\.pdf$/i.test(a)
                  ? <a key={a} href={fileUrl(a)} target="_blank" rel="noreferrer" className="block mt-2 text-[11px] underline">Open PDF attachment</a>
                  : <a key={a} href={fileUrl(a)} target="_blank" rel="noreferrer" className="block mt-2"><img src={fileUrl(a)} alt="Attachment" className="max-h-48 rounded-lg" /></a>))}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-[#2F3944] p-3">
        {file && (
          <div className="flex items-center gap-2 mb-2 text-[11px] text-[#A5AFC4]">
            <Paperclip size={12} />{file.name}
            <button type="button" onClick={() => setFile(null)} className="text-red-400" aria-label="Remove attachment"><X size={12} /></button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = '';
            if (f && f.size > 2 * 1024 * 1024) return toast.error('File size exceeds 2MB limit');
            return setFile(f || null);
          }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-xl bg-[#303943] text-[#A5AFC4] hover:text-white flex items-center justify-center shrink-0" aria-label="Attach file"><Paperclip size={14} /></button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
            rows={2}
            maxLength={4000}
            placeholder="Write a reply… (Ctrl+Enter to send)"
            className="flex-1 bg-[#303943] border border-[#3A4451] text-[#DDE3EC] placeholder-[#6B7280] px-3 py-2 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          />
          <Button busy={busy === 'send'} disabled={!text.trim() && !file} onClick={send}><Send size={13} />Send</Button>
        </div>
      </div>
    </div>
  );
}

export default function TicketsAdmin() {
  const api = useApi();
  const [status, setStatus] = useState('Open');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  useEffect(() => { const id = setTimeout(() => setSearch(q.trim()), 300); return () => clearTimeout(id); }, [q]);
  const list = useLoad(() => api.get('/tickets', { params: { status: status || undefined, search: search || undefined } }).then((r) => r.data.tickets || []), [status, search]);
  useEffect(() => {
    const id = setInterval(() => list.reload(), 20000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);
  const tickets = list.data || [];

  return (
    <Page title="Support" subtitle="Reply to user tickets. Users are notified instantly when you answer." icon={LifeBuoy}
      actions={<><SearchBox value={q} onChange={setQ} placeholder="Subject, name or email" /><Button variant="secondary" onClick={list.reload}><RefreshCw size={13} />Refresh</Button></>}>
      <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-4 items-start">
        <Card pad={false}>
          <div className="flex p-2 gap-1 border-b border-[#2F3944]">
            {[['Open', 'Open'], ['Closed', 'Closed'], ['', 'All']].map(([v, l]) => (
              <button key={l} type="button" onClick={() => setStatus(v)} className={`flex-1 h-8 rounded-lg text-xs font-medium transition ${status === v ? 'bg-[#303943] text-white' : 'text-[#8C96A8] hover:text-white'}`}>{l}</button>
            ))}
          </div>
          {list.error && <div className="p-3"><ErrorBox message={list.error} onRetry={list.reload} /></div>}
          {list.loading && !list.data ? <Loading /> : !tickets.length ? <Empty icon={LifeBuoy} title="No tickets here" /> : (
            <ul className="max-h-[640px] overflow-y-auto">
              {tickets.map((t, i) => {
                const last = t.messages?.[t.messages.length - 1];
                const waiting = t.status === 'Open' && last?.sender === 'user';
                return (
                  <li key={t._id} className="pk-row" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
                    <button type="button" onClick={() => setOpenId(t._id)} className={`w-full text-left px-4 py-3 border-b border-[#2F3944]/60 transition ${openId === t._id ? 'bg-blue-500/10' : 'hover:bg-white/[0.03]'}`}>
                      <div className="flex items-center gap-2">
                        {waiting && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" title="Waiting for support" />}
                        <p className="flex-1 text-sm text-white truncate">{t.subject}</p>
                        <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                      </div>
                      <p className="text-[11px] text-[#8C96A8] truncate mt-0.5">{t.customer?.name} · {last?.text}</p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">{date(t.lastMessageAt || t.updatedAt)}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card pad={false}>
          {openId ? <Conversation key={openId} ticketId={openId} onChanged={list.reload} /> : <Empty icon={LifeBuoy} title="Pick a ticket" text="Select a ticket on the left to read and reply." />}
        </Card>
      </div>
    </Page>
  );
}
