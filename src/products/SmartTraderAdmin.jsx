// AI Smart Trader (create / edit bots and their trade limits) and
// Bot Invoices (user subscriptions: approve or reject the payment, watch trades used).
import { useState } from 'react';
import { Bot, Plus, Pencil, Check, X, Eye, Ban, RotateCcw, Square, Receipt } from 'lucide-react';
import {
  useApi, useLoad, useAction, money, num, date, shortDate, who, Page, Card, Badge, Button, Field, inputCls,
  Tabs, SearchBox, Loading, Empty, ErrorBox, Table, Pager, Modal, confirmAction
} from './kit';
import { STATIC_BASE_URL } from '../api/config';

const fileUrl = (p) => (p ? (/^https?:/.test(p) ? p : `${STATIC_BASE_URL}${p}`) : '');
const EMPTY = {
  name: '', description: '', strategy: 'Trend following', price: '', tradeLimit: '', tradeIntervalMinutes: '60',
  minAllocation: '100', winRate: '70', profitMin: '0.5', profitMax: '2', lossMin: '0.3', lossMax: '1', markets: 'BTC, ETH, SOL, BNB, XRP', status: 'available'
};

function BotForm({ initial, currency, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? { ...EMPTY, ...Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : v ?? ''])) } : EMPTY);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = () => {
    setError('');
    if (!String(f.name).trim()) return setError('Give the bot a name');
    if (String(f.price) === '' || String(f.tradeLimit) === '') return setError('Set the price and the total number of trades');
    const body = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, f[k]]));
    run('save', () => (initial ? api.put(`/admin/smart-bots/${initial._id}`, body) : api.post('/admin/smart-bots', body)), initial ? 'Bot updated' : 'Bot created')
      .then((r) => { if (r) { onSaved(); onClose(); } });
  };
  const n = (k, label, hint) => <Field label={label} hint={hint}><input className={inputCls} inputMode="decimal" value={f[k]} onChange={set(k)} /></Field>;
  return (
    <Modal open wide title={initial ? `Edit ${initial.name}` : 'Create an AI Smart Trader'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}><Check size={13} />{initial ? 'Save changes' : 'Create bot'}</Button></>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Bot name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. AI Smart Trader Pro" /></Field>
        <Field label="Strategy"><input className={inputCls} value={f.strategy} onChange={set('strategy')} placeholder="e.g. Trend following" /></Field>
      </div>
      <Field label="Description (users see this)"><input className={inputCls} value={f.description} onChange={set('description')} /></Field>
      <div className="grid sm:grid-cols-3 gap-3">
        {n('price', `Subscription price (${currency})`)}
        {n('tradeLimit', 'Total trades', 'The bot stops after this many trades')}
        {n('tradeIntervalMinutes', 'Minutes between trades')}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {n('minAllocation', `Minimum capital (${currency})`, 'What the bot trades with')}
        {n('winRate', 'Win rate %', 'Share of trades that win')}
        <Field label="Status"><select className={inputCls} value={f.status} onChange={set('status')}><option value="available">Available</option><option value="unavailable">Hidden from users</option></select></Field>
      </div>
      <div className="grid sm:grid-cols-4 gap-3">
        {n('profitMin', 'Win: smallest %')}
        {n('profitMax', 'Win: largest %')}
        {n('lossMin', 'Loss: smallest %')}
        {n('lossMax', 'Loss: largest %')}
      </div>
      <p className="text-[11px] text-[#8C96A8]">Each trade gains or loses this percentage of the capital the user gave the bot. The result goes to the user's balance.</p>
      <Field label="Markets it trades" hint="Comma separated, e.g. BTC, ETH, SOL"><input className={inputCls} value={f.markets} onChange={set('markets')} /></Field>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </Modal>
  );
}

export function SmartTraderAdmin() {
  const api = useApi();
  const [edit, setEdit] = useState(null);
  const { busy, run } = useAction();
  const c = useLoad(() => api.get('/admin/smart-bots').then((r) => r.data.data), []);
  const toggle = (b) => run(b._id, () => api.put(`/admin/smart-bots/${b._id}`, { status: b.status === 'available' ? 'unavailable' : 'available' }).then(c.reload), b.status === 'available' ? 'Bot hidden' : 'Bot available');
  const items = c.data?.items || [];
  return (
    <Page title="AI Smart Trader" subtitle="Create trading bots users can subscribe to. Each subscription places a set number of trades for the user." icon={Bot}
      actions={<Button onClick={() => setEdit('new')}><Plus size={13} />Create bot</Button>}>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : !items.length ? (
        <Card><Empty icon={Bot} title="No bots yet" text="Create a bot and it appears on the users' AI Smart Trader page." /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((b, i) => (
            <article key={b._id} className={`bg-[#282F36] border border-[#2F3944] rounded-2xl p-4 pk-rise ${b.status === 'unavailable' ? 'opacity-60' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center shrink-0"><Bot size={17} /></span>
                  <div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{b.name}</p><p className="text-[11px] text-[#8C96A8]">{b.strategy}</p></div>
                </div>
                <Badge tone={b.status === 'available' ? 'green' : 'gray'}>{b.status}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] mt-3">
                <div><p className="text-[#6B7280]">Price</p><p className="text-white">{money(b.price, c.data.currency)}</p></div>
                <div><p className="text-[#6B7280]">Trades</p><p className="text-white">{num(b.tradeLimit, 0)}</p></div>
                <div><p className="text-[#6B7280]">Every</p><p className="text-white">{b.tradeIntervalMinutes} min</p></div>
                <div><p className="text-[#6B7280]">Win rate</p><p className="text-white">{b.winRate}%</p></div>
                <div><p className="text-[#6B7280]">Subscribers</p><p className="text-white">{b.subscribers} ({b.active} live)</p></div>
                <div><p className="text-[#6B7280]">Trades placed</p><p className="text-white">{num(b.tradesPlaced, 0)}</p></div>
              </div>
              <p className="text-[10px] text-[#6B7280] mt-2 truncate">{(b.markets || []).join(' · ')}</p>
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#2F3944]">
                <Button size="sm" variant="secondary" onClick={() => setEdit(b)}><Pencil size={12} />Edit</Button>
                <Button size="sm" variant={b.status === 'available' ? 'danger' : 'success'} busy={busy === b._id} onClick={() => toggle(b)}>{b.status === 'available' ? <><Ban size={12} />Hide</> : <><RotateCcw size={12} />Show</>}</Button>
                <span className="ml-auto text-[10px] text-[#6B7280] self-center">{shortDate(b.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
      {edit && <BotForm initial={edit === 'new' ? null : edit} currency={c.data?.currency || 'USD'} onClose={() => setEdit(null)} onSaved={c.reload} />}
    </Page>
  );
}

/* ============================ Bot Invoices ============================ */

const STATUS_TONE = { awaiting_payment: 'gray', pending: 'amber', active: 'green', completed: 'blue', rejected: 'red', stopped: 'gray', cancelled: 'gray' };
const STATUS_LABEL = { awaiting_payment: 'Awaiting payment', pending: 'Payment to review', active: 'Trading', completed: 'Completed', rejected: 'Rejected', stopped: 'Stopped', cancelled: 'Cancelled' };

function SubDetail({ id, onClose, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const d = useLoad(() => api.get(`/admin/bot-invoices/${id}`).then((r) => r.data.data), [id]);
  const [reject, setReject] = useState(false);
  const [note, setNote] = useState('');
  const s = d.data;
  const act = (decision, body = {}) => run(decision, () => api.patch(`/admin/bot-invoices/${id}/${decision}`, body), decision === 'approve' ? 'Payment approved, bot is trading' : decision === 'reject' ? 'Payment rejected' : 'Bot stopped')
    .then((r) => { if (r) { setReject(false); d.reload(); onChanged(); } });
  return (
    <Modal open wide title="Bot subscription" onClose={onClose}>
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {!s ? <Loading /> : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3 text-[11px]">
            <div><p className="text-[#6B7280]">User</p><p className="text-white">{who(s.user)}</p><p className="text-[#8C96A8] break-all">{s.user?.email}</p></div>
            <div><p className="text-[#6B7280]">Bot</p><p className="text-white">{s.botSnapshot?.name}</p><Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge></div>
            <div><p className="text-[#6B7280]">Capital</p><p className="text-white">{money(s.allocation, s.currency)}</p></div>
            <div><p className="text-[#6B7280]">Trades used</p><p className="text-white">{s.tradesUsed} / {s.tradeLimit}</p><p className="text-[#8C96A8]">P/L {money(s.totalPnl, s.currency)}</p></div>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${Math.min(100, (s.tradesUsed / Math.max(1, s.tradeLimit)) * 100)}%` }} /></div>
          <div className="rounded-2xl border border-[#2F3944] p-3 space-y-2">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-white">Subscription payment</p><Badge>{s.payment?.status || 'unpaid'}</Badge></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div><p className="text-[#6B7280]">Amount</p><p className="text-white">{money(s.payment?.amount, s.payment?.currency)}</p></div>
              <div><p className="text-[#6B7280]">Method</p><p className="text-white">{s.payment?.paymentMethod || '—'}</p></div>
              <div><p className="text-[#6B7280]">Submitted</p><p className="text-white">{date(s.payment?.submittedAt)}</p></div>
              <div><p className="text-[#6B7280]">Reference</p><p className="text-white break-all">{s.payment?.reference || '—'}</p></div>
            </div>
            {s.payment?.note && <p className="text-[11px] text-[#A5AFC4]">Note: {s.payment.note}</p>}
            {s.payment?.proof && <a href={fileUrl(s.payment.proof)} target="_blank" rel="noreferrer" className="block"><img src={fileUrl(s.payment.proof)} alt="Payment proof" className="w-full max-h-56 object-contain rounded-xl bg-black/30" onError={(e) => { e.currentTarget.style.display = 'none'; }} /><span className="text-[11px] text-blue-400">Open payment proof</span></a>}
            <div className="flex gap-2">
              {s.status === 'pending' && <><Button size="sm" variant="success" busy={busy === 'approve'} onClick={() => act('approve')}><Check size={12} />Approve</Button><Button size="sm" variant="danger" onClick={() => setReject(true)}><X size={12} />Reject</Button></>}
              {s.status === 'active' && <Button size="sm" variant="danger" busy={busy === 'stop'} onClick={() => confirmAction('Stop this bot? It places no more trades for this user.') && act('stop')}><Square size={12} />Stop bot</Button>}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white mb-2">Trades ({s.trades?.length || 0})</p>
            <Table rows={s.trades || []} empty={<Empty icon={Bot} title="No trades yet" />} columns={[
              { key: 'number', label: '#' },
              { key: 'market', label: 'Market' },
              { key: 'side', label: 'Side', render: (t) => <span className="capitalize">{t.side}</span> },
              { key: 'result', label: 'Result', render: (t) => <Badge tone={t.result === 'win' ? 'green' : 'red'}>{t.result}</Badge> },
              { key: 'pnl', label: 'P/L', align: 'right', render: (t) => <span className={t.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{money(t.pnl, t.currency)}</span> },
              { key: 'closedAt', label: 'Closed', render: (t) => date(t.closedAt) }
            ]} />
          </div>
        </div>
      )}
      {reject && (
        <Modal open title="Reject payment" onClose={() => setReject(false)}
          footer={<><Button variant="secondary" onClick={() => setReject(false)}>Cancel</Button><Button variant="danger" busy={busy === 'reject'} disabled={!note.trim()} onClick={() => act('reject', { note })}>Reject payment</Button></>}>
          <Field label="Reason (the user sees this)"><textarea className={`${inputCls} h-20 py-2`} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </Modal>
      )}
    </Modal>
  );
}

export function BotInvoices() {
  const api = useApi();
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const c = useLoad(() => api.get('/admin/bot-invoices', { params: { status: status || undefined, search: search || undefined, page, limit: 20 } }).then((r) => r.data.data), [status, search, page]);
  const counts = c.data?.counts || {};
  return (
    <Page title="Bot Invoices" subtitle="AI Smart Trader subscriptions. Approve the payment to start the bot; watch how many trades each one has used." icon={Receipt}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[
          { value: 'pending', label: `To review${counts.pending ? ` (${counts.pending})` : ''}` },
          { value: 'active', label: 'Trading' },
          { value: 'completed', label: 'Completed' },
          { value: 'awaiting_payment', label: 'Awaiting payment' },
          { value: '', label: 'All' }
        ]} />
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search user or bot…" />
      </div>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : (
        <Card>
          <Table rows={c.data?.items || []} onRowClick={(r) => setOpen(r._id)} empty={<Empty icon={Receipt} title={status === 'pending' ? 'No payments waiting for review' : 'Nothing here'} />} columns={[
            { key: 'user', label: 'User', render: (r) => <div><p className="text-white">{who(r.user)}</p><p className="text-[10px] text-[#8C96A8]">{r.user?.email}</p></div> },
            { key: 'bot', label: 'Bot', render: (r) => r.botSnapshot?.name },
            { key: 'price', label: 'Paid', render: (r) => money(r.payment?.amount, r.payment?.currency) },
            { key: 'trades', label: 'Trades used', render: (r) => `${r.tradesUsed} / ${r.tradeLimit}` },
            { key: 'status', label: 'Status', render: (r) => <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge> },
            { key: 'date', label: 'Date', render: (r) => shortDate(r.createdAt) },
            { key: 'act', label: '', render: (r) => <Button size="sm" variant={r.status === 'pending' ? 'primary' : 'secondary'} onClick={(e) => { e.stopPropagation(); setOpen(r._id); }}>{r.status === 'pending' ? <><Check size={12} />Review</> : <><Eye size={12} />View</>}</Button> }
          ]} />
        </Card>
      )}
      {c.data && <Pager page={page} total={c.data.total} limit={c.data.limit} onPage={setPage} />}
      {open && <SubDetail id={open} onClose={() => setOpen(null)} onChanged={c.reload} />}
    </Page>
  );
}
