// pages/mining/MiningOverview.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Cpu, Zap, Award, Users, BarChart, 
  TrendingUp, Clock, DollarSign, Hash, Thermometer, RefreshCw,
  Activity, TrendingDown, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningStats } from '../../api/adminMiningApi';

export default function MiningOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMiners, setActiveMiners] = useState(0);
  const [totalHashRate, setTotalHashRate] = useState(0);

  useEffect(() => {
    fetchMiningStats();
  }, []);

  const fetchMiningStats = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningStats(token);
      setStats(response.stats);
      setActiveMiners(response.stats?.overview?.usersWithMining || 0);
      setTotalHashRate(response.stats?.overview?.totalHashRate || 0);
    } catch (error) {
      console.error("Failed to fetch mining stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, change, color, unit = '' }) => (
    <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-indigo-100 text-sm">{title}</p>
          <h3 className="text-white text-2xl font-bold mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}{unit}
          </h3>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${change > 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="bg-white/20 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
          View Details
        </span>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, onClick, color }) => (
    <button 
      onClick={onClick}
      className="bg-[#2B333C] rounded-lg p-4 hover:bg-[#303943] transition-colors shadow-md border border-[#303943]/50"
    >
      <div className={`inline-flex p-2 rounded-lg mb-3 ${color}`}>
        {icon}
      </div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-[#A5AFC4] text-sm">{description}</p>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Dashboard</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Overview</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Activity className="h-5 w-5 text-white" />}
          title="Active Sessions"
          value={stats?.overview?.activeSessions || 0}
          change={12}
          color="bg-blue-500/20"
        />
        <StatCard
          icon={<Cpu className="h-5 w-5 text-white" />}
          title="Active Equipment"
          value={stats?.overview?.activeEquipment || 0}
          change={8}
          color="bg-green-500/20"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-white" />}
          title="Active Miners"
          value={activeMiners}
          change={15}
          color="bg-purple-500/20"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-white" />}
          title="Total Earnings"
          value={stats?.rewards?.totalValue || 0}
          change={24}
          color="bg-yellow-500/20"
          unit="$"
        />
      </div>

      {/* Real-time Stats Section */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Real-time Mining Status</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <button 
            onClick={fetchMiningStats}
            disabled={isLoading}
            className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <div className="mt-4 text-[#A5AFC4]">Loading mining data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Hash Rate */}
              <div className="bg-[#303943] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Hash className="h-5 w-5 text-indigo-400 mr-2" />
                    <span className="text-white font-medium">Hash Rate</span>
                  </div>
                  <div className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full">
                    {stats?.overview?.totalHashRate || 0} TH/s
                  </div>
                </div>
                <div className="w-full bg-[#1E232A] rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full"
                    style={{ width: `${Math.min((totalHashRate / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#A5AFC4] mt-2">
                  <span>0 TH/s</span>
                  <span>500 TH/s</span>
                </div>
              </div>

              {/* Power Consumption */}
              <div className="bg-[#303943] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-white font-medium">Power Consumption</span>
                  </div>
                  <div className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    {stats?.overview?.totalPower || 0} kW
                  </div>
                </div>
                <div className="w-full bg-[#1E232A] rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${Math.min((stats?.overview?.totalPower || 0) / 10000 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#A5AFC4] mt-2">
                  <span>0 kW</span>
                  <span>10,000 kW</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-[#303943] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-white font-medium">Avg Temperature</span>
                  </div>
                  <div className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
                    {stats?.overview?.avgTemperature || 0}°C
                  </div>
                </div>
                <div className="w-full bg-[#1E232A] rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${Math.min((stats?.overview?.avgTemperature || 0) / 100 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#A5AFC4] mt-2">
                  <span>0°C</span>
                  <span>100°C</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <QuickActionCard
          icon={<BarChart className="h-5 w-5 text-indigo-400" />}
          title="View Analytics"
          description="Detailed mining analytics and reports"
          onClick={() => window.location.href = '/mining/analytics'}
          color="bg-indigo-500/20"
        />
        <QuickActionCard
          icon={<Users className="h-5 w-5 text-green-400" />}
          title="Manage Miners"
          description="View and manage mining users"
          onClick={() => window.location.href = '/mining/user-stats'}
          color="bg-green-500/20"
        />
        <QuickActionCard
          icon={<Cpu className="h-5 w-5 text-purple-400" />}
          title="Pools"
          description="Manage mining pools"
          onClick={() => window.location.href = '/mining/pools'}
          color="bg-purple-500/20"
        />
        <QuickActionCard
          icon={<Award className="h-5 w-5 text-yellow-400" />}
          title="Rewards"
          description="View mining rewards and payouts"
          onClick={() => window.location.href = '/mining/rewards'}
          color="bg-yellow-500/20"
        />
      </div>

      {/* Rewards Summary */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943]">
          <h2 className="text-lg font-semibold text-white">Rewards Summary</h2>
          <p className="text-[#A5AFC4] text-sm">Overview of mining rewards distribution</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#303943] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {stats?.rewards?.totalRewards || 0}
              </div>
              <div className="text-[#A5AFC4] text-sm">Total Rewards</div>
            </div>
            <div className="bg-[#303943] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats?.rewards?.pendingRewards || 0}
              </div>
              <div className="text-[#A5AFC4] text-sm">Pending</div>
            </div>
            <div className="bg-[#303943] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats?.rewards?.claimedRewards || 0}
              </div>
              <div className="text-[#A5AFC4] text-sm">Claimed</div>
            </div>
            <div className="bg-[#303943] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                ${(stats?.rewards?.dailyEarnings || 0).toLocaleString()}
              </div>
              <div className="text-[#A5AFC4] text-sm">Today's Earnings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Card */}
      <div className="bg-[#282F36] rounded-lg p-4 border border-[#303943]/50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Need help with mining management?</h3>
            <p className="text-sm text-[#A5AFC4] mb-3">
              Learn how to optimize mining operations and manage mining pools effectively.
            </p>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center">
              View Documentation
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}