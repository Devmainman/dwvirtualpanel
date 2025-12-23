// pages/mining/MiningRewards.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Search, MoreHorizontal,
  AlertCircle, Award, CheckCircle, Clock, DollarSign, Download,
  ChevronDown, Trash2, Eye, Bitcoin, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningRewards, deleteMiningReward, exportMiningData } from '../../api/adminMiningApi';

export default function MiningRewards() {
  const { token } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    coin: 'all',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningRewards(token);
      setRewards(response.rewards || []);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportMiningData(token, 'rewards', 'csv', filters.startDate, filters.endDate);
      // Handle file download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mining-rewards-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const handleDelete = async (rewardId) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    
    try {
      await deleteMiningReward(token, rewardId);
      setRewards(rewards.filter(r => r.id !== rewardId));
    } catch (error) {
      console.error("Failed to delete reward:", error);
    }
  };

  const getCoinIcon = (coin) => {
    const icons = {
      BTC: '₿',
      ETH: 'Ξ',
      LTC: 'Ł',
      DOGE: 'Ð',
      XMR: 'ɱ',
      ZEC: 'ⓩ',
      ETC: 'ξ',
      RVN: 'R'
    };
    return icons[coin] || coin;
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      claimed: 'bg-green-900/30 text-green-400 border border-green-500/30',
      failed: 'bg-red-900/30 text-red-400 border border-red-500/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20'}`}>
        {status === 'claimed' ? (
          <CheckCircle size={12} className="mr-1" />
        ) : (
          <Clock size={12} className="mr-1" />
        )}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reward.coin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || reward.status === filters.status;
    const matchesCoin = filters.coin === 'all' || reward.coin === filters.coin;
    
    let matchesDate = true;
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      const rewardDate = new Date(reward.createdAt);
      matchesDate = matchesDate && rewardDate >= startDate;
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      const rewardDate = new Date(reward.createdAt);
      matchesDate = matchesDate && rewardDate <= endDate;
    }
    
    return matchesSearch && matchesStatus && matchesCoin && matchesDate;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Rewards</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Rewards</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Rewards</p>
              <h3 className="text-white text-2xl font-bold mt-1">{rewards.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              All rewards
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Pending</p>
              <h3 className="text-white text-2xl font-bold mt-1 text-yellow-400">
                {rewards.filter(r => r.status === 'pending').length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Awaiting claim
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Value</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${rewards.reduce((sum, r) => sum + (r.value || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              USD equivalent
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Claimed</p>
              <h3 className="text-white text-2xl font-bold mt-1 text-green-400">
                {rewards.filter(r => r.status === 'claimed').length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Distributed
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search rewards or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="claimed">Claimed</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.coin}
              onChange={(e) => setFilters({...filters, coin: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Coins</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="LTC">Litecoin (LTC)</option>
              <option value="DOGE">Dogecoin (DOGE)</option>
              <option value="XMR">Monero (XMR)</option>
            </select>
            <button 
              onClick={fetchRewards}
              disabled={isLoading}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleExport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Mining Rewards</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {rewards.length} rewards
            </span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">User</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Coin</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Amount</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Value (USD)</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Confirmed</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading mining rewards...</div>
              </div>
            ) : filteredRewards.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No mining rewards found</h3>
                <p className="text-[#A5AFC4]">No rewards match your search criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRewards.map((reward) => (
                  <div key={reward.id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h3 className="font-medium text-white">{reward.user?.name}</h3>
                        </div>
                        <StatusBadge status={reward.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-[#A5AFC4]">Coin:</div>
                        <div className="flex items-center">
                          <span className="text-white font-medium mr-1">{getCoinIcon(reward.coin)}</span>
                          <span className="text-white font-medium">{reward.coin}</span>
                        </div>
                        
                        <div className="text-[#A5AFC4]">Amount:</div>
                        <div className="text-white font-medium">{reward.amount}</div>
                        
                        <div className="text-[#A5AFC4]">Value:</div>
                        <div className="text-white font-medium">${reward.value?.toFixed(2)}</div>
                        
                        <div className="text-[#A5AFC4]">Confirmed:</div>
                        <div className={`text-white font-medium ${reward.confirmed ? 'text-green-400' : 'text-yellow-400'}`}>
                          {reward.confirmed ? 'Yes' : 'No'} ({reward.confirmations || 0})
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4]">
                          {reward.claimedAt ? `Claimed: ${new Date(reward.claimedAt).toLocaleDateString()}` : 'Not claimed'}
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(reward.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* User */}
                      <div className="col-span-3 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                        <div>
                          <span className="text-white font-medium block">{reward.user?.name}</span>
                          <span className="text-xs text-[#A5AFC4]">{reward.user?.email}</span>
                        </div>
                      </div>

                      {/* Coin */}
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <span className="text-white font-medium mr-1">{getCoinIcon(reward.coin)}</span>
                          <span className="text-white">{reward.coin}</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2">
                        <span className="font-semibold text-white">{reward.amount}</span>
                      </div>

                      {/* Value */}
                      <div className="col-span-2">
                        <span className="font-semibold text-green-400">${reward.value?.toFixed(2)}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status={reward.status} />
                      </div>

                      {/* Confirmed */}
                      <div className="col-span-1">
                        <span className={`text-sm ${reward.confirmed ? 'text-green-400' : 'text-yellow-400'}`}>
                          {reward.confirmed ? 'Yes' : 'No'}
                        </span>
                        <div className="text-xs text-[#A5AFC4]">({reward.confirmations || 0} conf)</div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        <button className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(reward.id)}
                          className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-[#A5AFC4] hover:text-white p-2 rounded hover:bg-[#404A56]">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}