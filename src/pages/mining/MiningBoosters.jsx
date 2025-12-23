// pages/mining/MiningBoosters.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Search, MoreHorizontal,
  AlertCircle, Zap, Clock, DollarSign, CheckCircle, XCircle,
  ChevronDown, Eye, TrendingUp, Battery, Flame, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningBoosters } from '../../api/adminMiningApi';

export default function MiningBoosters() {
  const { token } = useAuth();
  const [boosters, setBoosters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchBoosters();
  }, []);

  const fetchBoosters = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningBoosters(token);
      setBoosters(response.boosters || []);
    } catch (error) {
      console.error("Failed to fetch boosters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const TypeIcon = ({ type }) => {
    const icons = {
      'hash_rate': <TrendingUp className="h-4 w-4" />,
      'energy': <Battery className="h-4 w-4" />,
      'rewards': <DollarSign className="h-4 w-4" />,
      'cooling': <Flame className="h-4 w-4" />,
      'stability': <Shield className="h-4 w-4" />
    };
    
    const colors = {
      'hash_rate': 'text-purple-400',
      'energy': 'text-green-400',
      'rewards': 'text-yellow-400',
      'cooling': 'text-blue-400',
      'stability': 'text-indigo-400'
    };
    
    return (
      <div className={`p-2 rounded-lg ${colors[type]} bg-${colors[type].split('-')[1]}-500/20`}>
        {icons[type] || <Zap className="h-4 w-4" />}
      </div>
    );
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      'hash_rate': 'bg-purple-500/20 text-purple-400',
      'energy': 'bg-green-500/20 text-green-400',
      'rewards': 'bg-yellow-500/20 text-yellow-400',
      'cooling': 'bg-blue-500/20 text-blue-400',
      'stability': 'bg-indigo-500/20 text-indigo-400'
    };
    
    const labels = {
      'hash_rate': 'Hash Rate',
      'energy': 'Energy',
      'rewards': 'Rewards',
      'cooling': 'Cooling',
      'stability': 'Stability'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || 'bg-gray-500/20'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const StatusBadge = ({ status, expiresAt }) => {
    const isExpired = new Date(expiresAt) < new Date();
    const actualStatus = isExpired ? 'expired' : status;
    
    const colors = {
      active: 'bg-green-900/30 text-green-400 border border-green-500/30',
      expired: 'bg-red-900/30 text-red-400 border border-red-500/30',
      cancelled: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[actualStatus] || 'bg-gray-500/20'}`}>
        {actualStatus === 'active' ? (
          <CheckCircle size={12} className="mr-1" />
        ) : (
          <XCircle size={12} className="mr-1" />
        )}
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </span>
    );
  };

  const filteredBoosters = boosters.filter(booster => {
    const matchesSearch = booster.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booster.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || booster.type === filters.type;
    const matchesStatus = filters.status === 'all' || booster.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatTimeLeft = (expiresAt) => {
    if (!expiresAt) return 'Unknown';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m`;
    return `${diffMinutes}m`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Boosters</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Boosters</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Boosters</p>
              <h3 className="text-white text-2xl font-bold mt-1">{boosters.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              All boosters
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Active Boosters</p>
              <h3 className="text-white text-2xl font-bold mt-1 text-green-400">
                {boosters.filter(b => b.status === 'active' && new Date(b.expiresAt) > new Date()).length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Currently active
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Revenue</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${boosters.reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              From boosters
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Avg Multiplier</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {boosters.length > 0 
                  ? (boosters.reduce((sum, b) => sum + (b.multiplier || 1), 0) / boosters.length).toFixed(1)
                  : 0}x
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Performance boost
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
                placeholder="Search boosters or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="hash_rate">Hash Rate</option>
              <option value="energy">Energy</option>
              <option value="rewards">Rewards</option>
              <option value="cooling">Cooling</option>
              <option value="stability">Stability</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              onClick={fetchBoosters}
              disabled={isLoading}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Boosters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <div className="mt-4 text-[#A5AFC4]">Loading boosters...</div>
          </div>
        ) : filteredBoosters.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#282F36] rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#303943] mb-4">
              <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No boosters found</h3>
            <p className="text-[#A5AFC4]">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredBoosters.map((booster) => (
            <div key={booster.id} className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 overflow-hidden hover:border-[#404A56] transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <TypeIcon type={booster.type} />
                    <div>
                      <h3 className="font-semibold text-white">{booster.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <TypeBadge type={booster.type} />
                        <StatusBadge status={booster.status} expiresAt={booster.expiresAt} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Multiplier</span>
                    <span className="font-semibold text-white">
                      {booster.multiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Duration</span>
                    <span className="font-semibold text-white">
                      {Math.round(booster.duration / 60)} minutes
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Price</span>
                    <span className="font-semibold text-white">${booster.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Time Left</span>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-[#A5AFC4]" />
                      <span className="font-semibold text-white">
                        {formatTimeLeft(booster.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">User</span>
                    <span className="font-semibold text-white truncate max-w-[120px]">
                      {booster.user?.email || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-[#404A56]">
                  <div className="text-xs text-[#A5AFC4]">
                    Activated: {new Date(booster.activatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-indigo-400 hover:text-indigo-300">
                      <Eye size={18} />
                    </button>
                    <button className="p-1 text-[#A5AFC4] hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}