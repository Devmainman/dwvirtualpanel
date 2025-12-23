import { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronDown, ChevronUp, Search,
  RefreshCw, Globe, HardDrive, Smartphone, Monitor,
  Chrome, MapPin, Clock, Link, Eye, Scroll,
  MousePointerClick, Cookie, AlertCircle,
  User, Shield, Laptop, Tablet
} from 'lucide-react';
import axios from 'axios';
import { getAdminApiBaseUrl } from '../api/config';
import { useAuth } from '../context/AuthContext';

export default function BrowsingHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const { token } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, [searchTerm, filterRole, sortBy, sortOrder, page]);

  const fetchHistory = async () => {
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
      setHistory(response.data.data.map(item => ({
        ...item,
        date: new Date(item.date),
        visitedPages: item.visitedPages.map(page => ({
          ...page,
          timestamp: new Date(page.timestamp)
        }))
      })));
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch history:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
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

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Calculate stats
  const totalVisits = pagination.total;
  const adminVisits = history.filter(v => v.userRole === 'Admin').length;
  const premiumVisits = history.filter(v => v.userRole === 'Premium User').length;
  const guestVisits = history.filter(v => v.userRole === 'Guest').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Browsing History</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Analytics</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">History</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Total Visits</p>
              <h3 className="text-white text-xl font-bold mt-1">{totalVisits}</h3>
            </div>
            <div className="bg-[#303943] p-2 rounded-lg">
              <Globe className="h-4 w-4 text-[#A5AFC4]" />
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
              <p className="text-[#A5AFC4] text-xs">Admin Visits</p>
              <h3 className="text-white text-xl font-bold mt-1">{adminVisits}</h3>
            </div>
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <Shield className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-purple-400">{totalVisits ? Math.round((adminVisits / totalVisits) * 100) : 0}%</span>
            <span className="text-[#A5AFC4] ml-1">of total</span>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Premium Visits</p>
              <h3 className="text-white text-xl font-bold mt-1">{premiumVisits}</h3>
            </div>
            <div className="bg-blue-900/30 p-2 rounded-lg">
              <User className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-[#A5AFC4]">
            <span>Filtered for user dashboard</span>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg p-4 shadow-lg border border-[#303943]/50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#A5AFC4] text-xs">Guest Visits</p>
              <h3 className="text-white text-xl font-bold mt-1">{guestVisits}</h3>
            </div>
            <div className="bg-gray-900/30 p-2 rounded-lg">
              <Eye className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="bg-[#303943] w-full h-1.5 rounded-full mt-3">
            <div
              className="bg-gray-500 h-1.5 rounded-full"
              style={{ width: `${totalVisits ? (guestVisits / totalVisits) * 100 : 0}%` }}
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
            placeholder="Search history..."
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
            <option value="Admin">Admin</option>
            <option value="Premium User">Premium User</option>
            <option value="Guest">Guest</option>
          </select>
        </div>
        <button
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${sortBy === 'date' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'}`}
          onClick={() => handleSort('date')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className={`px-3 py-2 rounded-lg flex items-center text-sm border ${sortBy === 'role' ? 'bg-indigo-900/20 text-indigo-400 border-indigo-500/50' : 'bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] border-[#303943]/50'}`}
          onClick={() => handleSort('role')}
        >
          <User className="h-4 w-4 mr-2" />
          Role {sortBy === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          className="ml-auto bg-[#282F36] hover:bg-[#303943] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm border border-[#303943]/50"
          onClick={fetchHistory}
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
            <div className="mt-4 text-[#A5AFC4]">Loading browsing history...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 bg-[#282F36] rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#303943] mb-4">
              <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No history records found</h3>
            <p className="text-[#A5AFC4] mb-4">Try changing your filter settings</p>
          </div>
        ) : (
          history.map((visit) => (
            <div key={visit._id} className="bg-[#282F36] rounded-lg shadow-lg border border-[#303943]/50 overflow-hidden transition-all">
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:hidden flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(visit.basicInfo.device)}
                      <span className="font-medium text-white">{visit.domain}</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(visit.userRole)}`}>
                      {visit.userRole}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">IP Address</div>
                    <div className="text-white font-mono">{visit.maskedIp || visit.ip}</div>
                  </div>
                  <div className="hidden md:block md:col-span-2">
                    <div className="text-xs text-[#6B7280] truncate">Domain</div>
                    <div className="text-[#A5AFC4] truncate">{visit.domain}</div>
                  </div>
                  <div className="hidden md:block md:col-span-2">
                    <div className="text-xs text-[#6B7280]">User Role</div>
                    <span className={`inline-flex items-center px-2 text-xs font-medium ${getRoleColor(visit.userRole)}`}>
                      {visit.userRole}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-xs text-[#6B7280]">Date</div>
                    <div className="text-[#A5AFC4]">
                    <span className="md:hidden">{formatDateMobile(visit.date)}</span>
                      <span className="hidden md:block">{visit.date.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-1">
                    <div className="text-xs text-[#6B7280]">Device</div>
                    <div className="flex items-center text-[#A5AFC4]">
                      {getDeviceIcon(visit.basicInfo.device)}
                      <span className="ml-1">{visit.basicInfo.device?.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-1">
                    <div className="text-xs text-[#6B7280]">OS</div>
                    <div className="flex items-center text-[#A5AFC4]">
                      {getOSIcon(visit.basicInfo?.os)}
                      <span className="ml-1">{visit.basicInfo?.os?.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      onClick={() => toggleRow(visit._id)}
                      className="p-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A444F] hover:text-white"
                    >
                      {expandedRow === visit._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {expandedRow === visit._id && (
                  <div className="mt-6 pt-4 border-t border-[#303943]">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-[#303943] rounded-md p-4">
                        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                          <Eye className="h-4 w-4 mr-2"></Eye>
                            Basic Visitor Info
                        </h4>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Device:</span>
                            <div className="flex items-center text-white">
                              <span className="ml-2">{visit.basicInfo.device}</span>
                              {getDeviceIcon(visit.basicInfo.device)}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">OS:</span>
                            <div className="flex items-center text-white">
                              {getOSIcon(visit.basicInfo?.os)}
                              <span className="ml-2">{visit.basicInfo.os}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Browser:</span>
                            <div className="flex items-center text-white">
                              {getBrowserIcon(visit.basicInfo?.browser)}
                              <span className="ml-2">{visit.basicInfo.browser}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Resolution:</span>
                            <span className="text-white">{visit.basicInfo?.resolution || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Language:</span>
                            <span className="text-white">{visit.basicInfo.language}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Pages Visited:</span>
                            <span className="text-white">{visit.basicInfo.pagesVisited}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Session Duration:</span>
                            <span className="text-white">{visit.basicInfo.sessionDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Interactions:</span>
                            <span className="text-white">{visit.basicInfo.interactions}</span>
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
                            <span className="text-white">{visit.location?.country || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">City:</span>
                            <span className="text-white">{visit.location?.city || ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Region:</span>
                            <span className="text-white">{visit.location?.region || ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Postal Code:</span>
                            <span className="text-white">{visit.location?.postalCode || ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">Timezone:</span>
                            <span className="text-white">{visit.location?.timezone || ''}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#A5AFC4]">ISP:</span>
                            <span className="text-white">{visit.location?.isp || ''}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#303943] rounded-lg p-4">
                        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
                          <Cookie className="h-4 w-4 mr-2" />
                          Cookies & Pages Visited
                        </h4>
                        <div className="mb-4">
                          <h5 className="text-xs text-[#A5AFC4] mb-2 flex items-center">
                            <Cookie className="h-3 w-3 mr-1" />
                            Cookies
                          </h5>
                          <div className="space-y-2">
                            {visit.cookies?.length ? (
                              visit.cookies.map((cookie) => (
                                <div key={cookie.name} className="bg-[#3A444F] p-2 rounded text-xs">
                                  <div className="font-medium text-white">{cookie.name}</div>
                                  <div className="text-[#A5AFC4]">{cookie.purpose}</div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[#A5AFC4] text-xs">No cookies recorded</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-xs text-[#A5AFC4] mb-2 flex items-center">
                            <Scroll className="h-3 w-3 mr-1" />
                            Pages Visited ({visit.visitedPages?.length || 0})
                          </h5>
                          <div className="max-h-[10rem] overflow-y-auto border border-[#3A444F] rounded-md p-2">
                            {visit.visitedPages?.length ? (
                              visit.visitedPages.map((page) => (
                                <div key={page.url} className="flex items-center text-sm py-1 hover:bg-[#3A444F]/50 rounded">
                                  <Link className="h-3 w-3 mr-2 text-[#A5AFC4] flex-shrink-0" />
                                  <span className="text-[#A5AFC4] truncate text-xs">{page.url}</span>
                                  <span className="ml-auto text-xxs text-[#6B7280] whitespace-nowrap">
                                    {page.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-[#6B7280] text-xs py-2">No pages visited</p>
                            )}
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

function formatDateMobile(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = diffMs / (1000 * 60 * 60);
  if (diffHrs < 24) {
    return `${Math.round(diffHrs)} hours ago`;
  }
  const days = Math.floor(diffHrs / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}