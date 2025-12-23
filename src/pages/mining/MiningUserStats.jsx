// pages/mining/MiningUserStats.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Search, MoreHorizontal,
  AlertCircle, Users, DollarSign, Cpu, Zap, TrendingUp,
  ChevronDown, Eye, Download, Clock, BarChart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserMiningStats } from '../../api/adminMiningApi';

export default function MiningUserStats() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'totalEarnings',
    sortOrder: 'desc'
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      const response = await getUserMiningStats(token);
      setUsers(response.users || []);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const multiplier = filters.sortOrder === 'asc' ? 1 : -1;
    
    if (filters.sortBy === 'totalEarnings') {
      return (a.totalEarnings - b.totalEarnings) * multiplier;
    } else if (filters.sortBy === 'equipment.active') {
      return (a.equipment?.active - b.equipment?.active) * multiplier;
    } else if (filters.sortBy === 'equipment.hashRate') {
      return (a.equipment?.hashRate - b.equipment?.hashRate) * multiplier;
    }
    
    return 0;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">User Mining Statistics</h1>
          <p className="text-[#A5AFC4]">Monitor individual user mining performance</p>
        </div>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">User Stats</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Miners</p>
              <h3 className="text-white text-2xl font-bold mt-1">{users.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Active miners
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Active Miners</p>
              <h3 className="text-white text-2xl font-bold mt-1 text-green-400">
                {users.filter(u => u.isMining).length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Currently mining
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Earnings</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${users.reduce((sum, u) => sum + (u.totalEarnings || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
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
              <p className="text-yellow-100 text-sm">Total Equipment</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {users.reduce((sum, u) => sum + (u.equipment?.total || 0), 0)}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Hardware deployed
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
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="totalEarnings">Sort by Earnings</option>
              <option value="equipment.active">Sort by Active Equipment</option>
              <option value="equipment.hashRate">Sort by Hash Rate</option>
            </select>
            <button 
              onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
            <button 
              onClick={fetchUserStats}
              disabled={isLoading}
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Mining Users</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {users.length} users
            </span>
          </div>
          <div className="text-sm text-[#A5AFC4]">
            Showing {sortedUsers.length} of {users.length}
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-4 text-sm font-medium text-[#A5AFC4]">User</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Equipment</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Hash Rate</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading user statistics...</div>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No mining users found</h3>
                <p className="text-[#A5AFC4]">Try adjusting your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedUsers.map((user) => (
                  <div key={user.id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${user.isMining ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <div>
                            <h3 className="font-medium text-white">{user.name || 'Unknown User'}</h3>
                            <p className="text-xs text-[#A5AFC4]">{user.email}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isMining 
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                            : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                        }`}>
                          {user.isMining ? 'Mining' : 'Idle'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-[#A5AFC4]">Account:</div>
                        <div className="text-white font-medium">{user.accountType}</div>
                        
                        <div className="text-[#A5AFC4]">Balance:</div>
                        <div className="text-white font-medium">${user.balance?.toLocaleString()}</div>
                        
                        <div className="text-[#A5AFC4]">Equipment:</div>
                        <div className="text-white font-medium">
                          {user.equipment?.active}/{user.equipment?.total} active
                        </div>
                        
                        <div className="text-[#A5AFC4]">Hash Rate:</div>
                        <div className="text-white font-medium">{user.equipment?.hashRate || 0} TH/s</div>
                        
                        <div className="text-[#A5AFC4]">Earnings:</div>
                        <div className="text-green-400 font-medium">${user.totalEarnings?.toLocaleString() || '0'}</div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4]">
                          Active session: {user.activeSession ? 'Yes' : 'No'}
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400">
                            <BarChart className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* User */}
                      <div className="col-span-4 flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${user.isMining ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <div>
                          <span className="text-white font-medium block">{user.name || 'Unknown User'}</span>
                          <span className="text-xs text-[#A5AFC4]">{user.email}</span>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                              {user.accountType}
                            </span>
                            <span className="ml-2 text-xs text-[#A5AFC4]">
                              ${user.balance?.toLocaleString()} balance
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isMining 
                              ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                              : 'bg-gray-900/30 text-gray-400 border border-gray-500/30'
                          }`}>
                            {user.isMining ? 'Mining' : 'Idle'}
                          </div>
                          <div className="text-xs text-[#A5AFC4]">
                            {user.activeSession ? 'Active' : 'No session'}
                          </div>
                        </div>
                      </div>

                      {/* Equipment */}
                      <div className="col-span-2">
                        <div className="text-white font-medium">
                          {user.equipment?.active}/{user.equipment?.total} active
                        </div>
                        <div className="text-xs text-[#A5AFC4]">
                          {user.equipment?.power || 0} kW power
                        </div>
                      </div>

                      {/* Hash Rate */}
                      <div className="col-span-2">
                        <div className="text-white font-medium">{user.equipment?.hashRate || 0} TH/s</div>
                        <div className="text-xs text-[#A5AFC4]">
                          Earnings: <span className="text-green-400">${user.totalEarnings?.toLocaleString() || '0'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        <button className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-400 hover:text-blue-300 p-2 rounded hover:bg-blue-500/20">
                          <BarChart className="h-4 w-4" />
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