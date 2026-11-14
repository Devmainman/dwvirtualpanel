// pages/copytrading/Copytrading.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Users, TrendingUp, DollarSign, BarChart, 
  Download, Eye, Pause, Play, Shield, Trash2, 
  UserCheck, UserX, ChevronRight, RefreshCw, Plus,
  CheckCircle, XCircle, Filter, ChevronDown,
  Edit2, MoreHorizontal, AlertCircle, Activity,
  TrendingDown, Copy, Target, Save, X,
  Globe, Percent, Calendar, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, STATIC_BASE_URL } from '../../api/config';

// StatusBadge and VerificationBadge components
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    status === 'active' 
      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
      : 'bg-red-900/30 text-red-400 border border-red-500/30'
  }`}>
    {status === 'active' ? (
      <CheckCircle size={12} className="mr-1" />
    ) : (
      <XCircle size={12} className="mr-1" />
    )}
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const VerificationBadge = ({ verified, level }) => {
  if (!verified) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-900/30 text-gray-400 border border-gray-500/30">
        <UserX size={12} className="mr-1" />
        Unverified
      </span>
    );
  }

  const config = {
    pro: { color: 'bg-purple-900/30 text-purple-400 border-purple-500/30', text: 'Pro' },
    advanced: { color: 'bg-blue-900/30 text-blue-400 border-blue-500/30', text: 'Advanced' },
    basic: { color: 'bg-green-900/30 text-green-400 border-green-500/30', text: 'Verified' }
  };

  const { color, text } = config[level] || config.basic;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Shield size={12} className="mr-1" />
      {text}
    </span>
  );
};

const getAvatarUrl = (trader) => {
  if (trader?.avatar) {
    return /^(https?:|data:)/.test(trader.avatar)
      ? trader.avatar
      : `${STATIC_BASE_URL}${trader.avatar.startsWith('/') ? trader.avatar : '/' + trader.avatar}`;
  }
  return null;
};

const formatAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  
  if (avatarPath.startsWith('/')) {
    return `${API_BASE_URL}${avatarPath}`;
  }
  
  return `${API_BASE_URL}/uploads/traders/${avatarPath}`;
};

const PerformanceBadge = ({ profit }) => {
  const isPositive = profit >= 0;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
      isPositive 
        ? 'bg-green-900/20 text-green-400' 
        : 'bg-red-900/20 text-red-400'
    }`}>
      {isPositive ? (
        <TrendingUpIcon size={12} className="mr-1" />
      ) : (
        <TrendingDownIcon size={12} className="mr-1" />
      )}
      {isPositive ? '+' : ''}{profit}%
    </span>
  );
};

export default function Copytrading() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [traders, setTraders] = useState([]);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [showTraderModal, setShowTraderModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({});
  
  const [platformStats, setPlatformStats] = useState({
    totalTraders: 0,
    activeCopies: 0,
    totalCopiedAmount: 0,
    totalCommission: 0,
    monthlyProfit: 0,
    avgWinRate: 0
  });
  
  const [showAddTraderModal, setShowAddTraderModal] = useState(false);
  const [newTrader, setNewTrader] = useState({
    username: '',
    email: '',
    fullName: '',
    country: '',
    tradingStyle: 'day',
    riskLevel: 'medium',
    markets: ['crypto'],
    initialBalance: 10000,
    performance: {
      netProfit: 0,
      winRate: 50,
      totalTrades: 100
    }
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    verification: 'all',
    sortBy: 'profit',
    market: 'all'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchTraders();
    fetchPlatformStats();
  }, [searchParams]);

  const fetchTraders = async () => {
    try {
      setLoading(true);
      const params = {
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 10,
        search: searchParams.get('search') || '',
        status: searchParams.get('status') || 'all',
        verification: searchParams.get('verification') || 'all',
        sortBy: searchParams.get('sortBy') || 'profit',
        market: searchParams.get('market') || 'all'
      };

      const queryParams = new URLSearchParams(params);
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/traders?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTraders(response.data.traders || []);
        setPagination(response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        });
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch traders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/platform/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setPlatformStats(response.data.stats?.overview || {});
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    }
  };

  const handleCreateTrader = async () => {
    try {
      if (!newTrader.username || !newTrader.email) {
        toast.error('Username and email are required');
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/admin/copy-trading/traders`,
        newTrader,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Trader created successfully');
        setShowAddTraderModal(false);
        setNewTrader({
          username: '',
          email: '',
          fullName: '',
          country: '',
          tradingStyle: 'day',
          riskLevel: 'medium',
          markets: ['crypto'],
          initialBalance: 10000,
          performance: {
            netProfit: 0,
            winRate: 50,
            totalTrades: 100
          }
        });
        fetchTraders();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create trader');
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page }));
  };

  const handleViewTrader = async (traderId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setSelectedTrader(response.data.trader);
        setShowTraderModal(true);
      }
    } catch (error) {
      toast.error('Failed to load trader details');
    }
  };

  const handleOpenAction = (type, trader) => {
    setActionType(type);
    setActionData({
      traderId: trader.traderId,
      username: trader.username || '',
      email: trader.email || '',
      fullName: trader.fullName || '',
      country: trader.country || '',
      avatar: trader.avatar || '',
      verified: trader.verified || false,
      verificationLevel: trader.verificationLevel || 'basic',
      isActive: trader.isActive,
      netProfit: trader.performance?.netProfit || 0,
      winRate: trader.performance?.winRate || 0,
      totalTrades: trader.performance?.totalTrades || 0,
      activeCopiers: trader.socialStats?.activeCopiers || 0,
      reason: '',
      notes: '',
      confirmText: ''
    });
    setShowActionModal(true);
  };

const handleExecuteAction = async () => {
  try {
    let response;
    
    switch (actionType) {
      case 'toggleStatus':
        console.log('Updating status:', actionData);
        response = await axios.put(
          `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}/status`,
          { isActive: !actionData.isActive, reason: actionData.reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
        
      case 'updateVerification':
        response = await axios.put(
          `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}/verification`,
          { 
            verificationLevel: actionData.verificationLevel, 
            verified: actionData.verified,
            notes: actionData.notes 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
        
      case 'delete':
        if (actionData.confirmText !== 'CONFIRM') {
          toast.error('Please type CONFIRM to delete');
          return;
        }
        response = await axios.delete(
          `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            data: { reason: actionData.reason }
          }
        );
        break;

      case 'editProfile':
        console.log('Updating profile:', actionData);
        
        // Create the update object matching backend expectations
        const updateData = {
          username: actionData.username,
          fullName: actionData.fullName,
          email: actionData.email,
          country: actionData.country,
          avatar: actionData.avatar,
          performance: {
            netProfit: Number(actionData.netProfit),
            winRate: Number(actionData.winRate),
            totalTrades: Number(actionData.totalTrades)
          },
          socialStats: {
            activeCopiers: Number(actionData.activeCopiers)
          }
        };
        
        console.log('Sending update data:', updateData);
        
        response = await axios.put(
          `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}/profile`,
          updateData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        break;
        
      default:
        return;
    }

    console.log('Response:', response?.data);
    
    if (response?.data?.success) {
      toast.success(response.data.message || 'Action completed successfully');
      fetchTraders(); // Refresh the data
      fetchPlatformStats();
      setShowActionModal(false);
    } else {
      toast.error(response?.data?.error || 'Action failed');
    }
  } catch (error) {
    console.error('Error executing action:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    toast.error(error.response?.data?.error || 'Failed to execute action');
  }
};

  const handleExportData = async () => {
    try {
      setExporting(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `copytrading-traders-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const filteredTraders = traders.filter(trader => {
    if (filters.search && !trader.username.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.status !== 'all' && trader.isActive !== (filters.status === 'active')) return false;
    if (filters.verification !== 'all') {
      if (filters.verification === 'verified' && !trader.verified) return false;
      if (filters.verification === 'unverified' && trader.verified) return false;
      if (filters.verification !== 'verified' && filters.verification !== 'unverified' && 
          trader.verificationLevel !== filters.verification) return false;
    }
    if (filters.market !== 'all' && trader.markets && !trader.markets.includes(filters.market)) return false;
    return true;
  });

  const sortedTraders = [...filteredTraders].sort((a, b) => {
    switch (filters.sortBy) {
      case 'profit':
        return (b.performance?.netProfit || 0) - (a.performance?.netProfit || 0);
      case 'copiers':
        return (b.socialStats?.activeCopiers || 0) - (a.socialStats?.activeCopiers || 0);
      case 'winrate':
        return (b.performance?.winRate || 0) - (a.performance?.winRate || 0);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const traderStats = {
    totalCopiers: traders.reduce((sum, trader) => sum + (trader.socialStats?.activeCopiers || 0), 0),
    activeTraders: traders.filter(t => t.isActive).length,
    averageWinRate: traders.length > 0 ? 
      traders.reduce((sum, t) => sum + (t.performance?.winRate || 0), 0) / traders.length : 0
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A] h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">Copy Trading Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage traders, monitor performance, and configure copy trading settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2 bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] rounded-lg flex items-center text-sm disabled:opacity-50"
          >
            <Download size={16} className="mr-2" />
            {exporting ? 'Exporting...' : 'Export'}
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center text-sm">
            <BarChart size={16} className="mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Traders</p>
              <h3 className="text-white text-2xl font-bold mt-1">{platformStats.totalTraders}</h3>
              <p className="text-green-400 text-xs mt-1">+12% from last month</p>
            </div>
            <Users className="h-10 w-10 text-green-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#1E456E] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Active Copies</p>
              <h3 className="text-white text-2xl font-bold mt-1">{platformStats.activeCopies}</h3>
              <p className="text-blue-400 text-xs mt-1">{traderStats.activeTraders} active traders</p>
            </div>
            <Copy className="h-10 w-10 text-blue-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#694D8C] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Copied</p>
              <h3 className="text-white text-2xl font-bold mt-1">${(platformStats.totalCopiedAmount || 0).toLocaleString()}</h3>
              <p className="text-purple-400 text-xs mt-1">Across all traders</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#2D6E46] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Avg Win Rate</p>
              <h3 className="text-white text-2xl font-bold mt-1">{platformStats.avgWinRate || traderStats.averageWinRate.toFixed(1)}%</h3>
              <p className="text-green-400 text-xs mt-1">Platform average</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-400/50" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Traders</h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search traders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
            >
              <Filter size={16} className="mr-2" />
              Filters
              <ChevronDown size={16} className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={fetchTraders}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm shadow-lg"
              onClick={() => setShowAddTraderModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trader
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-[#303943] bg-[#303943]/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Verification</label>
                <select
                  value={filters.verification}
                  onChange={(e) => handleFilterChange('verification', e.target.value)}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Market</label>
                <select
                  value={filters.market}
                  onChange={(e) => handleFilterChange('market', e.target.value)}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Markets</option>
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                  <option value="stocks">Stocks</option>
                  <option value="commodities">Commodities</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="profit">Profit (High to Low)</option>
                  <option value="copiers">Copiers (High to Low)</option>
                  <option value="winrate">Win Rate (High to Low)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-[#303943] bg-[#303943]/20">
          <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">Trader</div>
          <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Performance</div>
          <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Social Stats</div>
          <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Status</div>
          <div className="col-span-3 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
        </div>

        {/* Traders List */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <p className="text-gray-400 mt-2">Loading traders...</p>
            </div>
          ) : filteredTraders.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No traders found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new trader</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTraders.map((trader) => (
                <div key={trader.traderId} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md border border-[#303943]">
                  {/* Mobile View */}
                  <div className="md:hidden p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3 flex items-center justify-center text-white font-bold overflow-hidden">
                          {getAvatarUrl(trader) ? (
                            <img 
                              src={getAvatarUrl(trader)} 
                              alt={trader.username}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = trader.username?.charAt(0)?.toUpperCase() || 'U';
                              }}
                            />
                          ) : (
                            trader.username?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{trader.username || 'Unknown'}</span>
                            <StatusBadge status={trader.isActive ? 'active' : 'inactive'} />
                          </div>
                          <span className="text-xs text-[#A5AFC4]">{trader.email || 'No email'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenAction('editProfile', trader)}
                        className="text-blue-400 hover:bg-blue-500/20 p-2 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-[#1E232A] rounded-lg p-3">
                        <p className="text-xs text-gray-400">Profit</p>
                        <p className={`font-bold ${(trader.performance?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(trader.performance?.netProfit || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">Win Rate: {trader.performance?.winRate || 0}%</p>
                      </div>
                      
                      <div className="bg-[#1E232A] rounded-lg p-3">
                        <p className="text-xs text-gray-400">Copiers</p>
                        <p className="text-white font-bold">{trader.socialStats?.activeCopiers || 0}</p>
                        <p className="text-xs text-gray-400">Total Trades: {trader.performance?.totalTrades || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <VerificationBadge verified={trader.verified} level={trader.verificationLevel} />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenAction('toggleStatus', trader)}
                          className="text-yellow-400 hover:bg-yellow-500/20 p-2 rounded"
                        >
                          {trader.isActive ? <Pause size={16}/> : <Play size={16}/>}
                        </button>
                        <button 
                          onClick={() => handleOpenAction('delete', trader)}
                          className="text-red-400 hover:bg-red-500/20 p-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewTrader(trader.traderId)}
                          className="text-blue-400 hover:bg-blue-500/20 p-2 rounded"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                    <div className="col-span-3 flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-3 flex items-center justify-center text-white font-bold overflow-hidden">
                        {getAvatarUrl(trader) ? (
                          <img 
                            src={getAvatarUrl(trader)} 
                            alt={trader.username}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = trader.username?.charAt(0)?.toUpperCase() || 'U';
                            }}
                          />
                        ) : (
                          trader.username?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{trader.username || 'Unknown'}</span>
                          <VerificationBadge verified={trader.verified} level={trader.verificationLevel} />
                        </div>
                        <span className="text-xs text-[#A5AFC4]">{trader.email || 'No email'}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe size={12} className="text-gray-500" />
                          <span className="text-xs text-gray-500">{trader.country || 'Not specified'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className={`font-bold ${(trader.performance?.netProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${(trader.performance?.netProfit || 0).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Percent size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-400">Win Rate: {trader.performance?.winRate || 0}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Trades: {trader.performance?.totalTrades || 0}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-white font-medium">
                        {trader.socialStats?.activeCopiers || 0} Active Copiers
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Total: {trader.socialStats?.totalCopiers || 0} copiers
                      </div>
                      {trader.socialStats?.totalInvested && (
                        <div className="text-xs text-gray-500 mt-1">
                          ${(trader.socialStats.totalInvested || 0).toLocaleString()} invested
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={trader.isActive ? 'active' : 'inactive'} />
                        {trader.tradingStyle && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-900/20 text-blue-400">
                            {typeof trader.tradingStyle === 'string' 
                              ? trader.tradingStyle.charAt(0).toUpperCase() + trader.tradingStyle.slice(1) 
                              : 'Trading'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-3 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewTrader(trader.traderId)}
                        className="text-blue-400 hover:bg-blue-500/20 p-2 rounded"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button 
                        onClick={() => handleOpenAction('toggleStatus', trader)}
                        className="text-yellow-400 hover:bg-yellow-500/20 p-2 rounded"
                        title={trader.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {trader.isActive ? <Pause size={16}/> : <Play size={16}/>}
                      </button>
                      
                      <button 
                        onClick={() => handleOpenAction('editProfile', trader)}
                        className="text-blue-400 hover:bg-blue-500/20 p-2 rounded"
                        title="Edit Profile"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button 
                        onClick={() => handleOpenAction('updateVerification', trader)}
                        className="text-purple-400 hover:bg-purple-500/20 p-2 rounded"
                        title="Update Verification"
                      >
                        <Shield size={16} />
                      </button>

                      <button 
                        onClick={() => handleOpenAction('delete', trader)}
                        className="text-red-400 hover:bg-red-500/20 p-2 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#303943] flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} traders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded-lg bg-[#303943] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg ${
                      pagination.page === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#303943] text-gray-400 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 rounded-lg bg-[#303943] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Trader Modal */}
      {showAddTraderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282F36] rounded-xl border border-[#303943] w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#303943]">
              <h3 className="text-xl font-semibold text-white">Add New Trader</h3>
              <button 
                onClick={() => setShowAddTraderModal(false)}
                className="text-[#A5AFC4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Username *</label>
                  <input
                    type="text"
                    value={newTrader.username}
                    onChange={(e) => setNewTrader({...newTrader, username: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john_trader"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Email *</label>
                  <input
                    type="email"
                    value={newTrader.email}
                    onChange={(e) => setNewTrader({...newTrader, email: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newTrader.fullName}
                    onChange={(e) => setNewTrader({...newTrader, fullName: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Trader"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Country</label>
                  <input
                    type="text"
                    value={newTrader.country}
                    onChange={(e) => setNewTrader({...newTrader, country: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="United States"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Trading Style</label>
                  <select
                    value={newTrader.tradingStyle}
                    onChange={(e) => setNewTrader({...newTrader, tradingStyle: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="day">Day Trading</option>
                    <option value="swing">Swing Trading</option>
                    <option value="scalping">Scalping</option>
                    <option value="position">Position Trading</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Risk Level</label>
                  <select
                    value={newTrader.riskLevel}
                    onChange={(e) => setNewTrader({...newTrader, riskLevel: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Initial Balance ($)</label>
                  <input
                    type="number"
                    value={newTrader.initialBalance}
                    onChange={(e) => setNewTrader({...newTrader, initialBalance: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Markets</label>
                  <div className="flex flex-wrap gap-2">
                    {['crypto', 'forex', 'stocks', 'commodities'].map((market) => (
                      <button
                        key={market}
                        type="button"
                        onClick={() => {
                          const markets = newTrader.markets.includes(market)
                            ? newTrader.markets.filter(m => m !== market)
                            : [...newTrader.markets, market];
                          setNewTrader({...newTrader, markets});
                        }}
                        className={`px-3 py-1 rounded-full text-xs ${
                          newTrader.markets.includes(market)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#1E232A] text-gray-400'
                        }`}
                      >
                        {market.charAt(0).toUpperCase() + market.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-[#303943] my-6 pt-6">
                <h4 className="text-sm font-semibold text-white mb-4">Initial Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Net Profit ($)</label>
                    <input
                      type="number"
                      value={newTrader.performance.netProfit}
                      onChange={(e) => setNewTrader({
                        ...newTrader,
                        performance: {...newTrader.performance, netProfit: e.target.value}
                      })}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Win Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newTrader.performance.winRate}
                      onChange={(e) => setNewTrader({
                        ...newTrader,
                        performance: {...newTrader.performance, winRate: e.target.value}
                      })}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Total Trades</label>
                    <input
                      type="number"
                      value={newTrader.performance.totalTrades}
                      onChange={(e) => setNewTrader({
                        ...newTrader,
                        performance: {...newTrader.performance, totalTrades: e.target.value}
                      })}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#303943]">
              <button 
                onClick={() => setShowAddTraderModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#A5AFC4] hover:text-white hover:bg-[#3A434D] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTrader}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Create Trader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Edit/Delete/Verification) */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#282F36] rounded-xl border border-[#303943] w-full max-w-lg shadow-2xl transform transition-all">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#303943]">
              <h3 className="text-xl font-semibold text-white">
                {actionType === 'editProfile' && 'Edit Trader Profile'}
                {actionType === 'toggleStatus' && (actionData.isActive ? 'Deactivate Trader' : 'Activate Trader')}
                {actionType === 'delete' && 'Delete Trader'}
                {actionType === 'updateVerification' && 'Update Verification'}
              </h3>
              <button 
                onClick={() => setShowActionModal(false)}
                className="text-[#A5AFC4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* Edit Profile Form */}
              {actionType === 'editProfile' && (
                <div className="space-y-4">
                   <div className="border border-dashed border-gray-600 rounded-lg p-4 text-center">
      <div className="mb-3">
        {actionData.avatar ? (
          <div className="relative inline-block">
            <img 
              src={formatAvatarUrl(actionData.avatar)} 
              alt="Avatar"
              className="h-20 w-20 rounded-full mx-auto object-cover"
            />
            <button
              type="button"
              onClick={() => setActionData({...actionData, avatar: ''})}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mx-auto flex items-center justify-center text-white text-2xl">
            {actionData.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
      </div>
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (file) {
            const formData = new FormData();
            formData.append('avatar', file);
            
            try {
              const response = await axios.post(
                `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}/avatar`,
                formData,
                {
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );
              
              if (response.data.success) {
                setActionData({...actionData, avatar: response.data.avatar});
                toast.success('Avatar updated successfully');
              }
            } catch (error) {
              toast.error(error.response?.data?.error || 'Failed to upload avatar');
            }
          }
        }}
        className="hidden"
      />
      <label
        htmlFor="avatar-upload"
        className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg cursor-pointer text-sm"
      >
        {actionData.avatar ? 'Change Avatar' : 'Upload Avatar'}
      </label>
      <p className="text-xs text-gray-400 mt-2">Max 2MB - JPG, PNG, WebP, GIF</p>
    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Username</label>
                      <input
                        type="text"
                        value={actionData.username}
                        onChange={(e) => setActionData({...actionData, username: e.target.value})}
                        className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Full Name</label>
                      <input
                        type="text"
                        value={actionData.fullName}
                        onChange={(e) => setActionData({...actionData, fullName: e.target.value})}
                        className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Email</label>
                    <input
                      type="email"
                      value={actionData.email}
                      onChange={(e) => setActionData({...actionData, email: e.target.value})}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Country</label>
                    <input
                      type="text"
                      value={actionData.country}
                      onChange={(e) => setActionData({...actionData, country: e.target.value})}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="border-t border-[#303943] my-4 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">Performance Metrics (Manual Override)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Net Profit ($)</label>
                        <input
                          type="number"
                          value={actionData.netProfit}
                          onChange={(e) => setActionData({...actionData, netProfit: e.target.value})}
                          className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Win Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={actionData.winRate}
                          onChange={(e) => setActionData({...actionData, winRate: e.target.value})}
                          className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Active Copiers</label>
                        <input
                          type="number"
                          value={actionData.activeCopiers}
                          onChange={(e) => setActionData({...actionData, activeCopiers: e.target.value})}
                          className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Total Trades</label>
                        <input
                          type="number"
                          value={actionData.totalTrades}
                          onChange={(e) => setActionData({...actionData, totalTrades: e.target.value})}
                          className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle Status Form */}
              {actionType === 'toggleStatus' && (
                <div>
                  <div className="flex items-center mb-4 p-3 bg-[#1E232A] rounded-lg border border-[#303943]">
                    <AlertCircle className={`h-6 w-6 mr-3 ${actionData.isActive ? 'text-yellow-400' : 'text-green-400'}`} />
                    <p className="text-sm text-[#A5AFC4]">
                      Are you sure you want to <strong>{actionData.isActive ? 'deactivate' : 'activate'}</strong> this trader?
                      {actionData.isActive 
                        ? ' They will no longer be visible to copiers.' 
                        : ' They will become visible in the marketplace.'}
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Reason (Optional)</label>
                  <textarea
                    rows={3}
                    value={actionData.reason}
                    onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                    placeholder="Enter reason for this action..."
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Verification Form */}
              {actionType === 'updateVerification' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="verified"
                      checked={actionData.verified}
                      onChange={(e) => setActionData({...actionData, verified: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-600 bg-[#1E232A] text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="verified" className="text-white text-sm font-medium">Verified Trader</label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Verification Level</label>
                    <select
                      value={actionData.verificationLevel}
                      onChange={(e) => setActionData({...actionData, verificationLevel: e.target.value})}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Admin Notes</label>
                    <textarea
                      rows={3}
                      value={actionData.notes}
                      onChange={(e) => setActionData({...actionData, notes: e.target.value})}
                      placeholder="Internal notes about this verification..."
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Delete Form */}
              {actionType === 'delete' && (
                <div>
                   <div className="flex items-center mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                    <AlertCircle className="h-6 w-6 mr-3 text-red-400" />
                    <p className="text-sm text-red-200">
                      Warning: This action cannot be undone. All data associated with this trader will be permanently deleted.
                    </p>
                  </div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Type "CONFIRM" to delete</label>
                  <input
                    type="text"
                    value={actionData.confirmText || ''}
                    onChange={(e) => setActionData({...actionData, confirmText: e.target.value})}
                    placeholder="CONFIRM"
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center gap-3 p-6 border-t border-[#303943] bg-[#282F36]/50 rounded-b-xl">
              <button 
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#A5AFC4] hover:text-white hover:bg-[#3A434D] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleExecuteAction}
                disabled={actionType === 'delete' && actionData.confirmText !== 'CONFIRM'}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg flex items-center
                  ${actionType === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {actionType === 'delete' ? (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete Permanently
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}