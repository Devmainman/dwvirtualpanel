import { useState, useEffect } from 'react';
import { 
  ChevronRight, Plus, Edit2, Trash2, AlertCircle, 
  RefreshCw, Filter, MoreHorizontal, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getTradePackages, createTradePackage, 
  updateTradePackage, deleteTradePackage 
} from '../../api/adminTradingApi';



export default function TradeSettings() {
  const { token } = useAuth();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newPackage, setNewPackage] = useState({
  name: '',
  description: '',
  minAmount: 0,
  maxAmount: 0,
  profitRate: 0,
  profitInterval: 'minute',
  duration: 1,
  status: 'active'
});
const [editingPackage, setEditingPackage] = useState(null);





  useEffect(() => {
    fetchPackages();
  }, [filterStatus]);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const response = await getTradePackages(token, { 
        status: filterStatus === 'all' ? undefined : filterStatus 
      });
      setPackages(response.packages);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await deleteTradePackage(token, id);
      setPackages(packages.filter(pkg => pkg._id !== id));
    } catch (error) {
      console.error("Failed to delete package:", error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await createTradePackage(token, newPackage);
      setPackages([...packages, response.package]);
      setIsModalOpen(false);
      resetForm();
      setNewPackage({
        name: '',
        description: '',
        minAmount: 0,
        maxAmount: 0,
        profitRate: 0,
        profitInterval: 'minute',
        duration: 1,
        status: 'active'
      });


    } catch (error) {
      console.error("Failed to create package:", error);
    }
  };

  const handleSave = async () => {
  try {
    if (editingPackage) {
      const res = await updateTradePackage(token, editingPackage._id, newPackage);

      setPackages(packages.map(p =>
        p._id === editingPackage._id ? res.package : p
      ));
    } else {
      const res = await createTradePackage(token, newPackage);
      setPackages([...packages, res.package]);
    }

    setIsModalOpen(false);
    setEditingPackage(null);
    setNewPackage({
      name: '',
      description: '',
      minAmount: 0,
      maxAmount: 0,
      profitRate: 0,
      profitInterval: 'minute',
      duration: 1,
      status: 'active'
    });


  } catch (error) {
    console.error("Failed to save package:", error.response?.data || error.message);
  }
};


  const toggleSortOrder = () => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');

  const filteredPackages = packages.filter(pkg => 
    filterStatus === 'all' || pkg.status === filterStatus
  );

  const sortedPackages = [...filteredPackages].sort((a, b) => {
    return sortOrder === 'asc' ? a.minAmount - b.minAmount : b.minAmount - a.minAmount;
  });

  const formatInterval = (interval) => {
    const map = {
      'minute': 'Every Minute',
      '5-minutes': 'Every 5 Minutes',
      '15-minutes': 'Every 15 Minutes',
      '30-minutes': 'Every 30 Minutes',
      'hour': 'Every Hour',
      'daily': 'Daily'
    };
    return map[interval] || interval;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Trade Settings</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Trades</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Settings</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Packages</p>
              <h3 className="text-white text-2xl font-bold mt-1">{packages.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              View All
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Active Packages</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {packages.filter(p => p.status === 'active').length}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Last updated just now
            </span>
          </div>
        </div>

        <div className="bg-[#2B333C] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Average Rate</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {packages.length > 0 
                  ? (packages.reduce((sum, pkg) => sum + pkg.profitRate, 0) / packages.length).toFixed(1) 
                  : 0}%
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <ChevronUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              <span className="text-green-300">↑ 0.5%</span> than last week
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-[#282F36] rounded-lg shadow-xl mb-6 border border-[#303943]/50 overflow-hidden">
        <div className="p-4 border-b border-[#303943] flex flex-col md:flex-row justify-between md:items-center gap-3">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-white">Trade Packages</h2>
            <span className="ml-2 bg-indigo-600/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {packages.length} packages
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Filter dropdown */}
            <div className="relative">
              <button 
                className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
                onClick={() => setFilterStatus(filterStatus === 'all' ? 'active' : filterStatus === 'active' ? 'inactive' : 'all')}
              >
                <Filter className="h-4 w-4 mr-2" />
                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </div>
            
            {/* Sort button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={toggleSortOrder}
            >
              <ArrowSort className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
            </button>
            
            {/* Refresh button */}
            <button 
              className="bg-[#303943] hover:bg-[#3A434D] text-[#A5AFC4] px-3 py-2 rounded-lg flex items-center text-sm"
              onClick={fetchPackages}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Add button */}
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center text-sm shadow-lg"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Header - Hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-2 border-b border-[#303943]">
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Package Name</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Min Amount</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Max Amount</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Rate</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4]">Interval</div>
              <div className="col-span-1 text-sm font-medium text-[#A5AFC4]">Status</div>
              <div className="col-span-2 text-sm font-medium text-[#A5AFC4] text-right">Actions</div>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <div className="mt-4 text-[#A5AFC4]">Loading trade packages...</div>
              </div>
            ) : sortedPackages.length === 0 ? (
              <div className="text-center py-12 bg-[#303943]/50 rounded-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#282F36] mb-4">
                  <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No trade packages found</h3>
                <p className="text-[#A5AFC4] mb-4">Create your first package to get started</p>
                <button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trade Package
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-[#303943] rounded-lg overflow-hidden hover:bg-[#3A434D] transition-colors shadow-md">
                    {/* Mobile view */}
                    <div className="md:hidden p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <h3 className="font-medium text-white">{pkg.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.status === 'active' 
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                            : 'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}>
                          {pkg.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="text-[#A5AFC4]">Min Amount:</div>
                        <div className="text-white font-medium">{pkg.minAmount.toLocaleString()} {pkg.minAmount.toLocaleString()}</div>
                        
                        <div className="text-[#A5AFC4]">Max Amount:</div>
                        <div className="text-white font-medium">{pkg.maxAmount.toLocaleString()} {pkg.maxAmount.toLocaleString()}</div>
                        
                        <div className="text-[#A5AFC4]">Rate:</div>
                        <div className="text-white font-medium">{pkg.profitRate}%</div>
                        
                        <div className="text-[#A5AFC4]">Interval:</div>
                        <div className="text-white font-medium">{formatInterval(pkg.profitInterval)}</div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-[#404A56]">
                        <div className="text-xs text-[#A5AFC4]">
                          {pkg.description || 'No description'}
                        </div>
                        <div className="flex space-x-1">
                         <button
  className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20"
  onClick={() => {
    setEditingPackage(pkg);
    setNewPackage({
      name: pkg.name,
      description: pkg.description || '',
      minAmount: pkg.minAmount,
      maxAmount: pkg.maxAmount,
      profitRate: pkg.profitRate,
      profitInterval: pkg.profitInterval,
      duration: pkg.duration,
      status: pkg.status
    });

    setIsModalOpen(true);
  }}
>
  <Edit2 className="h-4 w-4" />
</button>

                          <button 
                            onClick={() => handleDelete(pkg._id)}
                            className="p-2 rounded-full hover:bg-red-500/20 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop view */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center p-4">
                      {/* Package Name */}
                      <div className="col-span-2 flex items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></div>
                        <span className="text-white font-medium">{pkg.name}</span>
                      </div>

                      <div className="col-span-2 text-[#A5AFC4]">
  {pkg.minAmount.toLocaleString()} {pkg.defaultCurrency || 'USD'}

</div>

<div className="col-span-2 text-[#A5AFC4]">
  {pkg.maxAmount.toLocaleString()} {pkg.currency}
</div>


                      {/* Rate */}
                      <div className="col-span-1 text-white font-medium">{pkg.profitRate}%</div>

                      {/* Interval */}
                      <div className="col-span-2 text-[#A5AFC4]">{formatInterval(pkg.profitRate)}</div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.status === 'active' 
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                            : 'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}>
                          {pkg.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex justify-end space-x-2">
                        <button
  className="text-indigo-400 hover:text-indigo-300 p-2 rounded hover:bg-indigo-500/20"
  onClick={() => {
    setEditingPackage(pkg);
    setNewPackage({
  name: pkg.name,
  description: pkg.description || '',
  minAmount: pkg.minAmount,
  maxAmount: pkg.maxAmount,
  profitRate: pkg.profitRate,
  profitInterval: pkg.profitInterval,
  duration: pkg.duration,
  status: pkg.status
});

    setIsModalOpen(true);
  }}
>
  <Edit2 className="h-4 w-4" />
</button>

                        <button 
                          onClick={() => handleDelete(pkg._id)}
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

      {/* Help card */}
      <div className="bg-[#282F36] rounded-lg p-4 border border-[#303943]/50">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">Need help with trade settings?</h3>
            <p className="text-sm text-[#A5AFC4] mb-3">Learn how to configure optimal trading parameters with our guide.</p>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 text-sm inline-flex items-center">
              View Documentation
              <ChevronRight className="h-4 w-4 ml-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Create Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[#303943] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Add New Trade Package</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Package Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                    placeholder="e.g. Features, Liquidity, Swift"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Description</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                    placeholder="Optional description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Min Amount</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newPackage.minAmount}
                      onChange={(e) => setNewPackage({...newPackage, minAmount: parseFloat(e.target.value) || 0})}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Max Amount</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newPackage.maxAmount}
                      onChange={(e) => setNewPackage({...newPackage, maxAmount: parseFloat(e.target.value) || 0})}
                      placeholder="10000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Rate (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     value={newPackage.profitRate}
                     onChange={(e) => setNewPackage({...newPackage, profitRate: parseFloat(e.target.value) || 0})}
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Duration (hours)</label>
                    <input 
                      type="number" 
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newPackage.duration}
                      onChange={(e) => setNewPackage({...newPackage, duration: parseInt(e.target.value) || 1})}
                      placeholder="24"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Interval</label>
                    <select 
                      className="w-full bg-[#1E232A] border border-[#303943] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newPackage.profitInterval}
                      onChange={(e) => setNewPackage({...newPackage, profitInterval: e.target.value})}
                    >
                      <option value="minute">Every Minute</option>
                      <option value="5-minutes">Every 5 Minutes</option>
                      <option value="15-minutes">Every 15 Minutes</option>
                      <option value="30-minutes">Every 30 Minutes</option>
                      <option value="hour">Every Hour</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Status</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-indigo-600" 
                        name="status" 
                        value="active" 
                        checked={newPackage.status === 'active'}
                        onChange={() => setNewPackage({...newPackage, status: 'active'})}
                      />
                      <span className="ml-2 text-white">Active</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input 
                        type="radio" 
                        className="form-radio text-red-600" 
                        name="status" 
                        value="inactive" 
                        checked={newPackage.status === 'inactive'}
                        onChange={() => setNewPackage({...newPackage, status: 'inactive'})}
                      />
                      <span className="ml-2 text-white">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#303943] flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-lg hover:bg-[#3A434D]"
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                onClick={handleCreate}
              >
                {editingPackage ? "Update Package" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom ArrowSort icon component
function ArrowSort({ className }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1z" />
      <path d="M17 16v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h5" />
      <line x1="12" y1="8" x2="16" y2="12" />
      <line x1="12" y1="16" x2="16" y2="12" />
    </svg>
  );
}

function ChevronUp({ className }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  );
}