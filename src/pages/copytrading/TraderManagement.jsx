import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Edit2,
  Trash2,
  Pause,
  Play,
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Copy,
  BarChart,
  Target,
  Activity,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Globe,
  Percent,
  Calendar,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download,
  X,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const TraderManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrader, setSelectedTrader] = useState(null);
  
  // Trade Management State
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [showUpdatePricesModal, setShowUpdatePricesModal] = useState(false);
  const [newTrade, setNewTrade] = useState({
    symbol: 'BTC/USDT',
    side: 'buy',
    quantity: 1,
    entryPrice: 45000
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    verification: 'all',
    sortBy: 'profit'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalTraders: 0,
    activeTraders: 0,
    verifiedTraders: 0,
    totalOpenTrades: 0
  });

  // Load all traders
  const fetchTraders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/copy-trading/traders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response?.data?.success) {
        setTraders(response.data.traders || []);
        
        // Calculate stats
        const tradersData = response.data.traders || [];
        const activeTraders = tradersData.filter(t => t.isActive).length;
        const verifiedTraders = tradersData.filter(t => t.verified).length;
        const totalOpenTrades = tradersData.reduce((sum, trader) => {
          return sum + (trader.openTrades?.filter(t => t.status === 'open').length || 0);
        }, 0);
        
        setStats({
          totalTraders: tradersData.length,
          activeTraders,
          verifiedTraders,
          totalOpenTrades
        });
      }
    } catch (error) {
      console.error('Error fetching traders:', error);
      toast.error('Failed to load traders');
    } finally {
      setLoading(false);
    }
  };

  // Add open trade to trader
  const handleAddTrade = async () => {
    if (!selectedTrader) {
      toast.error('Please select a trader first');
      return;
    }

    try {
      const response = await axios.post(
      `${API_BASE_URL}/admin/traders/add-trade`,
        {
          traderId: selectedTrader.traderId,
          tradeData: newTrade
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        toast.success('Trade added successfully');
        setShowAddTradeModal(false);
        setNewTrade({
          symbol: 'BTC/USDT',
          side: 'buy',
          quantity: 1,
          entryPrice: 45000
        });
        fetchTraders();
      } else {
        toast.error(response?.data?.error || 'Failed to add trade');
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error('Error adding trade');
    }
  };

  // Update all trader prices
  const handleUpdatePrices = async () => {
    try {
      const response = await axios.post(
      `${API_BASE_URL}/admin/traders/update-prices`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        toast.success(`Updated prices for ${response.data.updatedTraders} traders`);
        setShowUpdatePricesModal(false);
        fetchTraders();
      } else {
        toast.error(response?.data?.error || 'Failed to update prices');
      }
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error('Error updating prices');
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      setExporting(true);
      toast.info('Export feature coming soon');
      // Implement CSV export here
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // View trader details
  const viewTraderDetails = (trader) => {
    navigate(`/copy-trading/trader/${trader.traderId}/trades`);
  };

  // Edit trader profile
  const editTraderProfile = (trader) => {
    navigate(`/copy-trading/trader/${trader.traderId}/edit`);
  };

  // Filter traders
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
    }
    return true;
  });

  // Sort traders
  const sortedTraders = [...filteredTraders].sort((a, b) => {
    switch (filters.sortBy) {
      case 'profit':
        return (b.performance?.netProfit || 0) - (a.performance?.netProfit || 0);
      case 'copiers':
        return (b.socialStats?.activeCopiers || 0) - (a.socialStats?.activeCopiers || 0);
      case 'winrate':
        return (b.performance?.winRate || 0) - (a.performance?.winRate || 0);
      default:
        return 0;
    }
  });

  // Initialize
  useEffect(() => {
    fetchTraders();
    
    const interval = setInterval(fetchTraders, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A] h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">Trader Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage trader accounts and open trades</p>
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
          
          <button 
            onClick={() => setShowUpdatePricesModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm"
          >
            <RefreshCw size={16} className="mr-2" />
            Update Prices
          </button>
          
          <button 
            onClick={() => setShowAddTradeModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center text-sm"
          >
            <Plus size={16} className="mr-2" />
            Add Trade
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Traders</p>
              <h3 className="text-white text-2xl font-bold mt-1">{stats.totalTraders}</h3>
              <p className="text-green-400 text-xs mt-1">{stats.activeTraders} active</p>
            </div>
            <Users className="h-10 w-10 text-green-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#1E456E] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Open Trades</p>
              <h3 className="text-white text-2xl font-bold mt-1">{stats.totalOpenTrades}</h3>
              <p className="text-blue-400 text-xs mt-1">Across all traders</p>
            </div>
            <Target className="h-10 w-10 text-blue-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#694D8C] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Verified Traders</p>
              <h3 className="text-white text-2xl font-bold mt-1">{stats.verifiedTraders}</h3>
              <p className="text-purple-400 text-xs mt-1">{((stats.verifiedTraders / stats.totalTraders) * 100 || 0).toFixed(0)}% rate</p>
            </div>
            <Shield className="h-10 w-10 text-purple-400/50" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#2D6E46] rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Active Copiers</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {traders.reduce((sum, t) => sum + (t.socialStats?.activeCopiers || 0), 0)}
              </h3>
              <p className="text-green-400 text-xs mt-1">Copying traders</p>
            </div>
            <Copy className="h-10 w-10 text-green-400/50" />
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
                onChange={(e) => setFilters({...filters, search: e.target.value})}
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
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border-b border-[#303943] bg-[#303943]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
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
                  onChange={(e) => setFilters({...filters, verification: e.target.value})}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#303943] bg-[#303943]/20">
                <th className="text-left p-4 text-sm font-medium text-[#A5AFC4]">Trader</th>
                <th className="text-left p-4 text-sm font-medium text-[#A5AFC4]">Performance</th>
                <th className="text-left p-4 text-sm font-medium text-[#A5AFC4]">Open Trades</th>
                <th className="text-left p-4 text-sm font-medium text-[#A5AFC4]">Status</th>
                <th className="text-left p-4 text-sm font-medium text-[#A5AFC4]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-400 mt-2">Loading traders...</p>
                  </td>
                </tr>
              ) : sortedTraders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No traders found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                sortedTraders.map((trader) => (
                  <tr key={trader.traderId} className="border-b border-[#303943] hover:bg-[#303943]/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                          {trader.avatar ? (
                            <img 
                              src={trader.avatar.startsWith('http') ? trader.avatar : `${API_BASE_URL}${trader.avatar}`}
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
                            <span className="font-medium text-white">{trader.username}</span>
                            {trader.verified && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{trader.email}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Profit:</span>
                          <span className={`font-medium ${trader.performance?.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${trader.performance?.netProfit?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Win Rate:</span>
                          <span className="font-medium text-white">
                            {trader.performance?.winRate?.toFixed(1) || '0'}%
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">
                          {trader.openTrades?.filter(t => t.status === 'open').length || 0}
                        </span>
                        <span className="text-sm text-gray-400">open trades</span>
                      </div>
                      {trader.openTrades?.some(t => t.status === 'open') && (
                        <div className="text-xs text-gray-500 mt-1">
                          Latest: {trader.openTrades.find(t => t.status === 'open')?.symbol || 'N/A'}
                        </div>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${trader.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={trader.isActive ? 'text-green-400' : 'text-red-400'}>
                          {trader.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {trader.socialStats?.activeCopiers || 0} active copiers
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTrader(trader);
                            setShowAddTradeModal(true);
                          }}
                          className="p-2 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30"
                          title="Add Trade"
                        >
                          <Plus size={16} />
                        </button>
                        
                        <button
                          onClick={() => viewTraderDetails(trader)}
                          className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        <button
                          onClick={() => editTraderProfile(trader)}
                          className="p-2 bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30"
                          title="Edit Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddTradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282F36] rounded-xl border border-[#303943] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#303943]">
              <h3 className="text-xl font-semibold text-white">Add Open Trade</h3>
              <button 
                onClick={() => setShowAddTradeModal(false)}
                className="text-[#A5AFC4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {selectedTrader && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-[#1E232A] rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {selectedTrader.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedTrader.username}</p>
                    <p className="text-sm text-gray-400">{selectedTrader.fullName}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Symbol</label>
                  <input
                    type="text"
                    value={newTrade.symbol}
                    onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="BTC/USDT"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Side</label>
                  <select
                    value={newTrade.side}
                    onChange={(e) => setNewTrade({...newTrade, side: e.target.value})}
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.quantity}
                      onChange={(e) => setNewTrade({...newTrade, quantity: parseFloat(e.target.value)})}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Entry Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newTrade.entryPrice}
                      onChange={(e) => setNewTrade({...newTrade, entryPrice: parseFloat(e.target.value)})}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#303943]">
              <button 
                onClick={() => setShowAddTradeModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#A5AFC4] hover:text-white hover:bg-[#3A434D] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddTrade}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
              >
                Add Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Prices Modal */}
      {showUpdatePricesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#282F36] rounded-xl border border-[#303943] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#303943]">
              <h3 className="text-xl font-semibold text-white">Update Trade Prices</h3>
              <button 
                onClick={() => setShowUpdatePricesModal(false)}
                className="text-[#A5AFC4] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <AlertCircle className="h-6 w-6 mr-3 text-blue-400" />
                <p className="text-sm text-blue-200">
                  This will update all open trade prices with simulated market movement (±2%).
                </p>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Affects {stats.totalOpenTrades} open trades across {stats.activeTraders} active traders.
              </p>
              
              <div className="bg-[#1E232A] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Traders</p>
                    <p className="text-white font-medium">{stats.totalTraders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Active Traders</p>
                    <p className="text-green-400 font-medium">{stats.activeTraders}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Open Trades</p>
                    <p className="text-blue-400 font-medium">{stats.totalOpenTrades}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Verified</p>
                    <p className="text-purple-400 font-medium">{stats.verifiedTraders}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-6 border-t border-[#303943]">
              <button 
                onClick={() => setShowUpdatePricesModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#A5AFC4] hover:text-white hover:bg-[#3A434D] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePrices}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Update All Prices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderManagement;