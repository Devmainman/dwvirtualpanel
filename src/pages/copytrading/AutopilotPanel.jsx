// Autopilot for one copy-trading trader: on/off, strategy settings, live market
// signals, open and recent automatic trades, and the activity log. Trades are
// placed and closed by the server (services/traderAutopilot.js) at live prices.
import { useEffect, useState } from 'react';
import { Bot, Play, Power, Save, RefreshCw } from 'lucide-react';
import { Card, Button, Field, Badge, inputCls, Loading, ErrorBox, useApi, useLoad, useAction, date } from '../../products/kit';

const STATE = {
  off: ['gray', 'Off'],
  scanning: ['blue', 'Watching the market'],
  in_trade: ['green', 'In a trade'],
  error: ['red', 'Needs attention']
};
const NUM_FIELDS = [
  ['takeProfitPercent', 'Take profit (% price move)', '0.1'],
  ['stopLossPercent', 'Stop loss (% price move)', '0.1'],
  ['allocationPercent', 'Allocation per trade (%)', '1'],
  ['leverage', 'Leverage ×', '1'],
  ['maxOpenTrades', 'Max open trades', '1'],
  ['maxHoldHours', 'Max hold (hours)', '1'],
  ['cooldownMinutes', 'Cooldown per symbol (min)', '5']
];
const px = (n) => (n == null ? '—' : n >= 100 ? n.toFixed(2) : n >= 1 ? n.toFixed(4) : Number(n).toPrecision(4));
const signed = (n) => `${n >= 0 ? '+' : ''}${Number(n || 0).toFixed(2)}%`;

export default function AutopilotPanel({ traderId, onChanged }) {
  const api = useApi();
  const { busy, run } = useAction();
  const d = useLoad(() => api.get(`/admin/copy-trading/traders/${traderId}/autopilot`, { params: { signals: 1 } }).then((r) => r.data.data), [traderId]);
  const [f, setF] = useState(null);
  const data = d.data;
  useEffect(() => {
    if (data && !f) setF({ ...data.config, symbols: (data.config.symbols || []).join(', ') });
  }, [data, f]);
  // The server trades on its own: keep the panel current.
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === 'visible' && d.reload(), 30000);
    return () => clearInterval(t);
  }, [d.reload]);

  if (d.error && !data) return <Card title="Autopilot"><ErrorBox message={d.error} onRetry={d.reload} /></Card>;
  if (!data || !f) return <Card title="Autopilot"><Loading /></Card>;

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const after = (r) => { d.reload(); onChanged?.(); return r; };
  const save = () => run('save', () => api.put(`/admin/copy-trading/traders/${traderId}/autopilot`, {
    symbols: f.symbols, strategy: f.strategy, timeframe: f.timeframe,
    ...Object.fromEntries(NUM_FIELDS.map(([k]) => [k, f[k]]))
  }).then(after), (r) => r.data.message);
  const toggle = () => run('toggle', () => api.put(`/admin/copy-trading/traders/${traderId}/autopilot`, { enabled: !data.config.enabled }).then(after), (r) => r.data.message);
  const runNow = () => run('run', () => api.post(`/admin/copy-trading/traders/${traderId}/autopilot/run`).then(after), (r) => r.data.message);
  const [tone, label] = STATE[data.state] || STATE.off;
  const perf = data.performance || {};

  return (
    <Card title={<span className="flex items-center gap-2"><Bot size={15} />Autopilot</span>}
      actions={<div className="flex items-center gap-2">
        <Badge tone={tone}>{label}</Badge>
        <Button size="sm" variant="secondary" busy={busy === 'refresh'} disabled={!!busy} onClick={() => run('refresh', () => d.reload())}><RefreshCw size={12} /></Button>
        {data.config.enabled && <Button size="sm" variant="secondary" busy={busy === 'run'} disabled={!!busy} onClick={runNow}><Play size={12} />Run now</Button>}
        <Button size="sm" variant={data.config.enabled ? 'danger' : 'success'} busy={busy === 'toggle'} disabled={!!busy} onClick={toggle}><Power size={12} />{data.config.enabled ? 'Turn off' : 'Turn on'}</Button>
      </div>}>
      <p className="text-[11px] text-[#8C96A8] mb-3">
        When on, this trader trades by itself every minute: it reads real Binance candles (EMA 9/21 and RSI 14), opens at the live price,
        and closes at the live price on take profit, stop loss, max hold time or when the signal turns. Copiers get every trade, and the
        trader's ROI, win rate and closed trades update from the real results.
        {data.lastRunAt && <> Last run {date(data.lastRunAt)}.</>}
      </p>
      {data.lastError && <p className="text-[11px] text-red-400 mb-2">{data.lastError}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-[11px]">
        {[['ROI', signed(perf.roi)], ['Win rate', `${Number(perf.winRate || 0).toFixed(1)}%`], ['Closed trades', perf.totalTrades || 0], ['Max drawdown', `${Number(perf.maxDrawdown || 0).toFixed(2)}%`]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-[#22282E] border border-[#2F3944] px-3 py-2"><p className="text-[#6B7280]">{k}</p><p className="text-white text-sm font-semibold">{v}</p></div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-2">
        <Field label="Symbols (crypto pairs)" className="md:col-span-3" hint="Comma separated, e.g. BTC/USDT, ETH/USDT, SOL/USDT"><input className={inputCls} value={f.symbols} onChange={set('symbols')} /></Field>
        <Field label="Strategy">
          <select className={inputCls} value={f.strategy} onChange={set('strategy')}>
            <option value="trend">Trend following (EMA cross + RSI)</option>
            <option value="reversal">Reversal (RSI oversold / overbought)</option>
          </select>
        </Field>
        <Field label="Candles">
          <select className={inputCls} value={f.timeframe} onChange={set('timeframe')}>
            {['5m', '15m', '1h', '4h'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        {NUM_FIELDS.map(([k, l, step]) => (
          <Field key={k} label={l}><input type="number" step={step} className={inputCls} value={f[k] ?? ''} onChange={set(k)} /></Field>
        ))}
      </div>
      <div className="flex justify-end mt-2"><Button size="sm" busy={busy === 'save'} disabled={!!busy} onClick={save}><Save size={12} />Save settings</Button></div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-xs font-semibold text-white mb-2">Live market signals</p>
          <div className="space-y-1">
            {(data.signals || []).map((s) => (
              <div key={s.symbol} className="flex items-center justify-between text-[11px] rounded-lg bg-[#22282E] px-3 py-1.5">
                <span className="text-white font-medium w-20">{s.symbol}</span>
                {s.error ? <span className="text-red-400">{s.error}</span> : (
                  <>
                    <span className="text-[#A5AFC4]">{px(s.price)}</span>
                    <span className="text-[#6B7280]">RSI {s.rsi}</span>
                    <Badge tone={s.signal === 'buy' ? 'green' : s.signal === 'sell' ? 'red' : 'gray'}>{s.signal || 'no signal'}</Badge>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-white mb-2">Open trades ({data.open.length})</p>
          <div className="space-y-1">
            {!data.open.length && <p className="text-[11px] text-[#6B7280]">No open trades.</p>}
            {data.open.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-[11px] rounded-lg bg-[#22282E] px-3 py-1.5">
                <span className="text-white">{t.side.toUpperCase()} {t.symbol}</span>
                <span className="text-[#A5AFC4]">{px(t.entryPrice)} → {px(t.markPrice)}</span>
                <span className={t.unrealizedPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>{signed(t.unrealizedPercent)}</span>
                <Badge tone="gray">{t.source === 'auto' ? 'auto' : 'manual'}</Badge>
              </div>
            ))}
          </div>
          <p className="text-xs font-semibold text-white mt-4 mb-2">Recent automatic closes</p>
          <div className="space-y-1">
            {!data.recent.length && <p className="text-[11px] text-[#6B7280]">None yet.</p>}
            {data.recent.map((t) => (
              <div key={t._id} className="flex items-center justify-between text-[11px] rounded-lg bg-[#22282E] px-3 py-1.5">
                <span className="text-white">{t.side.toUpperCase()} {t.symbol}</span>
                <span className="text-[#6B7280]">{(t.closeReason || '').replace('_', ' ')}</span>
                <span className={t.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}>{signed(t.pnlPercent)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold text-white mt-4 mb-2">Activity</p>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {!data.log.length && <p className="text-[11px] text-[#6B7280]">Nothing yet.</p>}
        {data.log.map((l, i) => (
          <p key={i} className="text-[11px] text-[#A5AFC4]"><span className="text-[#6B7280]">{date(l.at)}</span> · {l.text}</p>
        ))}
      </div>
    </Card>
  );
}
