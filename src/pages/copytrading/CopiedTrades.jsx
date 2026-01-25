// pages/copytrading/CopiedTrades.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Download, RefreshCw, ChevronDown,
  Eye, TrendingUp, TrendingDown, DollarSign, BarChart,
  Users, Clock, Calendar, X, Copy, CheckCircle,
  XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  ChevronRight, ExternalLink, Activity, Target
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const StatusBadge = ({ status }) => {
  const config = {
    open: { color: 'bg-blue-900/30 text-blue-400 border-blue-500/30', icon: <Activity className="h-3 w-3 mr-1" /> },
    closed: { color: status === 'take_profit' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 
                       status === 'stop_loss' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                       'bg-gray-900/30 text-gray-400 border-gray-500/30', 
              icon: status === 'take_profit' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                     status === 'stop_loss' ? <XCircle className="h-3 w-3 mr-1" /> : 
                     <CheckCircle className="h-3 w-3 mr-1" /> }
  };

  const { color, icon } = config[status] || config.closed;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {icon}
      {status === 'open' ? 'Open' : 
       status === 'closed' ? 'Closed' :
       status === 'take_profit' ? 'Take Profit' :
       status === 'stop_loss' ? 'Stop Loss' :
       status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const ProfitBadge = ({ profit }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    profit >= 0 
      ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
      : 'bg-red-900/30 text-red-400 border border-red-500/30'
  }`}>
    {profit >= 0 ? (
      <ArrowUpRight className="h-3 w-3 mr-1" />
    ) : (
      <ArrowDownRight className="h-3 w-3 mr-1" />
    )}
    ${Math.abs(profit).toFixed(2)}
  </span>
);

export default function CopiedTrades() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [copiedTrades, setCopiedTrades] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
const [adjustTrade, setAdjustTrade] = useState(null);
const [adjustAmount, setAdjustAmount] = useState('');
const [adjustReason, setAdjustReason] = useState('');
const [adjustLoading, setAdjustLoading] = useState(false);

  
  const [stats, setStats] = useState({
    totalTrades: 0,
    openTrades: 0,
    closedTrades: 0,
    netProfit: 0,
    winRate: 0,
    totalVolume: 0,
    uniqueTraders: 0,
    uniqueUsers: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    traderId: '',
    userId: '',
    symbol: '',
    startDate: '',
    endDate: '',
    sortBy: 'openedAt',
    sortOrder: 'desc',
    minProfit: '',
    maxProfit: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCopiedTrades();
    fetchStats();
  }, [searchParams]);

  const fetchCopiedTrades = async () => {
    try {
      setLoading(true);
      const rawStatus = searchParams.get('status');

        const params = {
        page: searchParams.get('page') || 1,
        limit: searchParams.get('limit') || 20,
        ...(rawStatus && rawStatus !== 'all' ? { status: rawStatus } : {}),
        traderId: searchParams.get('traderId') || '',
        userId: searchParams.get('userId') || '',
        symbol: searchParams.get('symbol') || '',
        startDate: searchParams.get('startDate') || '',
        endDate: searchParams.get('endDate') || '',
        sortBy: searchParams.get('sortBy') || 'openedAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
        minProfit: searchParams.get('minProfit') || '',
        maxProfit: searchParams.get('maxProfit') || ''
        };

      const queryParams = new URLSearchParams(params);
      const response = await axios.get(
        `${API_BASE_URL}/copied-trades/admin/all?${queryParams}`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
        );

      if (response.data.success) {
        setCopiedTrades(response.data.trades || []);
        const backendPagination = response.data.pagination || {};

        setPagination({
        page: backendPagination.page || 1,
        limit: backendPagination.limit || 20,
        total: backendPagination.total || 0,
        totalPages: backendPagination.pages || 0
        });

      }
    } catch (error) {
      console.error('Error fetching copied trades:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch copied trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/copied-trades/admin/stats`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
        );

      if (response.data.success) {
        setStats(response.data.platformStats || {
          totalTrades: 0,
          openTrades: 0,
          closedTrades: 0,
          netProfit: 0,
          winRate: 0,
          totalVolume: 0,
          uniqueTraders: 0,
          uniqueUsers: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAdjustProfit = async () => {
  if (!adjustAmount || isNaN(adjustAmount)) {
    toast.error("Enter a valid amount");
    return;
  }

   if (adjustTrade.status === 'open') {
    toast.error("You can only adjust CLOSED trades");
    return;
  }

  try {
    setAdjustLoading(true);

    const response = await axios.post(
      `${API_BASE_URL}/copied-trades/admin/${adjustTrade._id}/adjust-profit`,
      {
        amount: Number(adjustAmount),
        reason: adjustReason
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.data.success) {
      toast.success(`Profit adjusted for ${response.data.affectedUsers} users`);
      setShowAdjustModal(false);
      setAdjustTrade(null);
      setAdjustAmount('');
      setAdjustReason('');
      fetchCopiedTrades();
      fetchStats();
    }
  } catch (error) {
    console.error("Adjust profit error:", error);
    toast.error(error.response?.data?.error || "Adjustment failed");
  } finally {
    setAdjustLoading(false);
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

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'search') {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    setSearchParams(params);
    setShowFilterModal(false);
    fetchCopiedTrades();
  };

  const handleClearFilters = () => {
    const newFilters = {
      search: '',
      status: 'all',
      traderId: '',
      userId: '',
      symbol: '',
      startDate: '',
      endDate: '',
      sortBy: 'openedAt',
      sortOrder: 'desc',
      minProfit: '',
      maxProfit: ''
    };
    setFilters(newFilters);
    setSearchParams(new URLSearchParams());
    fetchCopiedTrades();
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page }));
  };

  const handleViewTrade = async (tradeId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/copied-trades/admin/${tradeId}`, // or just /copied-trades/user/${tradeId} depending on your route
        {
            headers: { Authorization: `Bearer ${token}` }
        }
        );

      if (response.data.success) {
        setSelectedTrade(response.data.trade);
        setShowTradeModal(true);
      }
    } catch (error) {
      console.error('Error fetching trade details:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch trade details');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
     const response = await axios.get(
        `${API_BASE_URL}/copied-trades/admin/export?format=${format}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            responseType: format === 'csv' ? 'blob' : 'json'
        }
        );

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `copied_trades_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `copied_trades_${new Date().toISOString().split('T')[0]}.json`);
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

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    return `${Math.floor(minutes / 1440)}d ${Math.floor((minutes % 1440) / 60)}h`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">Copied Trades</h1>
          <p className="text-sm text-[#A5AFC4] mt-1">View all copy trading transactions and performance</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Copy Trading</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Copied Trades</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Trades</p>
              <h3 className="text-white text-2xl font-bold mt-1">{stats.totalTrades}</h3>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-green-400 mr-2">↑ {stats.openTrades} Open</span>
                <span className="text-gray-400">{stats.closedTrades} Closed</span>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Copy className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Net Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.netProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </h3>
              <div className="text-xs text-gray-300 mt-2">
                Win Rate: {stats.winRate?.toFixed(1) || '0'}%
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Volume</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${stats.totalVolume?.toLocaleString(undefined, { minimumFractionDigits: 0 }) || '0'}
              </h3>
              <div className="text-xs text-gray-300 mt-2">
                Average Trade
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Participants</p>
              <div className="flex items-center mt-2">
                <div className="mr-4">
                  <div className="text-white font-bold">{stats.uniqueTraders}</div>
                  <div className="text-xs text-gray-300">Traders</div>
                </div>
                <div>
                  <div className="text-white font-bold">{stats.uniqueUsers}</div>
                  <div className="text-xs text-gray-300">Users</div>
                </div>
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">All Copied Trades</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {pagination.total} trades
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by trader, user, symbol..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            
            {/* Filter button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filters.status !== 'all' || filters.traderId || filters.userId || filters.symbol || filters.startDate) && (
                <span className="ml-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>
            
            {/* Status filter */}
            <select
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="take_profit">Take Profit</option>
              <option value="stop_loss">Stop Loss</option>
            </select>
            
            {/* Sort order */}
            <select
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="openedAt">Date</option>
              <option value="profitLoss">Profit</option>
              <option value="profitPercentage">Profit %</option>
              <option value="quantity">Quantity</option>
            </select>
            
            {/* Order */}
            <select
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            
            {/* Clear filters */}
            {(filters.status !== 'all' || filters.search || filters.traderId || filters.userId || filters.symbol || filters.startDate) && (
              <button 
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
                onClick={handleClearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
            
            {/* Refresh */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={fetchCopiedTrades}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Table headers - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">Trade Info</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Participants</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Performance</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Status & Duration</div>
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading copied trades...</div>
              </div>
            ) : copiedTrades.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No copied trades found</h3>
                <p className="text-[#A5AFC4] mb-4">Adjust your filters or wait for new trades</p>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {copiedTrades.map((trade) => (
                  <div key={trade._id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="text-white font-medium">{trade.symbol}</span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm capitalize text-[#A5AFC4]">{trade.side}</span>
                          </div>
                          <div className="text-xs text-[#A5AFC4]">
                            {formatDate(trade.openedAt)}
                          </div>
                        </div>
                        <StatusBadge status={trade.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <div className="text-[#A5AFC4]">Trader:</div>
                          <div className="text-white font-medium truncate">{trade.traderUsername}</div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">User:</div>
                          <div className="text-white font-medium truncate">
                            {trade.userId?.username || trade.userId?.email || 'N/A'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Entry Price:</div>
                          <div className="text-white font-medium">${trade.entryPrice?.toFixed(4)}</div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Quantity:</div>
                          <div className="text-white font-medium">{trade.quantity?.toFixed(4)}</div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Profit/Loss:</div>
                          <div className={trade.profitLoss >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                            ${trade.profitLoss?.toFixed(2)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[#A5AFC4]">Duration:</div>
                          <div className="text-white font-medium">
                            {trade.durationMinutes ? formatDuration(trade.durationMinutes) : 'Open'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4]">
                          Trade ID: {trade.originalTradeId?.slice(0, 8)}...
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleViewTrade(trade._id)}
                            className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {trade.copyTradeId && (
                            <button 
                              onClick={() => window.open(`/copy-trading?traderId=${trade.traderId}`, '_blank')}
                              className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400"
                              title="View Copy Trade"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          <button
  onClick={() => {
    setAdjustTrade(trade);
    setAdjustAmount('');
    setAdjustReason('');
    setShowAdjustModal(true);
  }}
  className="p-2 rounded-full hover:bg-yellow-500/20 text-yellow-400"
  title="Adjust Profit"
>
  <Target className="h-4 w-4" />
</button>

                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* Trade Info */}
                      <div className="col-span-3">
                        <div className="flex items-center mb-1">
                          <span className="text-white font-medium">{trade.symbol}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm capitalize text-[#A5AFC4]">{trade.side}</span>
                        </div>
                        <div className="flex items-center text-sm text-[#A5AFC4]">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(trade.openedAt)}
                        </div>
                        {trade.closedAt && (
                          <div className="text-xs text-gray-500 mt-1">
                            Closed: {formatDate(trade.closedAt)}
                          </div>
                        )}
                      </div>

                      {/* Participants */}
                      <div className="col-span-2">
                        <div className="mb-2">
                          <div className="text-xs text-[#A5AFC4]">Trader</div>
                          <div className="text-white font-medium truncate">{trade.traderUsername}</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#A5AFC4]">User</div>
                          <div className="text-white font-medium truncate">
                            {trade.userId?.username || trade.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="col-span-2">
                        <div className="mb-2">
                          <div className="text-xs text-[#A5AFC4]">Entry Price</div>
                          <div className="text-white font-medium">${trade.entryPrice?.toFixed(4)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#A5AFC4]">Quantity</div>
                          <div className="text-white font-medium">{trade.quantity?.toFixed(4)}</div>
                        </div>
                      </div>

                      {/* Status & Duration */}
                      <div className="col-span-2">
                        <div className="mb-2">
                          <StatusBadge status={trade.status} />
                        </div>
                        <div>
                          <div className="text-xs text-[#A5AFC4]">Duration</div>
                          <div className="text-white font-medium">
                            {trade.durationMinutes ? formatDuration(trade.durationMinutes) : 'Open'}
                          </div>
                        </div>
                      </div>

                      {/* Profit/Loss */}
                      <div className="col-span-2">
                        <div className="mb-2">
                          <div className="text-xs text-[#A5AFC4]">Profit/Loss</div>
                          <div className={trade.profitLoss >= 0 ? 'text-green-400 font-medium text-lg' : 'text-red-400 font-medium text-lg'}>
                            ${trade.profitLoss?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-[#A5AFC4]">Profit %</div>
                          <div className={trade.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {trade.profitPercentage?.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                    <div className="col-span-1 flex justify-end space-x-2">
                    {/* View Trade */}
                    <button 
                        onClick={() => handleViewTrade(trade._id)}
                        className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20"
                        title="View Details"
                    >
                        <Eye className="h-4 w-4" />
                    </button>

                    {/* Adjust Profit (ADMIN) */}
                    <button
                        onClick={() => {
                        setAdjustTrade(trade);
                        setAdjustAmount('');
                        setAdjustReason('');
                        setShowAdjustModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 p-2 rounded hover:bg-yellow-500/20"
                        title="Adjust Profit (All Copiers)"
                    >
                        <Target className="h-4 w-4" />
                    </button>

                    {/* View Copy Trade */}
                    {trade.copyTradeId && (
                        <button 
                        onClick={() => window.open(`/copy-trading?traderId=${trade.traderId}`, '_blank')}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-500/20"
                        title="View Copy Trade"
                        >
                        <ExternalLink className="h-4 w-4" />
                        </button>
                    )}
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
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, copiedTrades.length)} of {copiedTrades.length} trades
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

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#303943] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Filter Copied Trades</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">Trader ID</label>
                  <input
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.traderId}
                    onChange={(e) => setFilters({...filters, traderId: e.target.value})}
                    placeholder="Enter trader ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">User ID</label>
                  <input
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.userId}
                    onChange={(e) => setFilters({...filters, userId: e.target.value})}
                    placeholder="Enter user ID"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Symbol</label>
                <input
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                  value={filters.symbol}
                  onChange={(e) => setFilters({...filters, symbol: e.target.value})}
                  placeholder="e.g., BTC/USD"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">Min Profit</label>
                  <input
                    type="number"
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.minProfit}
                    onChange={(e) => setFilters({...filters, minProfit: e.target.value})}
                    placeholder="Minimum profit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">Max Profit</label>
                  <input
                    type="number"
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.maxProfit}
                    onChange={(e) => setFilters({...filters, maxProfit: e.target.value})}
                    placeholder="Maximum profit"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#A5AFC4] mb-1">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
              <button 
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear All
              </button>
              <button 
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Details Modal */}
      {showTradeModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-[#303943] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Trade Details - {selectedTrade.symbol}
              </h3>
              <button 
                onClick={() => setShowTradeModal(false)}
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
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Trade Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Symbol:</span>
                      <p className="text-sm text-white font-medium">{selectedTrade.symbol}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Side:</span>
                      <p className="text-sm text-white capitalize">{selectedTrade.side}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Quantity:</span>
                      <p className="text-sm text-white">{selectedTrade.quantity?.toFixed(4)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Entry Price:</span>
                      <p className="text-sm text-white">${selectedTrade.entryPrice?.toFixed(4)}</p>
                    </div>
                    {selectedTrade.exitPrice && (
                      <div>
                        <span className="text-xs text-[#A5AFC4]">Exit Price:</span>
                        <p className="text-sm text-white">${selectedTrade.exitPrice?.toFixed(4)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Profit/Loss:</span>
                      <p className={`text-sm font-medium ${selectedTrade.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${selectedTrade.profitLoss?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Profit Percentage:</span>
                      <p className={`text-sm ${selectedTrade.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedTrade.profitPercentage?.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Status:</span>
                      <div className="mt-1">
                        <StatusBadge status={selectedTrade.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Duration:</span>
                      <p className="text-sm text-white">
                        {selectedTrade.durationMinutes ? formatDuration(selectedTrade.durationMinutes) : 'Open'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Participants</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Trader:</span>
                      <p className="text-sm text-white">{selectedTrade.traderUsername}</p>
                      <p className="text-xs text-gray-500">ID: {selectedTrade.traderId}</p>
                    </div>
                    <div>
                      <span className="text-xs text-[#A5AFC4]">User:</span>
                      <p className="text-sm text-white">
                        {selectedTrade.userId?.username || selectedTrade.userId?.email || 'N/A'}
                      </p>
                      {selectedTrade.userId?.email && (
                        <p className="text-xs text-gray-500">{selectedTrade.userId.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#A5AFC4]">Opened At:</span>
                      <p className="text-sm text-white">{formatDate(selectedTrade.openedAt)}</p>
                    </div>
                    {selectedTrade.closedAt && (
                      <div>
                        <span className="text-xs text-[#A5AFC4]">Closed At:</span>
                        <p className="text-sm text-white">{formatDate(selectedTrade.closedAt)}</p>
                      </div>
                    )}
                    {selectedTrade.closedReason && (
                      <div>
                        <span className="text-xs text-[#A5AFC4]">Close Reason:</span>
                        <p className="text-sm text-white capitalize">{selectedTrade.closedReason.replace('_', ' ')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedTrade.metadata && Object.keys(selectedTrade.metadata).length > 0 && (
                <div className="bg-[#303943] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-[#A5AFC4] mb-3">Metadata</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#404A56]">
                      <tbody className="divide-y divide-[#404A56]">
                        {Object.entries(selectedTrade.metadata).map(([key, value]) => (
                          <tr key={key}>
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-[#A5AFC4] capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}:
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                              {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
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
                onClick={() => setShowTradeModal(false)}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Close
              </button>
              {selectedTrade.copyTradeId && (
                <button 
                  onClick={() => {
                    window.open(`/copy-trading?traderId=${selectedTrade.traderId}`, '_blank');
                    setShowTradeModal(false);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  View Copy Trade
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {showAdjustModal && adjustTrade && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
      <div className="p-4 border-b border-[#303943] flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Adjust Profit – {adjustTrade.symbol}
        </h3>
        <button
          onClick={() => setShowAdjustModal(false)}
          className="text-[#A5AFC4] hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">
            Adjustment Amount (use + or -)
          </label>
          <input
            type="number"
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            placeholder="e.g. 50 or -25"
          />
        </div>

        <div>
          <label className="block text-sm text-[#A5AFC4] mb-1">
            Reason (optional)
          </label>
          <input
            className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
            placeholder="Admin correction, bonus, etc."
          />
        </div>
      </div>

      <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
        <button
          onClick={() => setShowAdjustModal(false)}
          className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
        >
          Cancel
        </button>

        <button
          onClick={handleAdjustProfit}
          disabled={adjustLoading}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
        >
          {adjustLoading ? "Applying..." : "Apply Adjustment"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}