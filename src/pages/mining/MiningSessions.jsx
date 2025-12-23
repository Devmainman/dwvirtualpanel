// pages/mining/MiningSessions.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Search, MoreHorizontal,
  AlertCircle, Play, StopCircle, Clock, Calendar, Download,
  ChevronDown, Trash2, Eye, ChevronUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningSessions, deleteMiningSession } from '../../api/adminMiningApi';

export default function MiningSessions() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningSessions(token);
      setSessions(response.sessions || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-900/30 text-green-400 border border-green-500/30',
      completed: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
      stopped: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      failed: 'bg-red-900/30 text-red-400 border border-red-500/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    
    try {
      await deleteMiningSession(token, sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.pool?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || session.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Sessions</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Sessions</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Active Sessions</p>
              <h3 className="text-white text-2xl font-bold mt-1 text-green-400">
                {sessions.filter(s => s.status === 'active').length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Live mining
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Sessions</p>
              <h3 className="text-white text-2xl font-bold mt-1">{sessions.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              All time
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Earnings</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${sessions.reduce((sum, s) => sum + (s.earnings || 0), 0).toFixed(2)}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <StopCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              <span className="text-green-300">↑ 5.2%</span> this week
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
                placeholder="Search sessions or users..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="stopped">Stopped</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button 
              onClick={fetchSessions}
              disabled={isLoading}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Mining Sessions</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {sessions.length} sessions
            </span>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">User</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Pool</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Hash Rate</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Duration</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Earnings</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading mining sessions...</div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No mining sessions found</h3>
                <p className="text-[#A5AFC4]">No sessions match your search criteria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <div key={session.id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h3 className="font-medium text-white">{session.user?.name}</h3>
                        </div>
                        <StatusBadge status={session.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-[#A5AFC4]">Pool:</div>
                        <div className="text-white font-medium">{session.pool}</div>
                        
                        <div className="text-[#A5AFC4]">Hash Rate:</div>
                        <div className="text-white font-medium">{session.hashRate} TH/s</div>
                        
                        <div className="text-[#A5AFC4]">Duration:</div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-[#A5AFC4]" />
                          <span className="text-white font-medium">{formatDuration(session.duration)}</span>
                        </div>
                        
                        <div className="text-[#A5AFC4]">Earnings:</div>
                        <div className="text-white font-medium text-green-400">
                          ${session.earnings?.toFixed(6) || '0.000000'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="flex items-center text-xs text-[#A5AFC4]">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(session.startedAt)}
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(session.id)}
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
                          <span className="text-white font-medium block">{session.user?.name}</span>
                          <span className="text-xs text-[#A5AFC4]">{session.user?.email}</span>
                        </div>
                      </div>

                      {/* Pool */}
                      <div className="col-span-2 text-[#A5AFC4]">{session.pool}</div>

                      {/* Hash Rate */}
                      <div className="col-span-1">
                        <span className="font-semibold text-white">{session.hashRate} TH/s</span>
                      </div>

                      {/* Duration */}
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-[#A5AFC4]" />
                          <span className="text-white">{formatDuration(session.duration)}</span>
                        </div>
                      </div>

                      {/* Earnings */}
                      <div className="col-span-1">
                        <span className="font-semibold text-green-400">
                          ${session.earnings?.toFixed(6) || '0.000000'}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status={session.status} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        <button className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(session.id)}
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