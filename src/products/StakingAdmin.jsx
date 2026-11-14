// Staking: pools (create, edit, pause, delete) and every stake.
import { useState } from 'react';
import { Coins, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Page, Card, Button, Field, Toggle, Tabs, Table, Pager, Badge, Modal, inputCls, Loading, ErrorBox, Empty,
  useApi, useLoad, useAction, money, num, shortDate, who, confirmAction
} from './kit';

const blank = { asset: '', name: '', icon: '', apy: '', cycle: 'daily', lockDays: 0, minAmount: '', maxAmount: '', price: '', allowEarlyUnstake: true, earlyUnstakePenaltyPercent: 10, capacity: 0, description: '', sortOrder: 0, isActive: true };

function PoolForm({ initial, onClose, onSaved }) {
  const api = useApi();
  const { busy, run } = useAction();
  const [f, setF] = useState(initial ? { ...blank, ...initial } : blank);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const save = () => run('save', async () => {
    const { _id, id, totalStaked, createdAt, updatedAt, __v, ...body } = f;
    if (initial) await api.put(`/admin/products/staking/plans/${initial._id}`, body);
    else await api.post('/admin/products/staking/plans', body);
    onSaved();
    onClose();
  }, initial ? 'Pool updated' : 'Pool created');
  return (
    <Modal open title={initial ? `Edit · ${initial.asset} ${initial.name}` : 'New pool'} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button busy={busy === 'save'} onClick={save}>{initial ? 'Save' : 'Create pool'}</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Asset symbol"><input className={inputCls} value={f.asset} placeholder="AVAX" onChange={set('asset')} /></Field>
        <Field label="Name"><input className={inputCls} value={f.name} placeholder="Avalanche" onChange={set('name')} /></Field>
        <Field label="APY (% per year)"><input type="number" className={inputCls} value={f.apy} onChange={set('apy')} /></Field>
        <Field label="Cycle">
          <select className={inputCls} value={f.cycle} onChange={set('cycle')}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
        </Field>
        <Field label="Minimum (asset units)"><input type="number" className={inputCls} value={f.minAmount} onChange={set('minAmount')} /></Field>
        <Field label="Maximum (asset units)"><input type="number" className={inputCls} value={f.maxAmount} onChange={set('maxAmount')} /></Field>
        <Field label="Lock (days, 0 = flexible)"><input type="number" className={inputCls} value={f.lockDays} onChange={set('lockDays')} /></Field>
        <Field label="Pool capacity (0 = unlimited)"><input type="number" className={inputCls} value={f.capacity} onChange={set('capacity')} /></Field>
        <Field label="Fallback USD price" hint="Used only when no live price exists"><input type="number" className={inputCls} value={f.price} onChange={set('price')} /></Field>
        <Field label="Early unstake penalty (%)"><input type="number" className={inputCls} value={f.earlyUnstakePenaltyPercent} onChange={set('earlyUnstakePenaltyPercent')} /></Field>
        <Field label="Icon URL"><input className={inputCls} value={f.icon} onChange={set('icon')} /></Field>
        <Field label="Sort order"><input type="number" className={inputCls} value={f.sortOrder} onChange={set('sortOrder')} /></Field>
        <Field label="Description" className="col-span-2"><textarea className={`${inputCls} h-auto py-2 min-h-[64px]`} value={f.description} onChange={set('description')} /></Field>
        <Toggle checked={!!f.allowEarlyUnstake} onChange={(v) => setF((s) => ({ ...s, allowEarlyUnstake: v }))} label="Allow early unstake" />
        <Toggle checked={!!f.isActive} onChange={(v) => setF((s) => ({ ...s, isActive: v }))} label="Pool is live" />
      </div>
      <p className="text-[10px] text-[#6B7280]">New terms apply to new stakes. Existing stakes keep the APY, cycle and lock they started with.</p>
    </Modal>
  );
}

function Pools() {
  const api = useApi();
  const list = useLoad(() => api.get('/admin/products/staking/plans').then((r) => r.data.data), []);
  const { busy, run } = useAction();
  const [editing, setEditing] = useState(null);
  const pause = (p) => run(p._id, () => api.put(`/admin/products/staking/plans/${p._id}`, { isActive: !p.isActive }).then(list.reload), p.isActive ? 'Pool paused' : 'Pool is live');
  const remove = (p) => confirmAction(`Delete the ${p.asset} pool?`) && run(p._id, () => api.delete(`/admin/products/staking/plans/${p._id}`).then(list.reload), 'Pool deleted');
  return (
    <>
      <div className="flex justify-end mb-3"><Button onClick={() => setEditing('new')}><Plus size={14} />New pool</Button></div>
      {list.error && <ErrorBox message={list.error} onRetry={list.reload} />}
      {list.loading && !list.data ? <Loading /> : !list.data?.length ? <Card><Empty icon={Coins} title="No pools yet" /></Card> : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.data.map((p, i) => (
            <article key={p._id} className={`bg-[#282F36] border border-[#2F3944] rounded-2xl p-4 pk-rise ${p.isActive ? '' : 'opacity-60'}`} style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-[11px] font-bold text-white overflow-hidden">
                  {p.icon ? <img src={p.icon} alt="" className="w-full h-full object-cover" /> : p.asset.slice(0, 4)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{p.asset} <span className="text-[#8C96A8] font-normal">{p.name}</span></p>
                  <p className="text-[11px] text-emerald-400">{p.apy}% APY · {p.cycle}</p>
                </div>
                <Badge tone={p.isActive ? 'green' : 'gray'}>{p.isActive ? 'Live' : 'Paused'}</Badge>
              </div>
              <dl className="grid grid-cols-3 gap-2 mt-4 text-[11px]">
                <div><dt className="text-[#6B7280]">Minimum</dt><dd className="text-white">{num(p.minAmount, 6)} {p.asset}</dd></div>
                <div><dt className="text-[#6B7280]">Maximum</dt><dd className="text-white">{num(p.maxAmount, 6)} {p.asset}</dd></div>
                <div><dt className="text-[#6B7280]">Lock</dt><dd className="text-white">{p.lockDays ? `${p.lockDays} days` : 'Flexible'}</dd></div>
                <div className="col-span-3"><dt className="text-[#6B7280]">Staked</dt><dd className="text-white">{num(p.totalStaked, 6)} {p.asset}{p.capacity ? ` of ${num(p.capacity, 0)}` : ''}</dd></div>
              </dl>
              <div className="flex gap-1.5 mt-4 pt-3 border-t border-[#2F3944]">
                <Button size="sm" variant="secondary" onClick={() => setEditing(p)}><Pencil size={12} />Edit</Button>
                <Button size="sm" variant="secondary" busy={busy === p._id} onClick={() => pause(p)}>{p.isActive ? 'Pause' : 'Go live'}</Button>
                <Button size="sm" variant="ghost" className="ml-auto text-red-400" onClick={() => remove(p)}><Trash2 size={12} /></Button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && <PoolForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={list.reload} />}
    </>
  );
}

function Stakes() {
  const api = useApi();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('active');
  const st = useLoad(() => api.get('/admin/products/staking/positions', { params: { page, limit: 20, status } }).then((r) => r.data.data), [page, status]);
  const d = st.data;
  return (
    <Card>
      <div className="mb-3"><Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} tabs={[{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Unstaked early' }]} /></div>
      {st.error && <ErrorBox message={st.error} onRetry={st.reload} />}
      {st.loading && !d ? <Loading /> : (
        <>
          <Table rows={d?.items} empty={<Empty icon={Coins} title="No stakes here" />} columns={[
            { key: 'user', label: 'User', render: (r) => <div><p className="text-white">{who(r.user)}</p><p className="text-[10px] text-[#6B7280]">{r.user?.email}</p></div> },
            { key: 'plan', label: 'Pool', render: (r) => `${r.asset} · ${r.plan?.name || ''}` },
            { key: 'assetAmount', label: 'Staked', align: 'right', render: (r) => `${num(r.assetAmount, 6)} ${r.asset}` },
            { key: 'cost', label: 'Paid', align: 'right', render: (r) => money(r.cost ?? r.amount, r.currency) },
            { key: 'rewards', label: 'Rewards earned', align: 'right', render: (r) => <span className="text-emerald-400">{num(r.earnedRewards, 8)} {r.asset}</span> },
            { key: 'startAt', label: 'Started', render: (r) => shortDate(r.startAt) },
            { key: 'status', label: 'Status', render: (r) => <Badge>{r.status}</Badge> }
          ]} />
          <Pager page={page} total={d?.total} limit={d?.limit} onPage={setPage} />
        </>
      )}
    </Card>
  );
}

export default function StakingAdmin() {
  const [tab, setTab] = useState('pools');
  return (
    <Page title="Staking" subtitle="Pools users can stake into, and every stake on the platform." icon={Coins}>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'pools', label: 'Pools' }, { value: 'stakes', label: 'Stakes' }]} />
      {tab === 'pools' ? <Pools /> : <Stakes />}
    </Page>
  );
}
