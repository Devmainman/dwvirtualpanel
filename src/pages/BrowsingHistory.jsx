import { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, ChevronUp, Search,
  RefreshCw, Globe, HardDrive, Smartphone, Monitor,
  Chrome, MapPin, Clock, Link, Eye, Scroll,
  MousePointerClick, Cookie, AlertCircle,
  User, Shield, Laptop, Tablet, Users, Calendar,
  BarChart3, ExternalLink, Hash
} from 'lucide-react';
import axios from 'axios';
import { getAdminApiBaseUrl } from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function BrowsingHistory() {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedSession, setExpandedSession] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const { token } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, [searchTerm, filterRole, sortBy, sortOrder, page]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      if (!token) {
        throw new Error('Authentication token required');
      }
      const adminBaseUrl = await getAdminApiBaseUrl(token);
      const response = await axios.get(`${adminBaseUrl}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          role: filterRole,
          sortBy,
          sortOrder,
          page,
          limit: 10
        }
      });
      
      // Transform the data to include calculated session duration
      const transformedSessions = response.data.data.map(session => ({
        ...session,
        date: new Date(session.date),
        updatedAt: new Date(session.updatedAt),
        visitedPages: session.visitedPages?.map(page => ({
          ...page,
          timestamp: new Date(page.timestamp)
        })) || [],
        // Add calculated fields for display
        pagesVisited: session.visitedPages?.length || 0,
        sessionDuration: calculateSessionDuration(session.visitedPages)
      }));
      
      setSessions(transformedSessions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch browsing sessions:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSessionDuration = (visitedPages) => {
    if (!visitedPages || visitedPages.length === 0) return '0m 0s';
    
    const firstVisit = new Date(visitedPages[0].timestamp);
    const lastVisit = new Date(visitedPages[visitedPages.length - 1].timestamp);
    const durationMs = lastVisit - firstVisit;
    
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-900/30 text-purple-400 border border-purple-500/30';
      case 'premium user': return 'bg-blue-900/30 text-blue-400 border border-blue-500/30';
      case 'guest': return 'bg-gray-900/30 text-gray-400 border border-gray-500/30';
      default: return 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/30';
    }
  };

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile') || device?.toLowerCase().includes('iphone')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (device?.toLowerCase().includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    } else if (device?.toLowerCase().includes('desktop') || device?.toLowerCase().includes('pc')) {
      return <Laptop className="h-4 w-4" />;
    }
    return <HardDrive className="h-4 w-4" />;
  };

  const getOSIcon = (os) => {
    if (os?.toLowerCase().includes('windows')) {
      return <Monitor className="h-4 w-4 text-blue-400" />;
    } else if (os?.toLowerCase().includes('mac') || os?.toLowerCase().includes('ios')) {
      return <Monitor className="h-4 w-4 text-gray-400" />;
    } else if (os?.toLowerCase().includes('android')) {
      return <Smartphone className="h-4 w-4 text-green-400" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getBrowserIcon = (browser) => {
    if (browser?.toLowerCase().includes('chrome')) {
      return <Chrome className="h-4 w-4 text-blue-500" />;
    } else if (browser?.toLowerCase().includes('firefox')) {
      return <Chrome className="h-4 w-4 text-orange-500" />;
    } else if (browser?.toLowerCase().includes('safari')) {
      return <Chrome className="h-4 w-4 text-blue-400" />;
    }
    return <Globe className="h-4 w-4" />;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const toggleSession = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      const adminBaseUrl = await getAdminApiBaseUrl(token);
      const response = await axios.get(`${adminBaseUrl}/history/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the session with detailed info
      setSessions(prev => prev.map(session => 
        session._id === sessionId ? { ...session, ...response.data.data } : session
      ));
    } catch (error) {
      console.error('Failed to fetch session details:', error);
    }
  };

  // Calculate stats
  const totalSessions = pagination.total;
  const totalPagesVisited = sessions.reduce((sum, session) => sum + (session.visitedPages?.length || 0), 0);
  const averagePagesPerSession = totalSessions > 0 ? (totalPagesVisited / totalSessions).toFixed(1) : 0;
  
  // Get unique visitors
  const uniqueVisitors = [...new Set(sessions.map(session => session.ip))].length;

  // Calculate average session duration
  const averageSessionDuration = sessions.length > 0 
    ? sessions.reduce((sum, session) => {
        if (!session.visitedPages || session.visitedPages.length === 0) return sum;
        const firstVisit = new Date(session.visitedPages[0].timestamp);
        const lastVisit = new Date(session.visitedPages[session.visitedPages.length - 1].timestamp);
        return sum + (lastVisit - firstVisit);
      }, 0) / sessions.length
    : 0;

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Browsing Sessions</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Analytics</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Browsing History</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Total Sessions</p>
              <h3 className="text-white text-xl font-bold mt-1">{totalSessions}</h3>
            </div>
            <div className="bg-[#303943] p-2 rounded-lg">
              <Users className="h-4 w-4 text-[#A5AFC4]" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#A5AFC4]">
            <Clock className="h-3 w-3 mr-1" />
            Updated just now
          </div>
        </div>
        
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Total Pages</p>
              <h3 className="text-white text-xl font-bold mt-1">{totalPagesVisited}</h3>
            </div>
            <div className="bg-indigo-900/30 p-2 rounded-lg">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-indigo-400">{averagePagesPerSession} avg per session</span>
          </div>
        </div>
        
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Unique Visitors</p>
              <h3 className="text-white text-xl font-bold mt-1">{uniqueVisitors}</h3>
            </div>
            <div className="bg-blue-900/30 p-2 rounded-lg">
              <Eye className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#A5AFC4]">
            <User className="h-3 w-3 mr-1" />
            Based on IP addresses
          </div>
        </div>
        
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Avg. Session</p>
              <h3 className="text-white text-xl font-bold mt-1">{formatDuration(averageSessionDuration)}</h3>
            </div>
            <div className="bg-green-900/30 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-green-400" />
            </div>
          </div>
          <div className="bg-[#303943] w-full h-1.5 rounded-full mt-3">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (averageSessionDuration / (1000 * 60 * 10)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 py-2 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#A5AFC4]" />
          </div>
          <input
            type="text"
            placeholder="Search sessions, IP, domain..."
            className="block w-full pl-10 pr-3 py-2 bg-[#282F36] border border-[#303943] rounded-lg text-sm text-[#A5AFC4] focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <div className="relative">
          <select
            className="bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm border border-[#303943]/50"
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="premium user">Premium User</option>
            <option value="guest">Guest</option>
            <option value="user">Regular User</option>
          </select>
        </div>
        <button
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${sortBy === 'date' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'}`}
          onClick={() => handleSort('date')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${sortBy === 'pages' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'}`}
          onClick={() => handleSort('pages')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Pages {sortBy === 'pages' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className="ml-auto bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm border border-[#303943]/50"
          onClick={fetchSessions}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          className="bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm border border-[#303943]/50 disabled:opacity-50"
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-[#A5AFC4] text-sm">
          Page {page} of {pagination.pages}
        </span>
        <button
          className="bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg text-sm border border-[#303943]/50 disabled:opacity-50"
          onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
          disabled={page === pagination.pages}
        >
          Next
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center bg-[#282F36] rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <div className="mt-4 text-[#A5AFC4]">Loading browsing sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-[#282F36] rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#303943] mb-4">
              <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No browsing sessions found</h3>
            <p className="text-[#A5AFC4] mb-4">Try changing your filter settings</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id || session.sessionId} className="bg-[#282F36] rounded-lg shadow-lg border border-[#303943]/50 overflow-hidden transition-all">
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:hidden flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-indigo-400" />
                      <span className="font-medium text-white text-sm truncate">
                        Session: {session.sessionId?.slice(-8)}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(session.userRole)}`}>
                      {session.userRole}
                    </span>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">Session ID</div>
                    <div className="text-white font-mono text-sm truncate" title={session.sessionId}>
                      {session.sessionId?.slice(-8)}...
                    </div>
                  </div>
                  
                  <div className="hidden md:block md:col-span-1">
                    <div className="text-xs text-[#6B7280]">IP</div>
                    <div className="text-[#A5AFC4] font-mono text-sm">{session.ip}</div>
                  </div>
                  
                  <div className="hidden md:block md:col-span-2">
                    <div className="text-xs text-[#6B7280]">User Role</div>
                    <span className={`inline-flex items-center px-2 text-xs font-medium ${getRoleColor(session.userRole)}`}>
                      {session.userRole}
                    </span>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">Started</div>
                    <div className="text-[#A5AFC4] text-sm">
                      {formatDate(session.date)}
                      <div className="text-xs">{formatTime(session.date)}</div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">Pages & Duration</div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="text-white">
                        <span className="text-indigo-400">{session.pagesVisited || 0}</span> pages
                      </div>
                      <div className="text-[#A5AFC4]">
                        {session.sessionDuration || '0m 0s'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block md:col-span-1">
                    <div className="text-xs text-[#6B7280]">Device</div>
                    <div className="flex items-center text-[#A5AFC4] text-sm">
                      {getDeviceIcon(session.basicInfo?.device)}
                      <span className="ml-1 truncate">{session.basicInfo?.device?.split(' ')[0] || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-end">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSession(session._id || session.sessionId)}
                        className="p-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A444F] hover:text-white"
                      >
                        {expandedSession === (session._id || session.sessionId) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedSession === (session._id || session.sessionId) && (
                  <div className="mt-6 pt-4 border-t border-[#303943]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-[#303943] rounded-md p-4">
                        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Session Information
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Session ID:</span>
                            <code className="text-white bg-[#3A444F] px-2 py-1 rounded text-xs">
                              {session.sessionId}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Started:</span>
                            <span className="text-white">
                              {session.date.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Last Active:</span>
                            <span className="text-white">
                              {session.updatedAt.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Device:</span>
                            <div className="flex items-center text-white">
                              {getDeviceIcon(session.basicInfo?.device)}
                              <span className="ml-2">{session.basicInfo?.device || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">OS:</span>
                            <div className="flex items-center text-white">
                              {getOSIcon(session.basicInfo?.os)}
                              <span className="ml-2">{session.basicInfo?.os || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Browser:</span>
                            <div className="flex items-center text-white">
                              {getBrowserIcon(session.basicInfo?.browser)}
                              <span className="ml-2">{session.basicInfo?.browser || 'Unknown'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Language:</span>
                            <span className="text-white">{session.basicInfo?.language || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#303943] rounded-lg p-4">
                        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Location Data
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Country:</span>
                            <span className="text-white">{session.location?.country || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">City:</span>
                            <span className="text-white">{session.location?.city || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Region:</span>
                            <span className="text-white">{session.location?.region || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Timezone:</span>
                            <span className="text-white">{session.location?.timezone || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">ISP:</span>
                            <span className="text-white">{session.location?.isp || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#303943] rounded-lg p-4">
                        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                          <Scroll className="h-4 w-4 mr-2" />
                          Pages Visited ({session.visitedPages?.length || 0})
                        </h4>
                        <div className="max-h-[12rem] overflow-y-auto border border-[#3A444F] rounded-md p-2">
                          {session.visitedPages?.length ? (
                            <div className="space-y-1">
                              {session.visitedPages.map((page, index) => (
                                <div 
                                  key={`${page.url}-${page.timestamp}`} 
                                  className="flex items-center justify-between text-xs p-2 hover:bg-[#3A444F]/50 rounded"
                                >
                                  <div className="flex items-center min-w-0">
                                    <div className="w-5 h-5 flex items-center justify-center bg-indigo-900/30 text-indigo-400 rounded-full mr-2 flex-shrink-0">
                                      {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-white truncate" title={page.url}>
                                        {page.url}
                                      </div>
                                      {page.title && (
                                        <div className="text-[#A5AFC4] text-xxs truncate" title={page.title}>
                                          {page.title}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <span className="text-[#6B7280] text-xxs">
                                      {formatTime(new Date(page.timestamp))}
                                    </span>
                                    <ExternalLink className="h-3 w-3 text-[#A5AFC4]" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-[#6B7280] text-xs py-2">No pages visited in this session</p>
                          )}
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