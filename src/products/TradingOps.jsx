// Live-market positions, trading-package trades, mining catalog,
// notification broadcast and exchange-rate sync.
import { useEffect, useState } from 'react';
import { Activity, Bot, Cpu, Bell, RefreshCw, Send, Globe, Zap, ArrowRight } from 'lucide-react';
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

function CatalogRow({ kind, id, item, currency, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(item);
  useEffect(() => setF(item), [item]);
  const dirty = JSON.stringify(f) !== JSON.stringify(item);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const save = (extra = {}) => run(id, () => api.put(`/admin/ops/mining/catalog/${kind}/${id}`, kind === 'equipment'
    ? { price: f.price, dailyYieldPercent: f.dailyYieldPercent, ...extra }
    : { price: f.price, multiplier: f.multiplier, duration: f.duration, ...extra }).then(onSaved), 'Saved');
  return (
    <div className={`grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] gap-2 items-end py-3 border-b border-[#2F3944]/60 last:border-0 ${item.enabled === false ? 'opacity-60' : ''}`}>
      <div className="col-span-2 md:col-span-1">
        <p className="text-sm text-white font-medium">{item.name}</p>
        <p className="text-[10px] text-[#6B7280]">{kind === 'equipment' ? `${item.type} · ${item.hashRate} MH/s` : item.description}</p>
      </div>
      <Field label={`Price (${currency})`}><input type="number" className={inputCls} value={f.price} onChange={set('price')} /></Field>
      {kind === 'equipment' ? (
        <>
          <Field label="Daily yield %"><input type="number" step="0.01" className={inputCls} value={f.dailyYieldPercent} onChange={set('dailyYieldPercent')} /></Field>
          <div className="text-[11px] text-[#8C96A8] pb-2">≈ {money((Number(f.price) * Number(f.dailyYieldPercent)) / 100, currency)}/day</div>
        </>
      ) : (
        <>
          <Field label="Multiplier ×"><input type="number" step="0.1" className={inputCls} value={f.multiplier} onChange={set('multiplier')} /></Field>
          <Field label="Duration (sec)"><input type="number" className={inputCls} value={f.duration} onChange={set('duration')} /></Field>
        </>
      )}
      <div className="flex gap-1.5 items-center col-span-2 md:col-span-1 justify-end">
        <Toggle checked={item.enabled !== false} onChange={(v) => save({ enabled: v })} label={item.enabled === false ? 'Hidden' : 'In shop'} />
        <Button size="sm" disabled={!dirty} busy={busy === id} onClick={() => save()}>Save</Button>
      </div>
    </div>
  );
}

export function MiningCatalogAdmin() {
  const api = useApi();
  const c = useLoad(() => api.get('/admin/ops/mining/catalog').then((r) => r.data.data), []);
  return (
    <Page title="Mining shop" subtitle="Machine prices and yields, and booster prices. Users see prices converted to their currency." icon={Cpu}>
      {c.error && <ErrorBox message={c.error} onRetry={c.reload} />}
      {c.loading && !c.data ? <Loading /> : c.data && (
        <div className="space-y-4">
          <Card title="Machines">
            {Object.entries(c.data.equipment).map(([id, item]) => <CatalogRow key={id} kind="equipment" id={id} item={item} currency={c.data.currency} onSaved={c.reload} />)}
          </Card>
          <Card title="Boosters">
            {Object.entries(c.data.boosters).map(([id, item]) => <CatalogRow key={id} kind="boosters" id={id} item={item} currency={c.data.currency} onSaved={c.reload} />)}
          </Card>
          <p className="text-[10px] text-[#6B7280] flex items-center gap-1"><Zap size={11} />Machines users already own keep earning at the yield they were bought with.</p>
        </div>
      )}
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
