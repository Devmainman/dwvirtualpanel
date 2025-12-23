// pages/mining/MiningPools.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Edit2, Trash2, Filter, 
  RefreshCw, MoreHorizontal, AlertCircle, Search,
  CheckCircle, XCircle, Clock, ChevronDown, Download, Cpu, Users, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningPools, updateMiningPool } from '../../api/adminMiningApi';

export default function MiningPools() {
  const { token } = useAuth();
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingPool, setEditingPool] = useState(null);
  const [poolForm, setPoolForm] = useState({
    name: '',
    url: '',
    fee: '1.5',
    algorithm: 'SHA-256',
    minPayout: '0.001',
    status: 'active'
  });

  useEffect(() => {
    fetchPools();
  }, [filterStatus]);

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningPools(token, { 
        status: filterStatus === 'all' ? undefined : filterStatus 
      });
      setPools(response.pools || []);
    } catch (error) {
      console.error("Failed to fetch pools:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePool = async () => {
    try {
      if (editingPool) {
        await updateMiningPool(token, editingPool.id, poolForm);
      }
      // In real implementation, you would have createPool API
      fetchPools();
      setIsModalOpen(false);
      setEditingPool(null);
      setPoolForm({
        name: '',
        url: '',
        fee: '1.5',
        algorithm: 'SHA-256',
        minPayout: '0.001',
        status: 'active'
      });
    } catch (error) {
      console.error("Failed to save pool:", error);
    }
  };

  const handleEdit = (pool) => {
    setEditingPool(pool);
    setPoolForm({
      name: pool.name,
      url: pool.url,
      fee: pool.fee,
      algorithm: pool.algorithm,
      minPayout: pool.minPayout,
      status: pool.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (poolId) => {
    if (!window.confirm('Are you sure you want to delete this pool?')) return;
    // In real implementation, you would have deletePool API
    console.log('Delete pool:', poolId);
  };

  const filteredPools = pools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.algorithm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPools = [...filteredPools].sort((a, b) => {
    return sortOrder === 'asc' ? a.fee - b.fee : b.fee - a.fee;
  });

  const StatusBadge = ({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      status === 'active' 
        ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
        : status === 'maintenance'
        ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
        : 'bg-red-900/30 text-red-400 border border-red-500/30'
    }`}>
      {status === 'active' ? (
        <CheckCircle size={12} className="mr-1" />
      ) : status === 'maintenance' ? (
        <Clock size={12} className="mr-1" />
      ) : (
        <XCircle size={12} className="mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const AlgorithmBadge = ({ algorithm }) => {
    const colors = {
      'SHA-256': 'bg-blue-500/20 text-blue-400',
      'Ethash': 'bg-purple-500/20 text-purple-400',
      'Scrypt': 'bg-green-500/20 text-green-400',
      'RandomX': 'bg-yellow-500/20 text-yellow-400',
      'Equihash': 'bg-red-500/20 text-red-400',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[algorithm] || 'bg-gray-500/20'}`}>
        {algorithm}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Pools</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Pools</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Pools</p>
              <h3 className="text-white text-2xl font-bold mt-1">{pools.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Active: {pools.filter(p => p.status === 'active').length}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Miners</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {pools.reduce((sum, pool) => sum + (pool.miners || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Avg per pool: {Math.round(pools.reduce((sum, pool) => sum + (pool.miners || 0), 0) / (pools.length || 1))}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Hash Rate</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {pools.reduce((sum, pool) => sum + (pool.hashRate || 0), 0).toLocaleString()} TH/s
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Network capacity
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Avg Uptime</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {pools.length > 0 
                  ? (pools.reduce((sum, pool) => sum + (pool.uptime || 0), 0) / pools.length).toFixed(1) 
                  : 0}%
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Reliability
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Mining Pools</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {pools.length} pools
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search pools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            
            {/* Filter dropdown */}
            <div className="relative">
              <button 
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
                onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : filterStatus === 'active' ? 'maintenance' : filterStatus === 'maintenance' ? 'offline' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
            
            {/* Sort button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Low Fee' : 'High Fee'}
            </button>
            
            {/* Refresh button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={fetchPools}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Export button */}
            <button className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            
            {/* Add button */}
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm shadow-lg"
              onClick={() => {
                setEditingPool(null);
                setPoolForm({
                  name: '',
                  url: '',
                  fee: '1.5',
                  algorithm: 'SHA-256',
                  minPayout: '0.001',
                  status: 'active'
                });
                setIsModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pool
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-3 text-sm font-medium text-[#A5AFC4]">Pool Name</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Algorithm</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Fee</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Miners</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Uptime</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading mining pools...</div>
              </div>
            ) : sortedPools.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No mining pools found</h3>
                <p className="text-[#A5AFC4] mb-4">Create your first pool to get started</p>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mining Pool
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPools.map((pool) => (
                  <div key={pool.id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h3 className="font-medium text-white">{pool.name}</h3>
                        </div>
                        <StatusBadge status={pool.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-[#A5AFC4]">Algorithm:</div>
                        <div><AlgorithmBadge algorithm={pool.algorithm} /></div>
                        
                        <div className="text-[#A5AFC4]">Fee:</div>
                        <div className="text-white font-medium">{pool.fee}%</div>
                        
                        <div className="text-[#A5AFC4]">Miners:</div>
                        <div className="text-white font-medium">{pool.miners?.toLocaleString()}</div>
                        
                        <div className="text-[#A5AFC4]">Uptime:</div>
                        <div className="text-white font-medium">{pool.uptime}%</div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4] truncate">
                          {pool.url}
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleEdit(pool)}
                            className="p-2 rounded-full hover:bg-indigo-500/20 text-indigo-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(pool.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* Pool Name */}
                      <div className="col-span-3 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                        <div>
                          <span className="text-white font-medium block">{pool.name}</span>
                          <span className="text-xs text-[#A5AFC4] truncate max-w-xs">{pool.url}</span>
                        </div>
                      </div>

                      {/* Algorithm */}
                      <div className="col-span-2">
                        <AlgorithmBadge algorithm={pool.algorithm} />
                      </div>

                      {/* Fee */}
                      <div className="col-span-1 text-white font-medium">{pool.fee}%</div>

                      {/* Miners */}
                      <div className="col-span-2">
                        <div className="text-white font-medium">{pool.miners?.toLocaleString()}</div>
                        <div className="text-xs text-[#A5AFC4]">Hash: {pool.hashRate} TH/s</div>
                      </div>

                      {/* Uptime */}
                      <div className="col-span-1">
                        <div className="flex items-center">
                          <div className="w-16 bg-[#1E232A] rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${pool.uptime}%` }}
                            ></div>
                          </div>
                          <span className="text-white">{pool.uptime}%</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status={pool.status} />
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(pool)}
                          className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pool.id)}
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

      {/* Create/Edit Pool Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-[#303943] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {editingPool ? 'Edit Mining Pool' : 'Add New Mining Pool'}
              </h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPool(null);
                }}
                className="text-[#A5AFC4] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Pool Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={poolForm.name}
                    onChange={(e) => setPoolForm({...poolForm, name: e.target.value})}
                    placeholder="e.g. Bitcoin Pool Pro"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Pool URL</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={poolForm.url}
                    onChange={(e) => setPoolForm({...poolForm, url: e.target.value})}
                    placeholder="e.g., stratum+tcp://pool.example.com:3333"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Fee (%)</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={poolForm.fee}
                      onChange={(e) => setPoolForm({...poolForm, fee: e.target.value})}
                      placeholder="1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Min Payout</label>
                    <input 
                      type="number" 
                      step="0.001"
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={poolForm.minPayout}
                      onChange={(e) => setPoolForm({...poolForm, minPayout: e.target.value})}
                      placeholder="0.001"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Algorithm</label>
                  <select 
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={poolForm.algorithm}
                    onChange={(e) => setPoolForm({...poolForm, algorithm: e.target.value})}
                  >
                    <option value="SHA-256">SHA-256 (Bitcoin)</option>
                    <option value="Ethash">Ethash (Ethereum)</option>
                    <option value="Scrypt">Scrypt (Litecoin)</option>
                    <option value="RandomX">RandomX (Monero)</option>
                    <option value="Equihash">Equihash (Zcash)</option>
                    <option value="X11">X11 (Dash)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Status</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-green-600" 
                        name="status" 
                        value="active" 
                        checked={poolForm.status === 'active'}
                        onChange={() => setPoolForm({...poolForm, status: 'active'})}
                      />
                      <span className="ml-2 text-white">Active</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-yellow-600" 
                        name="status" 
                        value="maintenance" 
                        checked={poolForm.status === 'maintenance'}
                        onChange={() => setPoolForm({...poolForm, status: 'maintenance'})}
                      />
                      <span className="ml-2 text-white">Maintenance</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-red-600" 
                        name="status" 
                        value="offline" 
                        checked={poolForm.status === 'offline'}
                        onChange={() => setPoolForm({...poolForm, status: 'offline'})}
                      />
                      <span className="ml-2 text-white">Offline</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingPool(null);
                }}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={handleSavePool}
              >
                {editingPool ? 'Save Changes' : 'Create Pool'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}