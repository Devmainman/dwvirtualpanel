// Stocks: listings, prices (single or bulk) and user holdings.
import { useState } from 'react';
import { LineChart, Plus, Pencil, Upload } from 'lucide-react';
import {
  Page, Card, Button, Field, Toggle, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, num, who
} from './kit';

const blank = { symbol: '', name: '', exchange: 'NASDAQ', sector: 'Technology', logo: '', description: '', price: '', previousClose: '', marketCap: '', dividendYield: 0, feePercent: 0.5, isActive: true };

function StockForm({ initial, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const save = () => run('save', async () => {
    const body = Object.fromEntries(Object.entries(f).filter(([k]) => k in blank));
    if (initial) await api.put(`/admin/products/stocks/${initial._id}`, body);
    else await api.post('/admin/products/stocks', body);
    onSaved();
    onClose();
  }, initial ? 'Stock updated' : 'Stock listed');
  return (
    <Modal open title={initial ? `Edit · ${initial.symbol}` : 'List a stock'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}>{initial ? 'Save' : 'List stock'}</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Symbol"><input className={inputCls} value={f.symbol} disabled={!!initial} onChange={set('symbol')} /></Field>
        <Field label="Name"><input className={inputCls} value={f.name} onChange={set('name')} /></Field>
        <Field label="Exchange"><input className={inputCls} value={f.exchange} onChange={set('exchange')} /></Field>
        <Field label="Sector"><input className={inputCls} value={f.sector} onChange={set('sector')} /></Field>
        <Field label="Price (base currency)"><input type="number" className={inputCls} value={f.price} onChange={set('price')} /></Field>
        <Field label="Previous close"><input type="number" className={inputCls} value={f.previousClose} onChange={set('previousClose')} /></Field>
        <Field label="Market cap"><input type="number" className={inputCls} value={f.marketCap} onChange={set('marketCap')} /></Field>
        <Field label="Dividend yield (%)"><input type="number" className={inputCls} value={f.dividendYield} onChange={set('dividendYield')} /></Field>
        <Field label="Trading fee (%)"><input type="number" className={inputCls} value={f.feePercent} onChange={set('feePercent')} /></Field>
        <Field label="Logo URL"><input className={inputCls} value={f.logo} onChange={set('logo')} /></Field>
        <Field label="Description" className="col-span-2"><textarea className={`${inputCls} h-auto py-2 min-h-[64px]`} value={f.description} onChange={set('description')} /></Field>
        <Toggle checked={!!f.isActive} onChange={(v) => setF((s) => ({ ...s, isActive: v }))} label="Tradable" />
      </div>
    </Modal>
  );
}

function BulkPrices({ onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [text, setText] = useState('');
  const rows = text.split('\n').map((l) => l.trim().split(/[\s,;]+/)).filter((p) => p[0] && Number(p[1]) > 0)
    .map(([symbol, price, previousClose]) => ({ symbol: symbol.toUpperCase(), price: Number(price), previousClose: Number(previousClose) || undefined }));
  const save = () => run('bulk', async () => {
    const r = await api.post('/admin/products/stocks/prices', { prices: rows });
    onSaved();
    onClose();
    return r;
  }, (r) => r.data.message);
  return (
    <Modal open title="Update prices" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'bulk'} disabled={!rows.length} onClick={save}>Update {rows.length || ''} price{rows.length === 1 ? '' : 's'}</Button></>}>
      <Field label="One per line: SYMBOL PRICE [PREVIOUS_CLOSE]" hint="Example: AAPL 231.40 228.10">
        <textarea className={`${inputCls} h-auto py-2 min-h-[180px] font-mono`} value={text} onChange={(e) => setText(e.target.value)} placeholder={'AAPL 231.40\nNVDA 141.20 139.90'} />
      </Field>
    </Modal>
  );
}

function Listings() {
  const api = useApi();
  const list = useLoad(() => api.get('/admin/products/stocks').then((r) => r.data.data), []);
  const [editing, setEditing] = useState(null);
  const [bulk, setBulk] = useState(false);
  return (
    <Card actions={<div className="flex gap-2"><Button variant="secondary" onClick={() => setBulk(true)}><Upload size={13} />Update prices</Button><Button onClick={() => setEditing('new')}><Plus size={14} />List stock</Button></div>}>
      {list.error && <ErrorBox message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data ? <Loading /> : (
        <Table rows={list.data} empty={<Empty icon={LineChart} title="No stocks listed" />} onRowClick={setEditing} columns={[
          { key: 'symbol', label: 'Symbol', render: (s) => <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[9px] font-bold overflow-hidden">{s.logo ? <img src={s.logo} alt="" className="w-full h-full object-cover" /> : s.symbol.slice(0, 4)}</div><div><p className="text-white font-semibold">{s.symbol}</p><p className="text-[10px] text-[#6B7280]">{s.name}</p></div></div> },
          { key: 'exchange', label: 'Exchange' },
          { key: 'price', label: 'Price', align: 'right', render: (s) => money(s.price) },
          { key: 'change', label: 'Change', align: 'right', render: (s) => <span className={s.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>{s.changePercent >= 0 ? '+' : ''}{num(s.changePercent)}%</span> },
          { key: 'fee', label: 'Fee', align: 'right', render: (s) => `${s.feePercent}%` },
          { key: 'isActive', label: 'Status', render: (s) => <Badge tone={s.isActive ? 'green' : 'gray'}>{s.isActive ? 'Tradable' : 'Hidden'}</Badge> },
          { key: 'edit', label: '', render: () => <Pencil size={12} className="text-[#6B7280]" /> }
        ]} />
      )}
      {editing && <StockForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={list.reload} />}
      {bulk && <BulkPrices onClose={() => setBulk(false)} onSaved={list.reload} />}
    </Card>
  );
}

function Holdings() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const h = useLoad(() => api.get('/admin/products/stock-holdings', { params: { page, limit: 20 } }).then((r) => r.data.data), [page]);
  return (
    <Card>
      {h.error && <ErrorBox message={h.error} onRetry={h.reload} />}
      {h.loading && !h.data ? <Loading /> : (
        <>
          <Table rows={h.data?.items} empty={<Empty icon={LineChart} title="No one holds shares yet" />} columns={[
            { key: 'user', label: 'User', render: (r) => <div><p className="text-white">{who(r.user)}</p><p className="text-[10px] text-[#6B7280]">{r.user?.email}</p></div> },
            { key: 'stock', label: 'Stock', render: (r) => r.stock?.symbol || '—' },
            { key: 'shares', label: 'Shares', align: 'right', render: (r) => num(r.shares, 6) },
            { key: 'cost', label: 'Cost basis', align: 'right', render: (r) => money(r.costBasis, r.currency) },
            { key: 'value', label: 'Value (base)', align: 'right', render: (r) => money((r.stock?.price || 0) * r.shares) }
          ]} />
          <Pager page={page} total={h.data?.total} limit={h.data?.limit} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

export default function StocksAdmin() {
  const [tab, setTab] = useState('listings');
  return (
    <Page title="Stocks" subtitle="What users can buy, at what price, and who holds what." icon={LineChart}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'listings', label: 'Listings' }, { value: 'holdings', label: 'Holdings' }]} />
      {tab === 'listings' ? <Listings /> : <Holdings />}
    </Page>
  );
}
