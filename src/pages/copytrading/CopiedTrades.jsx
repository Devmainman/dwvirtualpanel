// Copied Trades: every position users hold through copy trading (open ones valued
// at the trader's live price), every copier, and the platform totals.
// Optional ?traderId= shows one trader only (linked from the trader's page).
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Copy, Pause, Play, Square, X } from 'lucide-react';
import {
  Page, Card, Stat, Button, Tabs, Table, Pager, Badge, Modal, SearchBox, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, date, who
} from '../../products/kit';

const pnlCls = (v) => (v > 0 ? 'text-emerald-400' : v < 0 ? 'text-red-400' : 'text-[#A5AFC4]');
const signed = (v, cur) => `${v > 0 ? '+' : ''}${money(v, cur)}`;
const px = (n) => (n == null ? '—' : n >= 100 ? n.toFixed(2) : n >= 1 ? n.toFixed(4) : Number(n).toPrecision(4));
const REASON = { trader_closed: 'Trader closed', manual: 'Closed by user', copy_stopped: 'Copy stopped', cancelled: 'Cancelled', stop_loss: 'Stop loss', take_profit: 'Take profit', other: 'Other' };

function Positions({ traderId, search }) {
  const api = useApi();
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [status, search, traderId]);
  const d = useLoad(() => api.get('/admin/copy-trading/positions', { params: { status: status || undefined, traderId: traderId || undefined, search: search || undefined, page, limit: 50 } }).then((r) => r.data), [status, search, traderId, page]);
  // Open positions move with the market.
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && d.reload(), 30000); return () => clearInterval(t); }, [d.reload]);
  return (
    <Card>
      <Tabs value={status} onChange={setStatus} tabs={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }, { value: '', label: 'All' }]} />
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {d.loading && !d.data ? <Loading /> : (
        <>
          <Table rows={d.data?.positions || []} empty={<Empty icon={Copy} title={status === 'open' ? 'No open copied positions' : 'No copied positions here'} text="Positions appear when a trader users copy opens a trade." />} columns={[
            { key: 'user', label: 'User', render: (p) => <div><p className="text-white">{who(p.userId)}</p><p className="text-[10px] text-[#6B7280]">{p.userId?.email}</p></div> },
            { key: 'trader', label: 'Trader', render: (p) => <span className="text-[#A5AFC4]">{p.traderUsername}</span> },
            { key: 'trade', label: 'Trade', render: (p) => <div><p className="text-white">{p.side?.toUpperCase()} {p.symbol}</p><p className="text-[10px] text-[#6B7280]">{p.leverage > 1 ? `${p.leverage}× · ` : ''}{date(p.openedAt)}</p></div> },
            { key: 'price', label: 'Entry → price', render: (p) => <span className="text-[#A5AFC4] tabular-nums">{px(p.entryPrice)} → {px(p.status === 'open' ? p.markPrice : p.exitPrice)}</span> },
            { key: 'margin', label: 'Margin', align: 'right', render: (p) => money(p.margin, p.metadata?.currency) },
            { key: 'pnl', label: 'P/L', align: 'right', render: (p) => {
              const v = p.status === 'open' ? p.unrealizedPnl : (p.profitLoss || 0) - (p.commission || 0);
              const pct = p.status === 'open' ? p.unrealizedPercent : p.profitPercentage;
              return <div className={`tabular-nums ${pnlCls(v)}`}><p>{signed(v, p.metadata?.currency)}</p><p className="text-[10px]">{pct > 0 ? '+' : ''}{Number(pct || 0).toFixed(2)}%{p.status === 'open' ? ' live' : ''}</p></div>;
            } },
            { key: 'status', label: 'Status', render: (p) => (p.status === 'open' ? <Badge tone="green">Open</Badge> : <div><Badge tone="gray">{p.status}</Badge><p className="text-[10px] text-[#6B7280] mt-0.5">{REASON[p.closedReason] || ''}</p></div>) }
          ]} />
          <Pager page={page} total={d.data?.total} limit={d.data?.limit} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

function Copiers({ traderId, search, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [stop, setStop] = useState(null);
  const [open, setOpen] = useState(null);
  useEffect(() => setPage(1), [status, search, traderId]);
  const d = useLoad(() => api.get('/admin/copy-trading/copies', { params: { status: status || undefined, traderId: traderId || undefined, search: search || undefined, page, limit: 25 } }).then((r) => r.data), [status, search, traderId, page]);
  useEffect(() => { const t = setInterval(() => document.visibilityState === 'visible' && d.reload(), 30000); return () => clearInterval(t); }, [d.reload]);
  const act = (key, path, msg) => run(key, () => api.post(path).then((r) => { d.reload(); onChanged(); return r; }), (r) => r.data.message || msg);
  return (
    <Card>
      <Tabs value={status} onChange={setStatus} tabs={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'stopped', label: 'Stopped' }, { value: '', label: 'All' }]} />
      {d.error && <ErrorBox message={d.error} onRetry={d.reload} />}
      {d.loading && !d.data ? <Loading /> : (
        <>
          <Table rows={d.data?.copies || []} onRowClick={setOpen} empty={<Empty icon={Copy} title="No copiers here" text="Users who copy a trader appear here." />} columns={[
            { key: 'user', label: 'User', render: (c) => <div><p className="text-white">{who(c.userId)}</p><p className="text-[10px] text-[#6B7280]">{c.userId?.email}</p></div> },
            { key: 'trader', label: 'Copying', render: (c) => <span className="text-[#A5AFC4]">{c.traderUsername}</span> },
            { key: 'amount', label: 'Invested', align: 'right', render: (c) => money(c.amount, c.currency) },
            { key: 'equity', label: 'Value now', align: 'right', render: (c) => (c.status === 'stopped' ? '—' : money(c.equity, c.currency)) },
            { key: 'pnl', label: 'P/L', align: 'right', render: (c) => <div className={`tabular-nums ${pnlCls(c.totalPnl)}`}><p>{signed(c.totalPnl, c.currency)}</p><p className="text-[10px]">{c.totalPnlPercent > 0 ? '+' : ''}{c.totalPnlPercent}%</p></div> },
            { key: 'open', label: 'Open trades', align: 'right', render: (c) => c.openPositions?.length || 0 },
            { key: 'status', label: 'Status', render: (c) => <Badge tone={c.status === 'active' ? 'green' : c.status === 'paused' ? 'amber' : 'gray'}>{c.status}</Badge> },
            { key: 'act', label: '', render: (c) => (
              <div className="flex gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                {c.status === 'active' && <Button size="sm" variant="secondary" busy={busy === `p-${c._id}`} disabled={!!busy} onClick={() => act(`p-${c._id}`, `/admin/copy-trading/copy-trades/${c._id}/suspend`, 'Copy paused')}><Pause size={12} />Pause</Button>}
                {c.status === 'paused' && <Button size="sm" variant="success" busy={busy === `r-${c._id}`} disabled={!!busy} onClick={() => act(`r-${c._id}`, `/admin/copy-trading/copy-trades/${c._id}/resume`, 'Copy resumed')}><Play size={12} />Resume</Button>}
                {c.status !== 'stopped' && <Button size="sm" variant="danger" disabled={!!busy} onClick={() => setStop(c)}><Square size={12} />Stop</Button>}
              </div>
            ) }
          ]} />
          <Pager page={page} total={d.data?.total} limit={d.data?.limit} onPage={setPage} />
        </>
      )}
      {stop && (
        <Modal open title={`Stop ${who(stop.userId)}'s copy of ${stop.traderUsername}?`} onClose={() => !busy && setStop(null)}
          footer={<><Button variant="secondary" disabled={busy === 'stop'} onClick={() => setStop(null)}>Cancel</Button><Button variant="danger" busy={busy === 'stop'} onClick={() => act('stop', `/admin/copy-trading/copy-trades/${stop._id}/force-stop`, 'Copy stopped').then(() => setStop(null))}><Square size={12} />Stop copy</Button></>}>
          <p className="text-xs text-[#A5AFC4]">Its {stop.openPositions?.length || 0} open position(s) close at the current price and the value ({money(stop.equity, stop.currency)} now) returns to the user's balance.</p>
        </Modal>
      )}
      {open && (
        <Modal open wide title={`${who(open.userId)} copying ${open.traderUsername}`} onClose={() => setOpen(null)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] mb-3">
            {[['Invested', money(open.amount, open.currency)], ['Cash', money(open.cash, open.currency)], ['In trades', money(open.invested, open.currency)], ['P/L', signed(open.totalPnl, open.currency)]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-[#22282E] border border-[#2F3944] px-3 py-2"><p className="text-[#6B7280]">{k}</p><p className="text-white text-sm">{v}</p></div>
            ))}
          </div>
          <p className="text-xs font-semibold text-white mb-2">Open positions</p>
          {!open.openPositions?.length ? <p className="text-[11px] text-[#6B7280]">None right now.</p> : (
            <div className="space-y-1">
              {open.openPositions.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-[11px] rounded-lg bg-[#22282E] px-3 py-1.5">
                  <span className="text-white">{p.side.toUpperCase()} {p.symbol}</span>
                  <span className="text-[#A5AFC4]">{px(p.entryPrice)} → {px(p.markPrice)}</span>
                  <span>{money(p.margin, open.currency)}</span>
                  <span className={pnlCls(p.unrealizedPnl)}>{signed(p.unrealizedPnl, open.currency)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-[10px] text-[#6B7280] mt-3">Started {date(open.createdAt)}</p>
        </Modal>
      )}
    </Card>
  );
}

export default function CopiedTrades() {
  const api = useApi();
  const [params, setParams] = useSearchParams();
  const traderId = params.get('traderId') || '';
  const [tab, setTab] = useState('positions');
  const [search, setSearch] = useState('');
  const stats = useLoad(() => api.get('/admin/copy-trading/platform/stats').then((r) => r.data.stats), []);
  const s = stats.data || {};
  return (
    <Page title="Copied Trades" subtitle="Every position users hold through copy trading, and every copier. Open positions are valued at the live price." icon={Copy}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat i={0} label="Active copies" value={s.activeCopies ?? '—'} />
        <Stat i={1} label="Copiers" value={s.copiers ?? '—'} />
        <Stat i={2} label="Assets under copy" value={money(s.assetsUnderCopy || 0)} />
        <Stat i={3} label="Open trader trades" value={s.openMasterTrades ?? '—'} />
        <Stat i={4} label="Settled copier P/L" value={signed(s.copierPnl || 0)} tone={(s.copierPnl || 0) >= 0 ? 'up' : 'down'} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Tabs value={tab} onChange={setTab} tabs={[{ value: 'positions', label: 'Positions' }, { value: 'copiers', label: 'Copiers' }]} />
        <div className="flex items-center gap-2">
          {traderId && <Button size="sm" variant="secondary" onClick={() => { params.delete('traderId'); setParams(params); }}><X size={12} />Trader {traderId}</Button>}
          <SearchBox value={search} onChange={setSearch} placeholder="Search user or trader…" />
        </div>
      </div>
      {tab === 'positions' ? <Positions traderId={traderId} search={search} /> : <Copiers traderId={traderId} search={search} onChanged={stats.reload} />}
    </Page>
  );
}
