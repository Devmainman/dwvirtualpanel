import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTradingMode, setTradingMode } from "../../api/services/TradingModeService";
import { Check, Zap, RefreshCcw, Server, Activity } from "lucide-react";

export default function TradingMode() {
  const { token } = useAuth();
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);

  const loadMode = async () => {
    try {
      const res = await getTradingMode(token);
      setMode(res.data.mode);
      setHistory([{ mode: res.data.mode, time: new Date() }]);
    } catch (err) {
      console.error("Error loading trading mode:", err);
      setMessage("Failed to load trading mode");
    }
    setLoading(false);
  };

  const updateMode = async (newMode) => {
    try {
      await setTradingMode(token, newMode);
      setMode(newMode);
      const timestamp = new Date();
      setHistory((prev) => [{ mode: newMode, time: timestamp }, ...prev]);
      setMessage(`Trading mode switched to ${newMode.toUpperCase()}`);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("Error updating trading mode:", err);
      setMessage("Failed to update trading mode");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  useEffect(() => {
    loadMode();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCcw className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-blue-300">Loading trading mode…</span>
      </div>
    );

  return (
    <div className="p-6 bg-[#171C22] text-[#A5AFC4] rounded-xl shadow-lg border border-[#2A323C]">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center space-x-2">
          <Zap className="text-yellow-400 h-6 w-6 animate-pulse" />
          <span>Trading Mode Control Center</span>
        </h2>

        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <Activity className="h-4 w-4 text-green-400 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className="mb-4 p-3 rounded-md bg-[#0e4629] text-green-100 border border-green-700 shadow-md animate-fade-in">
          {message}
        </div>
      )}

      {/* Mode Display & Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 bg-[#1E252C] p-4 rounded-lg border border-[#2e3642] shadow-inner">
        <div>
          <p className="text-sm text-gray-400">Current Trading Mode</p>
          <span
            className={`px-4 py-1 mt-1 inline-flex items-center space-x-2 rounded-full font-semibold text-sm transition-all shadow ${
              mode === "live"
                ? "bg-green-900/60 text-green-200 border border-green-700 animate-pulse"
                : "bg-yellow-900/60 text-yellow-200 border border-yellow-700"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current animate-ping"></span>
            <span>{mode.toUpperCase()}</span>
          </span>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-4">
          <button
            onClick={() => updateMode("live")}
            disabled={mode === "live"}
            className={`px-5 py-2 rounded-md font-medium backdrop-blur-sm transition-all duration-200 shadow-md ${
              mode === "live"
                ? "bg-gray-700 cursor-not-allowed text-gray-300"
                : "bg-green-900/70 hover:bg-green-800 text-green-100 border border-green-700 hover:shadow-green-500/20"
            }`}
          >
            <Check className="inline h-4 w-4 mr-1" /> LIVE MODE
          </button>

          <button
            onClick={() => updateMode("simulation")}
            disabled={mode === "simulation"}
            className={`px-5 py-2 rounded-md font-medium backdrop-blur-sm transition-all duration-200 shadow-md ${
              mode === "simulation"
                ? "bg-gray-700 cursor-not-allowed text-gray-300"
                : "bg-yellow-900/70 hover:bg-yellow-800 text-yellow-100 border border-yellow-700 hover:shadow-yellow-500/20"
            }`}
          >
            SIMULATION
          </button>
        </div>
      </div>

      {/* Technical Panel */}
      <div className="bg-[#1C242C] border border-[#323b45] rounded-lg p-4 mb-6 shadow-md">
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <Server className="h-5 w-5 text-blue-400" />
          <span>System Technical Info</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-[#222a33] p-3 rounded-md border border-[#2f3843]">
            <p className="text-gray-400 text-xs">API Endpoint</p>
            <p className="truncate text-blue-300">/api/admin/trading-mode</p>
          </div>

          <div className="bg-[#222a33] p-3 rounded-md border border-[#2f3843]">
            <p className="text-gray-400 text-xs">Security</p>
            <p className="text-purple-300">Admin Auth + Token Validation</p>
          </div>

          <div className="bg-[#222a33] p-3 rounded-md border border-[#2f3843]">
            <p className="text-gray-400 text-xs">Mode Status</p>
            <p className={mode === "live" ? "text-green-300" : "text-yellow-300"}>
              {mode.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* History Panel */}
      <div className="bg-[#1C242C] border border-[#323b45] rounded-lg p-4 shadow-lg">
        <h3 className="font-semibold mb-2">Mode Change History</h3>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No history available</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.map((h, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-[#222a33] px-3 py-2 rounded-md border border-[#2f3843]"
              >
                <span
                  className={`font-medium ${
                    h.mode === "live" ? "text-green-300" : "text-yellow-300"
                  }`}
                >
                  {h.mode.toUpperCase()}
                </span>

                <span className="text-gray-400 text-xs">
                  {h.time.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
