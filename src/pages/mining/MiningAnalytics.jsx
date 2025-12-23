// pages/mining/MiningAnalytics.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Download, 
  BarChart, TrendingUp, TrendingDown, Calendar,
  DollarSign, Users, Cpu, Zap, AlertCircle, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningAnalytics } from '../../api/adminMiningApi';

export default function MiningAnalytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningAnalytics(token, selectedPeriod);
      setAnalytics(response.analytics);
      setChartData(response.analytics?.dailyEarnings || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const periods = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' }
  ];

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const maxEarnings = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.earnings))
    : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Analytics</h1>
          <p className="text-[#A5AFC4]">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Analytics</span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-indigo-400 mr-2" />
            <h3 className="text-white font-medium">Analytics Period</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#303943] text-[#A5AFC4] hover:bg-[#3A434D]'
                }`}
              >
                {period.label}
              </button>
            ))}
            <button 
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign className="h-5 w-5 text-white" />}
          title="Total Earnings"
          value={analytics?.summary?.totalEarnings || 0}
          change={24}
          color="bg-blue-500/20"
          unit="$"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-white" />}
          title="Active Miners"
          value={analytics?.userActivity?.length || 0}
          change={15}
          color="bg-green-500/20"
        />
        <StatCard
          icon={<Cpu className="h-5 w-5 text-white" />}
          title="Total Sessions"
          value={analytics?.summary?.totalSessions || 0}
          change={8}
          color="bg-purple-500/20"
        />
        <StatCard
          icon={<Zap className="h-5 w-5 text-white" />}
          title="Avg Session Time"
          value={analytics?.userActivity?.[0]?.totalHours ? Math.round(analytics.userActivity[0].totalHours) : 0}
          change={12}
          color="bg-yellow-500/20"
          unit="h"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Earnings Chart */}
        <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 overflow-hidden">
          <div className="p-4 border-b border-[#303943] flex justify-between items-center">
            <div className="flex items-center">
              <BarChart className="h-5 w-5 text-indigo-400 mr-2" />
              <h3 className="text-white font-medium">Daily Earnings</h3>
            </div>
            <div className="text-sm text-[#A5AFC4]">
              {selectedPeriod === '7d' ? 'Last 7 Days' : 
               selectedPeriod === '30d' ? 'Last 30 Days' :
               selectedPeriod === '90d' ? 'Last 90 Days' : 'Last Year'}
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-[#A5AFC4] mb-4" />
                <p className="text-[#A5AFC4]">No data available for this period</p>
              </div>
            ) : (
              <div className="h-64">
                <div className="flex items-end justify-between h-48 px-4 pb-4">
                  {chartData.map((day, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-400"
                        style={{ 
                          height: `${(day.earnings / maxEarnings) * 80}%`,
                          minHeight: '4px'
                        }}
                        title={`${formatDate(day._id)}: $${day.earnings.toFixed(2)}`}
                      ></div>
                      <div className="mt-2 text-xs text-[#A5AFC4]">
                        {formatDate(day._id)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#303943]">
                  <div className="text-sm text-[#A5AFC4]">
                    Total: ${chartData.reduce((sum, day) => sum + day.earnings, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-400">
                    {chartData.length} days
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coin Distribution */}
        <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 overflow-hidden">
          <div className="p-4 border-b border-[#303943] flex justify-between items-center">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-indigo-400 mr-2" />
              <h3 className="text-white font-medium">Coin Distribution</h3>
            </div>
            <div className="text-sm text-[#A5AFC4]">
              By Value
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : !analytics?.coinDistribution || analytics.coinDistribution.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <AlertCircle className="h-12 w-12 text-[#A5AFC4] mb-4" />
                <p className="text-[#A5AFC4]">No coin distribution data</p>
              </div>
            ) : (
              <div className="h-64">
                <div className="space-y-4">
                  {analytics.coinDistribution.map((coin, index) => {
                    const percentage = (coin.totalValue / analytics.coinDistribution.reduce((sum, c) => sum + c.totalValue, 0)) * 100;
                    const colors = ['bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
                            <span className="text-white font-medium">{coin._id}</span>
                          </div>
                          <div className="text-sm text-[#A5AFC4]">
                            ${coin.totalValue.toFixed(2)} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                        <div className="w-full bg-[#1E232A] rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Miners Table */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-indigo-400 mr-2" />
            <h3 className="text-white font-medium">Top Miners</h3>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              Top 10
            </span>
          </div>
          <button className="text-[#A5AFC4] hover:text-white text-sm">
            View All →
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <div className="mt-4 text-[#A5AFC4]">Loading top miners...</div>
            </div>
          ) : !analytics?.userActivity || analytics.userActivity.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-[#A5AFC4] mx-auto mb-4" />
              <p className="text-[#A5AFC4]">No miner data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#303943]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#A5AFC4]">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#A5AFC4]">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#A5AFC4]">Sessions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#A5AFC4]">Earnings</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#A5AFC4]">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.userActivity.slice(0, 10).map((user, index) => (
                    <tr key={index} className="border-b border-[#303943]/50 hover:bg-[#303943]/30">
                      <td className="py-3 px-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-500/20 text-gray-400' :
                          index === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white font-medium">User #{user._id?.substring(0, 8) || 'Unknown'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{user.sessions}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-green-400 font-medium">${user.totalEarnings?.toFixed(2) || '0.00'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-white">{Math.round(user.totalHours || 0)}h</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pool Performance */}
      <div className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <Cpu className="h-5 w-5 text-indigo-400 mr-2" />
            <h3 className="text-white font-medium">Pool Performance</h3>
          </div>
          <button className="text-[#A5AFC4] hover:text-white text-sm">
            View Details →
          </button>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <div className="mt-4 text-[#A5AFC4]">Loading pool data...</div>
            </div>
          ) : !analytics?.poolPerformance || analytics.poolPerformance.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-[#A5AFC4] mx-auto mb-4" />
              <p className="text-[#A5AFC4]">No pool performance data</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.poolPerformance.slice(0, 3).map((pool, index) => (
                <div key={index} className="bg-[#303943] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-white font-medium">{pool.poolName}</h4>
                      <p className="text-sm text-[#A5AFC4]">{pool.sessions} sessions</p>
                    </div>
                    <div className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A5AFC4]">Avg Hash Rate</span>
                      <span className="text-white font-medium">{pool.avgHashRate?.toFixed(1) || 0} TH/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#A5AFC4]">Total Earnings</span>
                      <span className="text-green-400 font-medium">${pool.totalEarnings?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}