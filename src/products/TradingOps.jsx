// Live-market positions, trading-package trades, mining catalog,
// notification broadcast and exchange-rate sync.
import { useEffect, useState } from 'react';
import { Activity, Bot, Cpu, Bell, RefreshCw, Send, Globe, Zap, ArrowRight, Plus } from 'lucide-react';
import {
  Page, Card, Stat, Button, Field, Toggle, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, num, date, who, confirmAction
} from './kit';

const UserCell = ({ u }) => <div><p className="text-white">{who(u)}</p><p className="text-[10px] text-[#6B7280]">{u?.email}</p></div>;

/* ------------------------------------------------------------ live markets */

function CloseModal({ pos, onClose, onDone }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [price, setPrice] = useState('');
  return (
    <Modal open title={`Close ${pos.side} ${pos.symbol}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" busy={busy === 'c'} onClick={() => run('c', () => api.post(`/admin/ops/market/positions/${pos._id}/close`, price ? { price: Number(price) } : {}).then(() => { onDone(); onClose(); }), 'Position closed and settled')}>Close position</Button></>}>
      <p className="text-xs text-[#A5AFC4]">Margin {money(pos.margin, pos.currency)} at {pos.leverage}× · entry {num(pos.entryPrice, 6)}</p>
      <Field label="Close price" hint="Leave empty to close at the live market price. The user is paid margin ± P/L and notified.">
        <input type="number" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Live price" />
      </Field>
    </Modal>
  );
}

export function MarketsAdmin() {
  const api = useApi();
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const [closing, setClosing] = useState(null);
  const p = useLoad(() => api.get('/admin/ops/market/positions', { params: { page, limit: 25, status } }).then((r) => r.data.data), [page, status]);
  return (
    <Page title="Live markets" subtitle="Leveraged crypto and forex positions opened from the trading screen." icon={Activity}
      actions={<Button variant="secondary" onClick={p.reload}><RefreshCw size={13} />Refresh</Button>}>
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[{ value: 'open', label: `Open${p.data?.open != null ? ` (${p.data.open})` : ''}` }, { value: 'closed', label: 'Closed' }]} />
      <Card>
        {p.error && <ErrorBox message={p.error} onRetry={p.reload} />}
        {p.loading && !p.data ? <Loading /> : (
          <>
            <Table rows={p.data?.items} empty={<Empty icon={Activity} title={status === 'open' ? 'No open positions' : 'No closed positions yet'} />} columns={[
              { key: 'user', label: 'User', render: (r) => <UserCell u={r.user} /> },
              { key: 'symbol', label: 'Market', render: (r) => <div><p className="text-white font-semibold">{r.symbol}</p><p className={`text-[10px] font-semibold uppercase ${r.side === 'long' ? 'text-emerald-400' : 'text-red-400'}`}>{r.side} · {r.leverage}×</p></div> },
              { key: 'margin', label: 'Margin', align: 'right', render: (r) => money(r.margin, r.currency) },
              { key: 'entry', label: 'Entry', align: 'right', render: (r) => num(r.entryPrice, 6) },
              { key: 'levels', label: 'TP / SL / Liq.', render: (r) => <span className="text-[10px] text-[#A5AFC4]">{r.takeProfit ? num(r.takeProfit, 6) : '—'} / {r.stopLoss ? num(r.stopLoss, 6) : '—'} / <span className="text-red-300">{num(r.liquidationPrice, 6)}</span></span> },
              ...(status === 'closed' ? [
                { key: 'exit', label: 'Exit', align: 'right', render: (r) => num(r.exitPrice, 6) },
                { key: 'pnl', label: 'P/L', align: 'right', render: (r) => <span className={r.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>{r.pnl >= 0 ? '+' : ''}{money(r.pnl, r.currency)} <span className="text-[10px]">({num(r.pnlPercent)}%)</span></span> },
                { key: 'reason', label: 'Reason', render: (r) => <Badge tone={r.closeReason === 'liquidated' ? 'red' : 'gray'}>{r.closeReason || '—'}</Badge> }
              ] : [
                { key: 'opened', label: 'Opened', render: (r) => date(r.openedAt) },
                { key: 'x', label: '', render: (r) => <Button size="sm" variant="danger" onClick={() => setClosing(r)}>Close</Button> }
              ])
            ]} />
            <Pager page={page} total={p.data?.total} limit={p.data?.limit} onPage={setPage} />
          </>
        )}
      </Card>
      {closing && <CloseModal pos={closing} onClose={() => setClosing(null)} onDone={p.reload} />}
    </Page>
  );
}

/* ------------------------------------------------------------ packages */

export function PackageTradesAdmin() {
  const api = useApi();
  const [status, setStatus] = useState('in-progress');
  const [page, setPage] = useState(1);
  const t = useLoad(() => api.get('/admin/ops/packages/trades', { params: { page, limit: 25, status } }).then((r) => r.data.data), [page, status]);
  const { busy, run } = useAction();
  const settle = (row, mode) => confirmAction(mode === 'complete'
    ? `Complete "${row.name}" now and pay ${money(row.amount + row.profit, row.currency)}?`
    : `Terminate "${row.name}" and return the ${money(row.amount, row.currency)} stake without profit?`)
    && run(row._id + mode, () => api.post(`/admin/ops/packages/trades/${row._id}/settle`, { mode }).then(t.reload), (r) => r.data.message);
  return (
    <Page title="Package trades" subtitle="Every automated trading package users started. Packages themselves are edited under Trades → Settings." icon={Bot}>
      <Tabs value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={[{ value: 'in-progress', label: 'Running' }, { value: 'completed', label: 'Completed' }, { value: 'terminated', label: 'Cancelled / terminated' }]} />
      <Card>
        {t.error && <ErrorBox message={t.error} onRetry={t.reload} />}
        {t.loading && !t.data ? <Loading /> : (
          <>
            <Table rows={t.data?.items} empty={<Empty icon={Bot} title="Nothing here" />} columns={[
              { key: 'user', label: 'User', render: (r) => <UserCell u={r.userId} /> },
              { key: 'name', label: 'Package', render: (r) => <div><p className="text-white">{r.name}</p><p className="text-[10px] text-[#6B7280]">{r.rate}% per {r.interval} · {r.durationHours}h</p></div> },
              { key: 'amount', label: 'Stake', align: 'right', render: (r) => money(r.amount, r.currency) },
              { key: 'profit', label: status === 'in-progress' ? 'Expected profit' : 'Profit', align: 'right', render: (r) => <span className="text-emerald-400">{money(r.profit, r.currency)}</span> },
              { key: 'end', label: status === 'in-progress' ? 'Ends' : 'Ended', render: (r) => date(r.endDate) },
              ...(status === 'in-progress' ? [{
                key: 'x', label: '', render: (r) => (
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="success" busy={busy === `${r._id}complete`} onClick={() => settle(r, 'complete')}>Complete</Button>
                    <Button size="sm" variant="secondary" busy={busy === `${r._id}terminate`} onClick={() => settle(r, 'terminate')}>Terminate</Button>
                  </div>
                )
              }] : [{ key: 'payout', label: 'Paid', align: 'right', render: (r) => money(r.payout, r.currency) }])
            ]} />
            <Pager page={page} total={t.data?.total} limit={t.data?.limit} onPage={setPage} />
          </>
        )}
      </Card>
    </Page>
  );
}

/* ------------------------------------------------------------ mining catalog */

const MACHINE_TYPES = ['CPU', 'GPU', 'ASIC', 'FPGA'];
const BOOSTER_TYPES = [['hash_rate', 'Hash rate'], ['energy', 'Energy'], ['rewards', 'Rewards']];
const EMPTY_ITEM = {
  equipment: { name: '', type: 'GPU', hashRate: '', powerConsumption: '', price: '', dailyYieldPercent: '' },
  boosters: { name: '', type: 'hash_rate', multiplier: '', duration: '', price: '', description: '' }
};
const pickFields = (kind, f) => (kind === 'equipment'
  ? { name: f.name, type: f.type, hashRate: f.hashRate, powerConsumption: f.powerConsumption, price: f.price, dailyYieldPercent: f.dailyYieldPercent }
  : { name: f.name, type: f.type, multiplier: f.multiplier, duration: f.duration, price: f.price, description: f.description });

/** The editable fields of one machine or booster. */
function CatalogFields({ kind, f, set, currency }) {
  return kind === 'equipment' ? (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <Field label="Name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Antminer S21" /></Field>
      <Field label="Type"><select className={inputCls} value={f.type} onChange={set('type')}>{MACHINE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <Field label={`Price (${currency})`}><input type="number" className={inputCls} value={f.price} onChange={set('price')} /></Field>
      <Field label="Hash rate (MH/s)"><input type="number" className={inputCls} value={f.hashRate} onChange={set('hashRate')} /></Field>
      <Field label="Power (W)"><input type="number" className={inputCls} value={f.powerConsumption} onChange={set('powerConsumption')} /></Field>
      <Field label="Daily yield %" hint={f.price && f.dailyYieldPercent ? `About ${money((Number(f.price) * Number(f.dailyYieldPercent)) / 100, currency)} per day` : 'Share of the price earned per day of mining'}>
        <input type="number" step="0.01" className={inputCls} value={f.dailyYieldPercent} onChange={set('dailyYieldPercent')} />
      </Field>
    </div>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <Field label="Name"><input className={inputCls} value={f.name} onChange={set('name')} placeholder="e.g. Turbo Hour" /></Field>
      <Field label="Type"><select className={inputCls} value={f.type} onChange={set('type')}>{BOOSTER_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
      <Field label={`Price (${currency})`}><input type="number" className={inputCls} value={f.price} onChange={set('price')} /></Field>
      <Field label="Multiplier ×" hint="1.5 = +50% earnings"><input type="number" step="0.1" className={inputCls} value={f.multiplier} onChange={set('multiplier')} /></Field>
      <Field label="Duration (seconds)" hint={f.duration ? `${Math.round(Number(f.duration) / 60)} minutes` : '3600 = 1 hour'}><input type="number" className={inputCls} value={f.duration} onChange={set('duration')} /></Field>
      <Field label="Description (users see this)"><input className={inputCls} value={f.description || ''} onChange={set('description')} placeholder="+50% earnings for 1 hour" /></Field>
    </div>
  );
}

function CatalogRow({ kind, id, item, currency, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(item);
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => setF(item), [item]);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const dirty = JSON.stringify(pickFields(kind, f)) !== JSON.stringify(pickFields(kind, item));
  const save = (body, msg) => run(id, () => api.put(`/admin/ops/mining/catalog/${kind}/${id}`, body), msg).then((r) => { if (r) { onSaved(); setOpen(false); } });
  const remove = () => run(`rm-${id}`, () => api.delete(`/admin/ops/mining/catalog/${kind}/${id}`), (r) => r.data.message).then((r) => { if (r) { setConfirmRemove(false); onSaved(); } });
  return (
    <div className={`py-3 border-b border-[#2F3944]/60 last:border-0 ${item.enabled === false ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px]">
          <p className="text-sm text-white font-medium">{item.name}</p>
          <p className="text-[10px] text-[#6B7280]">
            {kind === 'equipment'
              ? `${item.type} · ${item.hashRate} MH/s · ${item.powerConsumption} W · ${item.dailyYieldPercent}% a day (≈ ${money((item.price * item.dailyYieldPercent) / 100, currency)})`
              : `${item.multiplier}× for ${Math.round(item.duration / 60)} min · ${item.description || ''}`}
          </p>
        </div>
        <p className="text-sm text-white tabular-nums">{money(item.price, currency)}</p>
        <Toggle checked={item.enabled !== false} disabled={busy === id} onChange={(v) => save({ enabled: v }, v ? 'Shown in the shop' : 'Hidden from the shop')} label={item.enabled === false ? 'Hidden' : 'In shop'} />
        <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'Edit'}</Button>
        <Button size="sm" variant="danger" onClick={() => setConfirmRemove(true)}>Remove</Button>
      </div>
      {open && (
        <div className="mt-3 rounded-xl border border-[#2F3944] p-3 space-y-2">
          <CatalogFields kind={kind} f={f} set={set} currency={currency} />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="secondary" disabled={busy === id} onClick={() => { setF(item); setOpen(false); }}>Cancel</Button>
            <Button size="sm" disabled={!dirty} busy={busy === id} onClick={() => save(pickFields(kind, f), 'Saved')}>Save changes</Button>
          </div>
        </div>
      )}
      {confirmRemove && (
        <Modal open title={`Remove ${item.name}?`} onClose={() => setConfirmRemove(false)}
          footer={<><Button variant="secondary" disabled={busy === `rm-${id}`} onClick={() => setConfirmRemove(false)}>Cancel</Button><Button variant="danger" busy={busy === `rm-${id}`} onClick={remove}>Remove from shop</Button></>}>
          <p className="text-xs text-[#A5AFC4]">Users can no longer buy it. {kind === 'equipment' ? 'Machines users already own keep earning at the yield they were bought with.' : 'Boosters already running finish normally.'}</p>
          <p className="text-[11px] text-[#6B7280] mt-2">To take it out only for a while, switch it to Hidden instead.</p>
        </Modal>
      )}
    </div>
  );
}

function AddCatalogItem({ kind, currency, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(EMPTY_ITEM[kind]);
  const [error, setError] = useState('');
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const create = () => {
    setError('');
    const need = kind === 'equipment' ? ['name', 'price', 'hashRate', 'powerConsumption', 'dailyYieldPercent'] : ['name', 'price', 'multiplier', 'duration'];
    if (need.some((k) => String(f[k]).trim() === '')) return setError('Fill in every field');
    run('add', () => api.post(`/admin/ops/mining/catalog/${kind}`, pickFields(kind, f)), (r) => r.data.message).then((r) => { if (r) { onSaved(); onClose(); } });
  };
  return (
    <Modal open wide title={kind === 'equipment' ? 'Add a machine' : 'Add a booster'} onClose={onClose}
      footer={<><Button variant="secondary" disabled={busy === 'add'} onClick={onClose}>Cancel</Button><Button busy={busy === 'add'} onClick={create}>{kind === 'equipment' ? 'Add machine' : 'Add booster'}</Button></>}>
      <CatalogFields kind={kind} f={f} set={set} currency={currency} />
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      <p className="text-[11px] text-[#6B7280] mt-2">It appears in the users' Mining shop right away, priced in each user's currency.</p>
    </Modal>
  );
}

export function MiningCatalogAdmin() {
  const api = useApi();
  const [adding, setAdding] = useState(null); // 'equipment' | 'boosters'
  const c = useLoad(() => api.get('/admin/ops/mining/catalog').then((r) => r.data.data), []);
  const cur = c.data?.currency || 'USD';
  return (
    <Page title="Mining shop" subtitle="The machines and boosters users can buy. Add, edit, hide or remove them. Users see prices in their own currency." icon={Cpu}>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : c.data && (
        <div className="space-y-4">
          <Card title="Machines" actions={<Button size="sm" onClick={() => setAdding('equipment')}><Plus size={12} />Add machine</Button>}>
            {Object.keys(c.data.equipment).length
              ? Object.entries(c.data.equipment).map(([id, item]) => <CatalogRow key={id} kind="equipment" id={id} item={item} currency={cur} onSaved={c.reload} />)
              : <Empty icon={Cpu} title="No machines in the shop" text="Add a machine so users can start mining." />}
          </Card>
          <Card title="Boosters" actions={<Button size="sm" onClick={() => setAdding('boosters')}><Plus size={12} />Add booster</Button>}>
            {Object.keys(c.data.boosters).length
              ? Object.entries(c.data.boosters).map(([id, item]) => <CatalogRow key={id} kind="boosters" id={id} item={item} currency={cur} onSaved={c.reload} />)
              : <Empty icon={Zap} title="No boosters in the shop" />}
          </Card>
          <p className="text-[10px] text-[#6B7280] flex items-center gap-1"><Zap size={11} />Machines users already own keep earning at the yield they were bought with.</p>
        </div>
      )}
      {adding && <AddCatalogItem kind={adding} currency={cur} onClose={() => setAdding(null)} onSaved={c.reload} />}
    </Page>
  );
}

/* ------------------------------------------------------------ notifications */

export function NotificationsAdmin() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const list = useLoad(() => api.get('/admin/ops/notifications', { params: { page, limit: 20 } }).then((r) => r.data.data), [page]);
  const users = useLoad(() => api.get('/admin/users/simple-list').then((r) => r.data.users || r.data.data || []), []);
  const { busy, run } = useAction();
  const [f, setF] = useState({ title: '', content: '', link: '', type: 'system', audience: 'all', userId: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const send = () => run('send', async () => {
    const body = { title: f.title, content: f.content, link: f.link || undefined, type: f.type };
    if (f.audience === 'one') body.userIds = [f.userId];
    else body.audience = f.audience;
    const r = await api.post('/admin/ops/notifications/send', body);
    setF((s) => ({ ...s, title: '', content: '' }));
    list.reload();
    return r;
  }, (r) => r.data.message);
  return (
    <Page title="Notifications" subtitle="Send in-app notifications. They arrive instantly on open devices and sit in the bell." icon={Bell}>
      <div className="grid lg:grid-cols-[380px_1fr] gap-4">
        <Card title="Compose">
          <div className="space-y-3">
            <Field label="Send to">
              <select className={inputCls} value={f.audience} onChange={set('audience')}>
                <option value="all">Everyone</option><option value="active">Active accounts</option><option value="one">One user</option>
              </select>
            </Field>
            {f.audience === 'one' && (
              <Field label="User">
                <select className={inputCls} value={f.userId} onChange={set('userId')}>
                  <option value="">Choose a user…</option>
                  {(users.data || []).map((u) => <option key={u._id} value={u._id}>{u.email || who(u)}</option>)}
                </select>
              </Field>
            )}
            <Field label="Type">
              <select className={inputCls} value={f.type} onChange={set('type')}>
                {['system', 'promo', 'security', 'account', 'transaction', 'trading', 'staking', 'real_estate'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Title"><input className={inputCls} maxLength={140} value={f.title} onChange={set('title')} /></Field>
            <Field label="Message"><textarea className={`${inputCls} h-auto py-2 min-h-[96px]`} maxLength={2000} value={f.content} onChange={set('content')} /></Field>
            <Field label="Open page when tapped (optional)" hint="An in-app path such as /staking or /real-estate"><input className={inputCls} value={f.link} placeholder="/staking" onChange={set('link')} /></Field>
            <Button className="w-full" busy={busy === 'send'} disabled={!f.title || (f.audience === 'one' && !f.userId)} onClick={send}><Send size={13} />Send notification</Button>
          </div>
        </Card>
        <Card title="Recently sent">
          {list.error && <ErrorBox message={list.error} onRetry={list.reload} />}
          {list.loading && !list.data ? <Loading /> : (
            <>
              <Table rows={list.data?.items} empty={<Empty icon={Bell} title="No notifications yet" />} columns={[
                { key: 'user', label: 'User', render: (r) => <UserCell u={r.user} /> },
                { key: 'title', label: 'Notification', render: (r) => <div className="max-w-[320px]"><p className="text-white truncate">{r.title}</p><p className="text-[10px] text-[#6B7280] truncate">{r.content}</p></div> },
                { key: 'type', label: 'Type', render: (r) => <Badge tone="blue">{r.type}</Badge> },
                { key: 'read', label: 'Read', render: (r) => <Badge tone={r.isRead ? 'green' : 'gray'}>{r.isRead ? 'Read' : 'Unread'}</Badge> },
                { key: 'at', label: 'Sent', render: (r) => date(r.createdAt) }
              ]} />
              <Pager page={page} total={list.data?.total} limit={list.data?.limit} onPage={setPage} />
            </>
          )}
        </Card>
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------ exchange rates */

export function FxPanel() {
  const api = useApi();
  const st = useLoad(() => api.get('/admin/currencies/fx-status').then((r) => r.data.data), []);
  const { busy, run } = useAction();
  const [conv, setConv] = useState({ amount: 100, from: 'USD', to: 'EUR', result: null });
  const sync = () => run('sync', () => api.post('/admin/currencies/sync').then((r) => { st.reload(); return r; }), (r) => r.data.message);
  const auto = (v) => run('auto', () => api.put('/admin/currencies/auto-sync', { enabled: v }).then(st.reload), v ? 'Automatic sync on' : 'Automatic sync off');
  const convert = () => run('conv', () => api.get('/admin/currencies/convert', { params: conv }).then((r) => setConv((c) => ({ ...c, result: r.data.data }))));
  const d = st.data;
  return (
    <div className="grid md:grid-cols-2 gap-3 mb-4">
      <Card title="Live exchange rates" actions={<Button size="sm" busy={busy === 'sync'} onClick={sync}><RefreshCw size={12} />Sync now</Button>}>
        {st.loading && !d ? <Loading /> : d && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[#8C96A8]">Last synced</span><span className="text-white">{d.lastSyncedAt ? date(d.lastSyncedAt) : 'Never'}</span></div>
            <div className="flex justify-between"><span className="text-[#8C96A8]">Source</span><span className="text-white">{d.source}</span></div>
            <div className="flex justify-between"><span className="text-[#8C96A8]">Interval</span><span className="text-white">{d.interval}</span></div>
            <div className="flex justify-between items-center pt-1"><span className="text-[#8C96A8]">Automatic sync</span><Toggle checked={d.autoSync} disabled={busy === 'auto'} onChange={auto} /></div>
            <p className="text-[10px] text-[#6B7280] pt-1">All rates are units per 1 USD. Every balance, price and payout uses this one table, so conversions match everywhere.</p>
          </div>
        )}
      </Card>
      <Card title="Check a conversion">
        <div className="grid grid-cols-[1fr_80px_auto_80px] gap-2 items-end">
          <Field label="Amount"><input type="number" className={inputCls} value={conv.amount} onChange={(e) => setConv((c) => ({ ...c, amount: e.target.value, result: null }))} /></Field>
          <Field label="From"><input className={`${inputCls} uppercase`} maxLength={3} value={conv.from} onChange={(e) => setConv((c) => ({ ...c, from: e.target.value.toUpperCase(), result: null }))} /></Field>
          <ArrowRight size={14} className="text-[#6B7280] mb-3" />
          <Field label="To"><input className={`${inputCls} uppercase`} maxLength={3} value={conv.to} onChange={(e) => setConv((c) => ({ ...c, to: e.target.value.toUpperCase(), result: null }))} /></Field>
        </div>
        <div className="flex items-center justify-between mt-3">
          <Button size="sm" variant="secondary" busy={busy === 'conv'} onClick={convert}><Globe size={12} />Convert</Button>
          {conv.result && <p className="text-sm text-white pk-fade">{money(conv.result.result, conv.to)} <span className="text-[10px] text-[#6B7280]">@ {num(conv.result.rate, 6)}</span></p>}
        </div>
      </Card>
    </div>
  );
}

export { Stat };
