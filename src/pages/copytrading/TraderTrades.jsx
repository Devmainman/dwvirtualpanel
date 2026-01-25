// pages/copytrading/TraderTrades.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Search, Filter, Download, Upload, Plus,
  Edit2, Trash2, Eye, Copy, CheckCircle,
  XCircle, TrendingUp, TrendingDown, Clock,
  BarChart, DollarSign, ChevronLeft, RefreshCw,
  AlertCircle, Save, X, ChevronDown, MoreVertical
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

const StatusBadge = ({ status }) => {
  const config = {
    open: { color: 'bg-blue-900/30 text-blue-400 border-blue-500/30', icon: <Clock className="h-3 w-3 mr-1" /> },
    closed: { color: 'bg-green-900/30 text-green-400 border-green-500/30', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    cancelled: { color: 'bg-red-900/30 text-red-400 border-red-500/30', icon: <XCircle className="h-3 w-3 mr-1" /> }
  };

  const { color, icon } = config[status] || config.open;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} border`}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
      <TrendingUp className="h-3 w-3 mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 mr-1" />
    )}
    ${Math.abs(profit).toFixed(2)}
  </span>
);

export default function TraderTrades() {
  const { traderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [trader, setTrader] = useState(null);
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    openTrades: 0,
    closedTrades: 0,
    totalProfit: 0,
    winRate: 0,
    activeCopyTrades: 0,
    totalCopiedTrades: 0
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    symbol: '',
    startDate: '',
    endDate: ''
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  

  console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('window._env_?.VITE_API_BASE_URL:', window._env_?.VITE_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

  // New trade form
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    side: 'buy',
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    profitLoss: '',
    profitPercentage: '',
    status: 'open',
    openedAt: new Date().toISOString().split('T')[0],
    closedAt: '',
    closedReason: '',
    notes: ''
  });
  
  // Bulk import
  const [bulkData, setBulkData] = useState('');
  
  useEffect(() => {
    if (traderId) {
      fetchTraderTrades();
    }
  }, [traderId, filters]);
  
  const fetchTraderTrades = async () => {
    try {
    setLoading(true);
    const queryParams = new URLSearchParams();
    if (filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.symbol) queryParams.append('symbol', filters.symbol);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    // Correct endpoint:
    const response = await axios.get(
      `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/trades?${queryParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
      
      if (response.data.success) {
        setTrader(response.data.trader);
        setTrades(response.data.trades || []);
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching trader trades:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch trader trades');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddTrade = async () => {
    try {
      setActionLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/trades`,
        newTrade,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Trade added successfully');
        setShowAddModal(false);
        resetNewTradeForm();
        fetchTraderTrades();
      }
    } catch (error) {
      console.error('Error adding trade:', error);
      toast.error(error.response?.data?.error || 'Failed to add trade');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleUpdateTrade = async () => {
    try {
      setActionLoading(true);
      
      const response = await axios.put(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/trades/${selectedTrade.tradeId}`,
        newTrade,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Trade updated successfully');
        setShowEditModal(false);
        resetNewTradeForm();
        fetchTraderTrades();
      }
    } catch (error) {
      console.error('Error updating trade:', error);
      toast.error(error.response?.data?.error || 'Failed to update trade');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleDeleteTrade = async (tradeId) => {
    if (!window.confirm('Are you sure you want to delete this trade? This will also delete all copied versions.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const response = await axios.delete(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/trades/${tradeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Trade deleted successfully');
        fetchTraderTrades();
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
      toast.error(error.response?.data?.error || 'Failed to delete trade');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleBulkImport = async () => {
    try {
      setActionLoading(true);
      
      // Parse CSV/JSON data
      let tradesArray = [];
      
      if (bulkData.trim().startsWith('[')) {
        // JSON format
        tradesArray = JSON.parse(bulkData);
      } else {
        // CSV format
        const lines = bulkData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        tradesArray = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const trade = {};
          headers.forEach((header, index) => {
            trade[header] = values[index] || '';
          });
          return trade;
        });
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/admin/copy-trading/traders/${traderId}/trades/bulk`,
        { trades: tradesArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success(`Added ${response.data.addedCount} trades successfully`);
        setShowBulkModal(false);
        setBulkData('');
        fetchTraderTrades();
      }
    } catch (error) {
      console.error('Error bulk importing:', error);
      toast.error(error.response?.data?.error || 'Failed to import trades');
    } finally {
      setActionLoading(false);
    }
  };
  
  const resetNewTradeForm = () => {
    setNewTrade({
      symbol: '',
      side: 'buy',
      quantity: '',
      entryPrice: '',
      exitPrice: '',
      profitLoss: '',
      profitPercentage: '',
      status: 'open',
      openedAt: new Date().toISOString().split('T')[0],
      closedAt: '',
      closedReason: '',
      notes: ''
    });
  };
  
  const openEditModal = (trade) => {
    setSelectedTrade(trade);
    setNewTrade({
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice || '',
      profitLoss: trade.profitLoss || '',
      profitPercentage: trade.profitPercentage || '',
      status: trade.status,
      openedAt: trade.openedAt ? new Date(trade.openedAt).toISOString().split('T')[0] : '',
      closedAt: trade.closedAt ? new Date(trade.closedAt).toISOString().split('T')[0] : '',
      closedReason: trade.closedReason || '',
      notes: trade.notes || ''
    });
    setShowEditModal(true);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-[#1E232A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/copy-trading')}
            className="p-2 rounded-lg bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              {trader?.username || 'Trader'} - Trades Management
            </h1>
            <p className="text-sm text-[#A5AFC4] mt-1">
              Trader ID: {traderId} | {trader?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchTraderTrades}
            className="p-2 rounded-lg bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4]"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/copy-trading/copied-trades?traderId=${traderId}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center text-sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Copied Trades
          </button>
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
                <span className="text-blue-400 mr-2">↑ {stats.openTrades} Open</span>
                <span className="text-gray-400">{stats.closedTrades} Closed</span>
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
              <p className="text-green-100 text-sm">Total Profit</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalProfit?.toFixed(2) || '0.00'}
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
              <p className="text-blue-100 text-sm">Active Copiers</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {stats.activeCopyTrades || 0}
              </h3>
              <div className="text-xs text-gray-300 mt-2">
                Copying this trader
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
              <p className="text-yellow-100 text-sm">Copied Trades</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {stats.totalCopiedTrades || 0}
              </h3>
              <div className="text-xs text-gray-300 mt-2">
                Total copies created
              </div>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Trader Trades</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {trades.length} trades
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Filters */}
            <div className="flex gap-2">
              <select
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <input
                type="text"
                className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm w-32"
                placeholder="Symbol"
                value={filters.symbol}
                onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Trade
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {trades.length === 0 ? (
            <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No trades found</h3>
              <p className="text-[#A5AFC4] mb-4">This trader has no trades yet. Add the first one!</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
              >
                Add First Trade
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#303943]">
                <thead className="bg-[#303943]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Trade Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Timeline
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#282F36] divide-y divide-[#303943]">
                  {trades.map((trade) => (
                    <tr key={trade.tradeId} className="hover:bg-[#303943]">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{trade.symbol}</div>
                          <div className="text-xs text-[#A5AFC4]">ID: {trade.tradeId.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          <span className="capitalize">{trade.side}</span> {trade.quantity} @ ${trade.entryPrice}
                        </div>
                        {trade.exitPrice && (
                          <div className="text-xs text-[#A5AFC4]">
                            Exit: ${trade.exitPrice}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {trade.profitLoss !== undefined && (
                          <ProfitBadge profit={trade.profitLoss} />
                        )}
                        {trade.profitPercentage !== undefined && (
                          <div className={`text-xs mt-1 ${trade.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.profitPercentage >= 0 ? '+' : ''}{trade.profitPercentage?.toFixed(2)}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trade.status} />
                        {trade.closedReason && (
                          <div className="text-xs text-[#A5AFC4] mt-1">
                            {trade.closedReason.replace('_', ' ')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">
                          {formatDate(trade.openedAt)}
                        </div>
                        {trade.closedAt && (
                          <div className="text-xs text-[#A5AFC4]">
                            Closed: {formatDate(trade.closedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(trade)}
                            className="p-2 rounded hover:bg-blue-500/20 text-blue-400"
                            title="Edit Trade"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade.tradeId)}
                            className="p-2 rounded hover:bg-red-500/20 text-red-400"
                            title="Delete Trade"
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Trade Modal */}
      {showAddModal && (
        <TradeModal
          title="Add New Trade"
          trade={newTrade}
          setTrade={setNewTrade}
          onSave={handleAddTrade}
          onClose={() => {
            setShowAddModal(false);
            resetNewTradeForm();
          }}
          loading={actionLoading}
        />
      )}
      
      {/* Edit Trade Modal */}
      {showEditModal && selectedTrade && (
        <TradeModal
          title="Edit Trade"
          trade={newTrade}
          setTrade={setNewTrade}
          onSave={handleUpdateTrade}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTrade(null);
            resetNewTradeForm();
          }}
          loading={actionLoading}
          isEdit={true}
        />
      )}
      
      {/* Bulk Import Modal */}
      {showBulkModal && (
        <BulkImportModal
          bulkData={bulkData}
          setBulkData={setBulkData}
          onSave={handleBulkImport}
          onClose={() => {
            setShowBulkModal(false);
            setBulkData('');
          }}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

// Trade Modal Component
const TradeModal = ({ title, trade, setTrade, onSave, onClose, loading, isEdit = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTrade(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCalculateProfit = () => {
    if (trade.entryPrice && trade.exitPrice && trade.quantity && trade.side) {
      const entry = parseFloat(trade.entryPrice);
      const exit = parseFloat(trade.exitPrice);
      const quantity = parseFloat(trade.quantity);
      
      let profitLoss = 0;
      if (trade.side === 'buy') {
        profitLoss = (exit - entry) * quantity;
      } else {
        profitLoss = (entry - exit) * quantity;
      }
      
      const profitPercentage = (profitLoss / (entry * quantity)) * 100;
      
      setTrade(prev => ({
        ...prev,
        profitLoss: profitLoss.toFixed(2),
        profitPercentage: profitPercentage.toFixed(2)
      }));
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#A5AFC4] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Symbol *</label>
                <input
                  type="text"
                  name="symbol"
                  value={trade.symbol}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                  placeholder="BTC/USD"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Side *</label>
                <select
                  name="side"
                  value={trade.side}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={trade.quantity}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                  placeholder="1.5"
                  step="0.00000001"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Entry Price *</label>
                <input
                  type="number"
                  name="entryPrice"
                  value={trade.entryPrice}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                  placeholder="45000"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            {/* Status & Performance */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Status *</label>
                <select
                  name="status"
                  value={trade.status}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {trade.status === 'closed' && (
                <>
                  <div>
                    <label className="block text-sm text-[#A5AFC4] mb-1">Exit Price</label>
                    <input
                      type="number"
                      name="exitPrice"
                      value={trade.exitPrice}
                      onChange={handleChange}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                      placeholder="46000"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-[#A5AFC4] mb-1">Close Reason</label>
                    <select
                      name="closedReason"
                      value={trade.closedReason}
                      onChange={handleChange}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">Select Reason</option>
                      <option value="take_profit">Take Profit</option>
                      <option value="stop_loss">Stop Loss</option>
                      <option value="manual">Manual Close</option>
                      <option value="trader_closed">Trader Closed</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm text-[#A5AFC4] mb-1">Profit/Loss</label>
                      <input
                        type="number"
                        name="profitLoss"
                        value={trade.profitLoss}
                        onChange={handleChange}
                        className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                        placeholder="100.50"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[#A5AFC4] mb-1">Profit %</label>
                      <input
                        type="number"
                        name="profitPercentage"
                        value={trade.profitPercentage}
                        onChange={handleChange}
                        className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                        placeholder="2.5"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCalculateProfit}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                  >
                    Calculate Profit
                  </button>
                  
                  <div>
                    <label className="block text-sm text-[#A5AFC4] mb-1">Closed At</label>
                    <input
                      type="date"
                      name="closedAt"
                      value={trade.closedAt}
                      onChange={handleChange}
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm text-[#A5AFC4] mb-1">Opened At</label>
                <input
                  type="date"
                  name="openedAt"
                  value={trade.openedAt}
                  onChange={handleChange}
                  className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm text-[#A5AFC4] mb-1">Notes</label>
            <textarea
              name="notes"
              value={trade.notes}
              onChange={handleChange}
              rows="3"
              className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white"
              placeholder="Any additional notes about this trade..."
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading || !trade.symbol || !trade.quantity || !trade.entryPrice}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Trade' : 'Add Trade'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Import Modal
const BulkImportModal = ({ bulkData, setBulkData, onSave, onClose, loading }) => {
  const exampleCSV = `symbol,side,quantity,entryPrice,status,notes
BTC/USD,buy,1.5,45000,open,Long position on Bitcoin
ETH/USD,sell,10,3200,open,Short on Ethereum
SOL/USD,buy,50,120,open,Bullish on Solana`;

  const exampleJSON = `[
  {
    "symbol": "BTC/USD",
    "side": "buy",
    "quantity": 1.5,
    "entryPrice": 45000,
    "status": "open",
    "notes": "Long position on Bitcoin"
  },
  {
    "symbol": "ETH/USD",
    "side": "sell",
    "quantity": 10,
    "entryPrice": 3200,
    "status": "open",
    "notes": "Short on Ethereum"
  }
]`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Bulk Import Trades</h3>
          <button
            onClick={onClose}
            className="text-[#A5AFC4] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          <div className="mb-4">
            <p className="text-sm text-[#A5AFC4] mb-2">
              Paste trades in CSV or JSON format. Required fields: symbol, side, quantity, entryPrice
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">CSV Format Example:</h4>
                <pre className="bg-[#1E232A] p-3 rounded-lg text-xs text-[#A5AFC4] overflow-x-auto">
                  {exampleCSV}
                </pre>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">JSON Format Example:</h4>
                <pre className="bg-[#1E232A] p-3 rounded-lg text-xs text-[#A5AFC4] overflow-x-auto">
                  {exampleJSON}
                </pre>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[#A5AFC4] mb-2">Import Data:</label>
            <textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              rows="10"
              className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white font-mono text-sm"
              placeholder="Paste your CSV or JSON data here..."
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => setBulkData(exampleCSV)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load CSV Example
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading || !bulkData.trim()}
          >
            {loading ? 'Importing...' : 'Import Trades'}
          </button>
        </div>
      </div>
    </div>
  );
};