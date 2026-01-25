// pages/copytrading/Copytrading.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Users, TrendingUp, DollarSign, BarChart, 
  Download, Eye, Pause, Play, Shield, Trash2, 
  UserCheck, UserX, ChevronRight, RefreshCw, Plus,
  CheckCircle, XCircle, Filter, ChevronDown,
  Edit2, MoreHorizontal, AlertCircle, Activity,
  TrendingDown, Copy, Target
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

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

  const { color, text, border } = config[level] || config.basic;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${border}`}>
      <Shield size={12} className="mr-1" />
      {text}
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
    totalCommission: 0
  });
  const [showAddTraderModal, setShowAddTraderModal] = useState(false);
const [newTrader, setNewTrader] = useState({
  username: '',
  email: '',
  fullName: '',
  country: '',
  tradingStyle: 'day',
  riskLevel: 'medium',
  markets: ['crypto']
});

  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    verification: 'all',
    sortBy: 'profit'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

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
        sortBy: searchParams.get('sortBy') || 'profit'
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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setPlatformStats(response.data.stats?.overview || {
          totalTraders: 0,
          activeCopies: 0,
          totalCopiedAmount: 0,
          totalCommission: 0
        });
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
        markets: ['crypto']
      });
      fetchTraders();
      fetchPlatformStats();
    }
  } catch (error) {
    console.error('Create trader error:', error);
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
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSelectedTrader(response.data);
        setShowTraderModal(true);
      }
    } catch (error) {
      console.error('Error fetching trader details:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch trader details');
    }
  };

  const handleOpenAction = (type, trader) => {
    setActionType(type);
    setActionData({
      traderId: trader.traderId,
      traderName: trader.username,
      currentStatus: trader.isActive,
      currentVerified: trader.verified,
      currentVerificationLevel: trader.verificationLevel
    });
    setShowActionModal(true);
  };

  const handleExecuteAction = async () => {
    try {
      let response;
      
      switch (actionType) {
        case 'toggleStatus':
          response = await axios.put(
            `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}/status`,
            { isActive: !actionData.currentStatus, reason: actionData.reason },
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
          response = await axios.delete(
            `${API_BASE_URL}/admin/copy-trading/traders/${actionData.traderId}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              data: { reason: actionData.reason }
            }
          );
          break;
          
        default:
          return;
      }

      if (response.data.success) {
        toast.success(response.data.message);
        fetchTraders();
        fetchPlatformStats();
        setShowActionModal(false);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error(error.response?.data?.error || 'Failed to execute action');
    }
  };

  const handleExport = async (format = 'json') => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/copy-trading/export/traders?format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === 'csv' ? 'blob' : 'json'
        }
      );

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `traders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `traders_export_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  const filteredTraders = traders.filter(trader => {
    if (filters.search && !trader.username.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && trader.isActive !== (filters.status === 'active')) {
      return false;
    }
    if (filters.verification !== 'all') {
      if (filters.verification === 'verified' && !trader.verified) return false;
      if (filters.verification === 'unverified' && trader.verified) return false;
      if (filters.verification !== 'verified' && filters.verification !== 'unverified' && 
          trader.verificationLevel !== filters.verification) return false;
    }
    return true;
  });

  // Calculate trader stats
  const traderStats = {
    totalCopiers: traders.reduce((sum, trader) => sum + (trader.socialStats?.activeCopiers || 0), 0),
    totalProfit: traders.reduce((sum, trader) => sum + (trader.performance?.netProfit || 0), 0),
    averageWinRate: traders.length > 0 
      ? traders.reduce((sum, trader) => sum + (trader.performance?.winRate || 0), 0) / traders.length 
      : 0,
    activeTraders: traders.filter(t => t.isActive).length
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Copy Trading Management</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Trading</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Copy Trading</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Traders</p>
              <h3 className="text-white text-2xl font-bold mt-1">{platformStats.totalTraders}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Active: {traderStats.activeTraders}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Active Copies</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {platformStats.activeCopies}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Copy className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Total Copiers: {traderStats.totalCopiers}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Copied Amount</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${platformStats.totalCopiedAmount?.toLocaleString() || '0'}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Platform volume
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Avg. Win Rate</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {traderStats.averageWinRate.toFixed(1)}%
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Performance
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Traders</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {pagination.total} traders
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search traders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            
            {/* Filter dropdown */}
            <div className="relative">
              <button 
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
                onClick={() => handleFilterChange('status', filters.status === 'all' ? 'active' : filters.status === 'active' ? 'inactive' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filters.status === 'all' ? 'All Status' : filters.status}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
            
            {/* Verification filter */}
            <select
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.verification}
              onChange={(e) => handleFilterChange('verification', e.target.value)}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="pro">Pro</option>
              <option value="advanced">Advanced</option>
              <option value="basic">Basic</option>
            </select>
            
            {/* Refresh button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={fetchTraders}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            {/* Add Trader button (if needed) */}
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm shadow-lg"
              onClick={() => setShowAddTraderModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Trader
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">Trader</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Performance</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Copiers</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading traders...</div>
              </div>
            ) : filteredTraders.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No traders found</h3>
                <p className="text-[#A5AFC4] mb-4">Adjust your filters or add a new trader</p>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                  onClick={() => handleFilterChange('status', 'all')}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTraders.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit).map((trader) => (
                  <div key={trader.traderId} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start space-x-2">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={trader.avatar || `https://ui-avatars.com/api/?name=${trader.username}&background=random`}
                            alt={trader.username}
                          />
                          <div>
                            <h3 className="font-medium text-white">{trader.username}</h3>
                            <p className="text-xs text-[#A5AFC4]">{trader.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={trader.isActive ? 'active' : 'inactive'} />
                          <VerificationBadge verified={trader.verified} level={trader.verificationLevel} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <div className="text-[#A5AFC4]">Profit:</div>
                          <div className={`font-medium ${trader.performance?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${trader.performance?.netProfit?.toLocaleString() || '0'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Win Rate:</div>
                          <div className="text-white font-medium">{trader.performance?.winRate?.toFixed(1) || '0'}%</div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Copiers:</div>
                          <div className="text-white font-medium">{trader.socialStats?.activeCopiers || 0} active</div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Total Trades:</div>
                          <div className="text-white font-medium">{trader.performance?.totalTrades || 0}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4]">
                          Joined: {new Date(trader.joinedDate).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewTrader(trader.traderId)}
                            className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenAction('toggleStatus', trader)}
                            className="p-2 rounded-full hover:bg-yellow-500/20 text-yellow-400"
                            title={trader.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {trader.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={() => handleOpenAction('updateVerification', trader)}
                            className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400"
                            title="Update Verification"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
<button 
  onClick={() => navigate(`/copy-trading/trader/${trader.traderId}/trades`)}
  className="text-green-400 hover:text-green-300 p-2 rounded hover:bg-green-500/20"
  title="Manage Trades"
>
  <BarChart className="h-4 w-4" />
</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* Trader Info */}
                      <div className="col-span-3 flex items-center">
                        <img
                          className="h-10 w-10 rounded-full mr-3"
                          src={trader.avatar || `https://ui-avatars.com/api/?name=${trader.username}&background=random`}
                          alt={trader.username}
                        />
                        <div>
                          <span className="text-white font-medium block">{trader.username}</span>
                          <span className="text-xs text-[#A5AFC4] truncate max-w-xs">{trader.email}</span>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="col-span-2">
                        <div className={`text-lg font-bold ${trader.performance?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${trader.performance?.netProfit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                        </div>
                        <div className="text-sm text-[#A5AFC4]">
                          {trader.performance?.winRate?.toFixed(1) || '0'}% Win Rate
                        </div>
                      </div>

                      {/* Copiers */}
                      <div className="col-span-2">
                        <div className="text-white font-medium text-lg">
                          {trader.socialStats?.activeCopiers || 0}
                        </div>
                        <div className="text-sm text-[#A5AFC4]">
                          {trader.socialStats?.totalCopiers || 0} total
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex flex-col gap-1">
                        <StatusBadge status={trader.isActive ? 'active' : 'inactive'} />
                        <VerificationBadge verified={trader.verified} level={trader.verificationLevel} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewTrader(trader.traderId)}
                          className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenAction('toggleStatus', trader)}
                          className="text-yellow-400 hover:text-yellow-300 p-2 rounded hover:bg-yellow-500/20"
                          title={trader.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {trader.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleOpenAction('updateVerification', trader)}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-500/20"
                          title="Update Verification"
                        >
                          <Shield className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenAction('delete', trader)}
                          className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-500/20"
                          title="Delete Trader"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-[#303943]">
                <div className="text-sm text-[#A5AFC4]">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, filteredTraders.length)} of {filteredTraders.length} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 bg-[#303943] text-[#A5AFC4] rounded hover:bg-[#3A434D] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
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
                        className={`px-3 py-1 rounded ${
                          pagination.page === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#303943] text-[#A5AFC4] hover:bg-[#3A434D]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 bg-[#303943] text-[#A5AFC4] rounded hover:bg-[#3A434D] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Trader Modal */}
{showAddTraderModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
      <div className="p-4 border-b border-[#303943] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Add New Trader</h3>
        <button 
          onClick={() => setShowAddTraderModal(false)}
          className="text-[#A5AFC4] hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">Username *</label>
          <input
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={newTrader.username}
            onChange={(e) => setNewTrader({...newTrader, username: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">Email *</label>
          <input
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={newTrader.email}
            onChange={(e) => setNewTrader({...newTrader, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">Full Name</label>
          <input
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={newTrader.fullName}
            onChange={(e) => setNewTrader({...newTrader, fullName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">Country</label>
          <input
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={newTrader.country}
            onChange={(e) => setNewTrader({...newTrader, country: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-[#A5AFC4] mb-1">Trading Style</label>
            <select
              className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
              value={newTrader.tradingStyle}
              onChange={(e) => setNewTrader({...newTrader, tradingStyle: e.target.value})}
            >
              <option value="day">Day Trading</option>
              <option value="swing">Swing Trading</option>
              <option value="scalp">Scalping</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#A5AFC4] mb-1">Risk Level</label>
            <select
              className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
              value={newTrader.riskLevel}
              onChange={(e) => setNewTrader({...newTrader, riskLevel: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
        <button 
          onClick={() => setShowAddTraderModal(false)}
          className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg"
        >
          Cancel
        </button>
        <button 
          onClick={handleCreateTrader}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Create Trader
        </button>
      </div>
    </div>
  </div>
)}


      {/* Trader Details Modal */}
      {showTraderModal && selectedTrader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#303943] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {selectedTrader.trader?.username} - Trader Details
              </h3>
              <button 
                onClick={() => setShowTraderModal(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Basic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Email:</span>
                      <p className="text-sm text-white">{selectedTrader.trader?.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Country:</span>
                      <p className="text-sm text-white">{selectedTrader.trader?.country || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Experience:</span>
                      <p className="text-sm text-white capitalize">{selectedTrader.trader?.tradingExperience}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Joined:</span>
                      <p className="text-sm text-white">
                        {new Date(selectedTrader.trader?.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Performance Stats</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Net Profit:</span>
                      <p className={`text-sm font-medium ${selectedTrader.trader?.performance?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${selectedTrader.trader?.performance?.netProfit?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Win Rate:</span>
                      <p className="text-sm text-white">{selectedTrader.trader?.performance?.winRate?.toFixed(1) || '0'}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Total Trades:</span>
                      <p className="text-sm text-white">{selectedTrader.trader?.performance?.totalTrades || 0}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Active Copiers:</span>
                      <p className="text-sm text-white">{selectedTrader.trader?.socialStats?.activeCopiers || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedTrader.recentCopies && selectedTrader.recentCopies.length > 0 && (
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Recent Copy Trades</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#404A56]">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-[#A5AFC4]">User</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-[#A5AFC4]">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-[#A5AFC4]">Profit</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-[#A5AFC4]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#404A56]">
                        {selectedTrader.recentCopies.slice(0, 5).map((copy) => (
                          <tr key={copy.id}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                              {copy.user?.email || 'N/A'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                              ${copy.amount?.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <span className={copy.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                ${copy.netProfit?.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                copy.status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                                copy.status === 'paused' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                                'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                              }`}>
                                {copy.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
              <button 
                onClick={() => setShowTraderModal(false)}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (selectedTrader.trader?.traderId) {
                    handleOpenAction('toggleStatus', selectedTrader.trader);
                    setShowTraderModal(false);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Manage Trader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#303943]">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'toggleStatus' && `${actionData.currentStatus ? 'Deactivate' : 'Activate'} Trader`}
                {actionType === 'updateVerification' && 'Update Verification'}
                {actionType === 'delete' && 'Delete Trader'}
              </h3>
            </div>
            <div className="p-4">
              <p className="text-[#A5AFC4] mb-4">
                {actionType === 'toggleStatus' && 
                  `Are you sure you want to ${actionData.currentStatus ? 'deactivate' : 'activate'} ${actionData.traderName}?`}
                {actionType === 'updateVerification' && 
                  `Update verification level for ${actionData.traderName}`}
                {actionType === 'delete' && 
                  `This will permanently remove ${actionData.traderName} from the platform. All active copy trades will be stopped.`}
              </p>
              
              {actionType === 'updateVerification' && (
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Verification Level</label>
                    <select
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={actionData.verificationLevel || actionData.currentVerificationLevel || 'basic'}
                      onChange={(e) => setActionData({...actionData, verificationLevel: e.target.value})}
                    >
                      <option value="basic">Basic</option>
                      <option value="advanced">Advanced</option>
                      <option value="pro">Pro</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      checked={actionData.verified !== undefined ? actionData.verified : actionData.currentVerified}
                      onChange={(e) => setActionData({...actionData, verified: e.target.checked})}
                    />
                    <span className="ml-2 text-sm text-white">Verified</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Reason (optional)</label>
                <textarea
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="2"
                  placeholder="Enter reason for this action..."
                  value={actionData.reason || ''}
                  onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
              <button 
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-white rounded-lg ${
                  actionType === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                onClick={handleExecuteAction}
              >
                {actionType === 'delete' ? 'Delete Trader' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}