// Settings → Appearance: pick the colour tone of the user dashboard.
// Each card is a small preview of the dashboard in that tone.
import { useEffect, useState } from "react";
import axios from "axios";
import { Check } from "lucide-react";
import { toast } from "../../lib/toast";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../api/config";

const TONES = [
  {
    id: "amber", name: "Amber", note: "Warm espresso surfaces with an amber accent. The default.",
    page: "#171717", card: "#221c18", line: "#3b322b", text: "#a69c94", accent: "#e8742a", onAccent: "#fff",
  },
  {
    id: "classic-blue", name: "Simple blue", note: "The original look: neutral greys with a clean blue accent.",
    page: "#171717", card: "#1d1d1f", line: "#404040", text: "#a3a3a3", accent: "#2563eb", onAccent: "#fff",
  },
  {
    id: "navy", name: "Navy", note: "Deep navy surfaces with a bright blue accent.",
    page: "#171717", card: "#101b3a", line: "#22315c", text: "#8591b5", accent: "#2f63f0", onAccent: "#fff",
  },
  {
    id: "gold", name: "Gold", note: "Dark bronze surfaces with polished gold buttons.",
    page: "#171717", card: "#211d14", line: "#3c3626", text: "#aa9f80", accent: "linear-gradient(180deg,#f6e3a3 0%,#e0bd5a 46%,#c79a33 54%,#e8cd78 100%)", onAccent: "#1d1607",
  },
  {
    id: "silver", name: "Silver", note: "Graphite surfaces with brushed-metal buttons. A classic.",
    page: "#171717", card: "#1d1f22", line: "#383b41", text: "#a4a9b2", accent: "linear-gradient(180deg,#fbfcfd 0%,#dfe2e7 44%,#b9bec6 52%,#d9dce1 78%,#eef0f3 100%)", onAccent: "#111214",
  },
];

function Preview({ t }) {
  return (
    <div className="rounded-xl p-3" style={{ background: t.page }}>
      <div className="rounded-lg p-3" style={{ background: t.card }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px]" style={{ color: t.text }}>Current balance</p>
            <p className="text-[15px] font-semibold text-white leading-tight">$14,276.48</p>
          </div>
          <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full" style={{ background: t.accent, color: t.onAccent }}>Deposit</span>
        </div>
        <div className="mt-3 h-[3px] rounded-full" style={{ background: t.line }}>
          <div className="h-full w-2/3 rounded-full" style={{ background: t.accent }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {["BTC", "ETH", "SOL"].map((c) => (
            <div key={c} className="rounded-md px-1.5 py-1" style={{ background: t.line }}>
              <p className="text-[8px] text-white font-medium">{c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Appearance() {
  const { token } = useAuth();
  const [current, setCurrent] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/admin/settings/appearance`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setCurrent(r.data?.settings?.dashboardTheme || "amber"))
      .catch(() => { setCurrent("amber"); toast.error("Couldn't load the current tone"); });
  }, [token]);

  const choose = async (id) => {
    if (id === current || saving) return;
    setSaving(id);
    try {
      await axios.put(`${API_BASE_URL}/admin/settings/appearance`, { dashboardTheme: id }, { headers: { Authorization: `Bearer ${token}` } });
      setCurrent(id);
      toast.success("Dashboard tone updated. Users see it on their next page load.");
    } catch {
      toast.error("Couldn't save the tone");
    } finally {
      setSaving("");
    }
  };

  return (
    <div className="p-6 max-w-[1100px]">
      <h1 className="text-xl font-semibold text-white">Appearance</h1>
      <p className="text-sm text-[#A5AFC4] mt-1">Choose the colour tone of the user dashboard. Dark mode stays on in every tone.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TONES.map((t) => {
          const on = current === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => choose(t.id)}
              disabled={!current || !!saving}
              className={`text-left rounded-2xl p-3 bg-[#282F36] transition-all duration-200 hover:-translate-y-0.5 ${on ? "ring-2 ring-blue-500" : "ring-1 ring-white/5 hover:ring-white/15"} disabled:cursor-wait`}
            >
              <Preview t={t} />
              <div className="flex items-start justify-between gap-3 mt-3 px-1">
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}{t.id === "amber" && <span className="ml-2 text-[10px] font-medium text-[#A5AFC4]">Default</span>}</p>
                  <p className="text-xs text-[#A5AFC4] mt-0.5 leading-relaxed">{t.note}</p>
                </div>
                <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${on ? "bg-blue-500 text-white" : "bg-[#303943]"}`}>
                  {on && <Check size={12} strokeWidth={3} />}
                  {saving === t.id && <span className="w-2.5 h-2.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
