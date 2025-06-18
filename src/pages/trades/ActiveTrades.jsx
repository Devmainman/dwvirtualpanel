import { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Play, Check, Trash2, Pause, 
  TrendingUp, AlertCircle, Filter, RefreshCw, 
  ChevronDown, Clock, MoreHorizontal, DollarSign, BarChart 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllTrades, updateTrade, getTradeStatistics } from '../../api/adminTradingApi';

export default function ActiveTrades() {
  const { token } = useAuth();
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetails, setShowDetails] = useState(null);
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    completedTrades: 0,
    totalProfit: 0
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [tradesRes, statsRes] = await Promise.all([
        getAllTrades(token, { status: filterStatus === 'all' ? undefined : filterStatus }),
        getTradeStatistics(token)
      ]);
      setTrades(tradesRes.trades);
      setStats(statsRes.statistics);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      let updates = {};
      switch(action) {
        case 'play': updates = { status: 'in-progress' }; break;
        case 'pause': updates = { status: 'paused' }; break;
        case 'complete': 
          updates = { 
            status: 'completed', 
            progress: 100,
            endDate: new Date().toISOString()
          }; 
          break;
        case 'delete':
          // Implement delete if needed
          return;
        default: return;
      }

      await updateTrade(token, id, updates);
      fetchData(); // Refresh data after update
    } catch (error) {
      console.error(`Failed to ${action} trade:`, error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'in-progress': return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      case 'paused': return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
      case 'completed': return 'bg-green-900/30 text-green-400 border border-green-500/30';
      case 'terminated': return 'bg-red-900/30 text-red-400 border border-red-500/30';
      default: return 'bg-gray-900/30 text-gray-400 border border-gray-500/30';
    }
  };

  const getProgressColor = (status) => {
    switch(status) {
      case 'in-progress': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'terminated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'in-progress': return <Play className="h-3 w-3 mr-1" />;
      case 'paused': return <Pause className="h-3 w-3 mr-1" />;
      case 'completed': return <Check className="h-3 w-3 mr-1" />;
      case 'terminated': return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const toggleSortOrder = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  const handleSort = (field) => {
    if (sortBy === field) toggleSortOrder();
    else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleDetails = (id) => setShowDetails(showDetails === id ? null : id);

  const filteredTrades = trades.filter(trade => 
    filterStatus === 'all' || trade.status === filterStatus
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') comparison = new Date(a.createdAt) - new Date(b.createdAt);
    else if (sortBy === 'amount') comparison = a.amount - b.amount;
    else if (sortBy === 'profit') comparison = (a.profit || 0) - (b.profit || 0);
    else if (sortBy === 'progress') comparison = (a.progress || 0) - (b.progress || 0);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Active Trades</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Trades</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Active</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Trades Card */}
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Total Trades</p>
              <h3 className="text-white text-xl font-bold mt-1">{stats.totalTrades}</h3>
            </div>
            <div className="bg-[#303943] p-2 rounded-lg">
              <BarChart className="h-4 w-4 text-[#A5AFC4]" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#A5AFC4]">
            <Clock className="h-3 w-3 mr-1" />
            Updated just now
          </div>
        </div>

        {/* Completed Trades Card */}
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Completed</p>
              <h3 className="text-white text-xl font-bold mt-1">{stats.completedTrades}</h3>
            </div>
            <div className="bg-green-900/30 p-2 rounded-lg">
              <Check className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-green-400">
              {stats.totalTrades > 0 ? Math.round((stats.completedTrades/stats.totalTrades)*100) : 0}%
            </span>
            <span className="text-[#A5AFC4] ml-1">of total</span>
          </div>
        </div>

        {/* Total Profit Card */}
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Total Profit</p>
              <h3 className="text-white text-xl font-bold mt-1">${stats.totalProfit.toFixed(2)}</h3>
            </div>
            <div className="bg-indigo-900/30 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-green-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12% from last week
          </div>
        </div>

        {/* Average Progress Card */}
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Avg. Progress</p>
              <h3 className="text-white text-xl font-bold mt-1">
                {trades.length > 0 ? 
                  Math.round(trades.reduce((sum, trade) => sum + (trade.progress || 0), 0) / trades.length) : 
                  0}%
              </h3>
            </div>
            <div className="bg-blue-900/30 p-2 rounded-lg">
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="bg-[#303943] w-full h-1.5 rounded-full mt-3">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ 
                width: `${trades.length > 0 ? 
                  Math.round(trades.reduce((sum, trade) => sum + (trade.progress || 0), 0) / trades.length) : 
                  0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Filter dropdown */}
        <div className="relative">
          <button 
            className="bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm border border-[#303943]/50"
            onClick={() => {
              const statuses = ['all', 'in-progress', 'paused', 'completed', 'terminated'];
              const currentIndex = statuses.indexOf(filterStatus);
              const nextIndex = (currentIndex + 1) % statuses.length;
              setFilterStatus(statuses[nextIndex]);
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterStatus === 'all' ? 'All Trades' : formatStatus(filterStatus)}
            <ChevronDown className="h-4 w-4 ml-2" />
          </button>
        </div>
        
        {/* Sort buttons */}
        <button 
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${
            sortBy === 'date' 
              ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' 
              : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'
          }`}
          onClick={() => handleSort('date')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        
        <button 
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${
            sortBy === 'amount' 
              ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' 
              : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'
          }`}
          onClick={() => handleSort('amount')}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        
        <button 
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${
            sortBy === 'profit' 
              ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' 
              : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'
          }`}
          onClick={() => handleSort('profit')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Profit {sortBy === 'profit' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        
        <button 
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${
            sortBy === 'progress' 
              ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' 
              : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'
          }`}
          onClick={() => handleSort('progress')}
        >
          <BarChart className="h-4 w-4 mr-2" />
          Progress {sortBy === 'progress' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        
        {/* Refresh button */}
        <button 
          className="ml-auto bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm border border-[#303943]/50"
          onClick={fetchData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Trade Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center bg-[#282F36] rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <div className="mt-4 text-[#A5AFC4]">Loading active trades...</div>
          </div>
        ) : sortedTrades.length === 0 ? (
          <div className="text-center py-12 bg-[#282F36] rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#303943] mb-4">
              <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No active trades found</h3>
            <p className="text-[#A5AFC4] mb-4">Try changing your filter settings</p>
          </div>
        ) : (
          sortedTrades.map((trade) => (
            <div key={trade._id} className="bg-[#282F36] rounded-lg shadow-lg border border-[#303943]/50 overflow-hidden transition-all">
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Mobile Trade Header */}
                  <div className="md:hidden flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getProgressColor(trade.status)}`}></div>
                      <span className="font-medium text-white">{trade.name}</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                      {getStatusIcon(trade.status)}
                      {formatStatus(trade.status)}
                    </span>
                  </div>
                  
                  {/* Trade Type - Hidden on mobile */}
                  <div className="hidden md:block md:col-span-2">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${getProgressColor(trade.status)} mr-2`}></div>
                      <div>
                        <div className="hidden md:block text-xs text-[#6B7280]">Trade Name</div>
                        <div className="text-white font-medium">{trade.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* User */}
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">User</div>
                    <div className="text-[#A5AFC4]">
                      {trade.userId?.firstName || 'Unknown'} {trade.userId?.lastName || 'User'}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">Date & Time</div>
                    <div className="text-[#A5AFC4]">
                      <span className="md:hidden">{formatDate(trade.createdAt)}</span>
                      <span className="hidden md:block">{formatDate(trade.createdAt)}</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="md:col-span-1">
                    <div className="text-xs text-[#6B7280]">Amount</div>
                    <div className="text-[#A5AFC4]">${trade.amount.toLocaleString()}</div>
                  </div>

                  {/* Profit */}
                  <div className="md:col-span-1">
                    <div className="text-xs text-[#6B7280]">Profit</div>
                    <div className={trade.profit > 0 ? "text-green-400" : "text-[#A5AFC4]"}>
                      {trade.profit > 0 ? '+' : ''}{trade.profit?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* Status - Hidden on mobile */}
                  <div className="hidden md:block md:col-span-1">
                    <div className="text-xs text-[#6B7280]">Status</div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                      {getStatusIcon(trade.status)}
                      {formatStatus(trade.status)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="md:col-span-6 lg:col-span-1">
                    <div className="text-xs text-[#6B7280] mb-1">Progress</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-[#303943] rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(trade.status)}`} 
                          style={{ width: `${trade.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white font-medium">{trade.progress || 0}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-6 lg:col-span-1 flex justify-end items-center space-x-1">
                    {trade.status === 'in-progress' && (
                      <button
                        onClick={() => handleAction(trade._id, 'pause')}
                        className="p-2 bg-yellow-900/30 text-yellow-400 rounded-lg hover:bg-yellow-900/50"
                        title="Pause"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    {trade.status === 'paused' && (
                      <button
                        onClick={() => handleAction(trade._id, 'play')}
                        className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50"
                        title="Resume"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {trade.status !== 'completed' && trade.status !== 'terminated' && (
                      <button
                        onClick={() => handleAction(trade._id, 'complete')}
                        className="p-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50"
                        title="Complete"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toggleDetails(trade._id)}
                      className="p-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A444F] hover:text-white"
                    >
                      {showDetails === trade._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {showDetails === trade._id && (
                  <div className="mt-4 pt-4 border-t border-[#303943]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trade Details */}
                      <div className="bg-[#303943] rounded-lg p-4">
                        <h4 className="text-white text-sm font-medium mb-3">Trade Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-[#A5AFC4]">Trade ID:</div>
                          <div className="text-white">{trade._id}</div>
                          
                          <div className="text-[#A5AFC4]">User ID:</div>
                          <div className="text-white">{trade.userId?._id || 'N/A'}</div>
                          
                          <div className="text-[#A5AFC4]">Start Date:</div>
                          <div className="text-white">{formatDate(trade.createdAt)}</div>
                          
                          {trade.endDate && (
                            <>
                              <div className="text-[#A5AFC4]">End Date:</div>
                              <div className="text-white">{formatDate(trade.endDate)}</div>
                            </>
                          )}
                          
                          <div className="text-[#A5AFC4]">Current ROI:</div>
                          <div className="text-white">
                            {trade.amount > 0 ? ((trade.profit / trade.amount) * 100).toFixed(2) : '0.00'}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChevronUp({ className }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}