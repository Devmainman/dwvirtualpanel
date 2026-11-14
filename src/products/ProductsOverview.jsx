// One screen for the health of every product plus the feature switches and fees.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Building2, Coins, LineChart, Lock, CreditCard, Wallet, Activity, Bot, Users, Cpu, Copy } from 'lucide-react';
import { Page, Card, Stat, Button, Field, Toggle, inputCls, Loading, ErrorBox, useApi, useLoad, useAction, money, num } from './kit';

const TILES = [
  { key: 'realEstate', label: 'Real estate', icon: Building2, to: '/products/real-estate', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} active investments` },
  { key: 'staking', label: 'Staking', icon: Coins, to: '/products/staking', value: (d) => num(d.count, 0), hint: () => 'active stakes' },
  { key: 'stocks', label: 'Stocks', icon: LineChart, to: '/products/stocks', value: (d) => num(d.holders, 0), hint: () => 'open holdings' },
  { key: 'liveMarkets', label: 'Live markets', icon: Activity, to: '/products/markets', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} open positions (margin)` },
  { key: 'tradingPackages', label: 'Trading packages', icon: Bot, to: '/products/packages', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} running` },
  { key: 'copyTrading', label: 'Copy trading', icon: Copy, to: '/copy-trading', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} live copies` },
  { key: 'coldStorage', label: 'Cold storage', icon: Lock, to: '/products/cold-storage', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} vaults` },
  { key: 'cards', label: 'Cards', icon: CreditCard, to: '/products/cards', value: (d, c) => money(d.total, c), hint: (d) => `${d.count} live cards` },
  { key: 'mining', label: 'Mining', icon: Cpu, to: '/mining', value: (d) => num(d.activeSessions, 0), hint: () => 'sessions running' }
];

function Config() {
  const api = useApi();
  const cfg = useLoad(() => api.get('/admin/products/config').then((r) => r.data.data), []);
  const { busy, run } = useAction();
  const [form, setForm] = useState(null);
  useEffect(() => { if (cfg.data) setForm(cfg.data); }, [cfg.data]);
  if (cfg.loading && !form) return <Loading />;
  if (cfg.error) return <ErrorBox message={cfg.error} onRetry={cfg.reload} />;
  if (!form) return null;
  const set = (group, key, value) => setForm((f) => ({ ...f, [group]: { ...f[group], [key]: value } }));
  const save = () => run('save', () => api.put('/admin/products/config', form).then((r) => setForm(r.data.data)), 'Settings saved');
  return (
    <Card title="Features & fees" actions={<Button busy={busy === 'save'} onClick={save}>Save changes</Button>}>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Investing</p>
          <Toggle checked={!!form.investing?.stocksEnabled} onChange={(v) => set('investing', 'stocksEnabled', v)} label="Stocks" />
          <Toggle checked={!!form.investing?.realEstateEnabled} onChange={(v) => set('investing', 'realEstateEnabled', v)} label="Real estate" />
          <Toggle checked={!!form.investing?.stakingEnabled} onChange={(v) => set('investing', 'stakingEnabled', v)} label="Staking" />
          <Toggle checked={!!form.investing?.walletConnectEnabled} onChange={(v) => set('investing', 'walletConnectEnabled', v)} label="Connect wallet" />
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Cold storage</p>
          <Toggle checked={!!form.coldStorage?.enabled} onChange={(v) => set('coldStorage', 'enabled', v)} label="Enabled" />
          <Field label="Unlock delay (hours)"><input type="number" min="0" className={inputCls} value={form.coldStorage?.unlockDelayHours ?? ''} onChange={(e) => set('coldStorage', 'unlockDelayHours', e.target.value)} /></Field>
          <Field label="Minimum deposit (base currency)"><input type="number" min="0" className={inputCls} value={form.coldStorage?.minDeposit ?? ''} onChange={(e) => set('coldStorage', 'minDeposit', e.target.value)} /></Field>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wide text-[#6B7280]">Cards</p>
          <Toggle checked={!!form.cards?.enabled} onChange={(v) => set('cards', 'enabled', v)} label="Enabled" />
          <div className="grid grid-cols-2 gap-2">
            <Field label="Virtual fee"><input type="number" min="0" className={inputCls} value={form.cards?.virtualFee ?? ''} onChange={(e) => set('cards', 'virtualFee', e.target.value)} /></Field>
            <Field label="Physical fee"><input type="number" min="0" className={inputCls} value={form.cards?.physicalFee ?? ''} onChange={(e) => set('cards', 'physicalFee', e.target.value)} /></Field>
          </div>
          <Field label="Max cards per user"><input type="number" min="1" className={inputCls} value={form.cards?.maxCardsPerUser ?? ''} onChange={(e) => set('cards', 'maxCardsPerUser', e.target.value)} /></Field>
        </div>
      </div>
    </Card>
  );
}

export default function ProductsOverview() {
  const api = useApi();
  const ov = useLoad(() => api.get('/admin/ops/overview').then((r) => r.data.data), []);
  const d = ov.data;
  return (
    <Page title="Products" subtitle="Everything users hold across the platform, converted to your base currency." icon={LayoutGrid}
      actions={<Button variant="secondary" onClick={ov.reload}>Refresh</Button>}>
      {ov.error && <div className="mb-4"><ErrorBox message={ov.error} onRetry={ov.reload} /></div>}
      {ov.loading && !d ? <Loading /> : d && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Stat i={0} label="Users" value={num(d.users, 0)} />
            <Stat i={1} label="Spendable balances" value={money(d.userBalances.total, d.currency)} tone="blue" />
            <Stat i={2} label="Working in products" tone="up"
              value={money(['realEstate', 'liveMarkets', 'tradingPackages', 'copyTrading', 'coldStorage', 'cards'].reduce((s, k) => s + (d[k]?.total || 0), 0), d.currency)} />
            <Stat i={3} label="Open real-estate projects" value={num(d.realEstate.projects?.open || 0, 0)} hint={`${d.realEstate.projects?.closed || 0} closed`} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {TILES.map((t, i) => (
              <Link key={t.key} to={t.to} className="group bg-[#282F36] border border-[#2F3944] rounded-2xl p-4 flex items-center gap-3 hover:border-blue-500/40 hover:-translate-y-0.5 transition pk-rise" style={{ animationDelay: `${(i + 4) * 40}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-white/5 text-[#A5AFC4] group-hover:text-blue-400 group-hover:bg-blue-500/10 flex items-center justify-center transition"><t.icon size={17} /></div>
                <div className="min-w-0">
                  <p className="text-xs text-[#8C96A8]">{t.label}</p>
                  <p className="text-base font-semibold text-white tabular-nums">{t.value(d[t.key] || {}, d.currency)}</p>
                  <p className="text-[10px] text-[#6B7280]">{t.hint(d[t.key] || {})}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
      <Config />
      <p className="text-[10px] text-[#6B7280] mt-3 flex items-center gap-1"><Users size={11} />Totals are converted from each holder&apos;s currency at today&apos;s rate.</p>
    </Page>
  );
}
