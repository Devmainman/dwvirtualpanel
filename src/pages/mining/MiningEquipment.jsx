// pages/mining/MiningEquipment.jsx
import { useState, useEffect } from 'react';
import { 
  ChevronRight, Filter, RefreshCw, Search, MoreHorizontal,
  AlertCircle, Cpu, Zap, Thermometer, Clock, DollarSign,
  ChevronDown, Edit2, Trash2, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMiningEquipment, deleteMiningEquipment } from '../../api/adminMiningApi';

export default function MiningEquipment() {
  const { token } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const response = await getMiningEquipment(token);
      setEquipment(response.equipment || []);
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || item.type === filters.type;
    const matchesStatus = filters.status === 'all' || item.status === filters.status;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const TypeBadge = ({ type }) => {
    const colors = {
      GPU: 'bg-purple-500/20 text-purple-400',
      ASIC: 'bg-blue-500/20 text-blue-400',
      CPU: 'bg-green-500/20 text-green-400',
      FPGA: 'bg-yellow-500/20 text-yellow-400'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || 'bg-gray-500/20'}`}>
        {type}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      active: 'bg-green-900/30 text-green-400 border border-green-500/30',
      idle: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      offline: 'bg-red-900/30 text-red-400 border border-red-500/30',
      maintenance: 'bg-orange-900/30 text-orange-400 border border-orange-500/30'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleDelete = async (equipmentId) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await deleteMiningEquipment(token, equipmentId);
      setEquipment(equipment.filter(eq => eq.id !== equipmentId));
    } catch (error) {
      console.error("Failed to delete equipment:", error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#1E232A]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-2">
        <h1 className="text-xl md:text-2xl font-semibold text-white">Mining Equipment</h1>
        <div className="flex items-center space-x-2 bg-[#282F36] px-3 py-1 rounded-lg">
          <span className="text-sm text-[#aab8c5]">Mining</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-white">Equipment</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Total Equipment</p>
              <h3 className="text-white text-2xl font-bold mt-1">{equipment.length}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Active: {equipment.filter(e => e.status === 'active').length}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Hash Rate</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {equipment.reduce((sum, eq) => sum + (eq.hashRate || 0), 0).toLocaleString()} {equipment[0]?.type === 'ASIC' ? 'TH/s' : 'MH/s'}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Network Power
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Investment</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${equipment.reduce((sum, eq) => sum + (eq.purchasePrice || 0), 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Capital deployed
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#2B333C] to-[#24675F] rounded-lg p-4 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">Avg Temperature</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                {equipment.length > 0 
                  ? Math.round(equipment.reduce((sum, eq) => sum + (eq.temperature || 0), 0) / equipment.length)
                  : 0}°C
              </h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">
              Cool status
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
                placeholder="Search equipment or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="GPU">GPU</option>
              <option value="ASIC">ASIC</option>
              <option value="CPU">CPU</option>
              <option value="FPGA">FPGA</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 bg-[#1E232A] border border-[#303943] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button 
              onClick={fetchEquipment}
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

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <div className="mt-4 text-[#A5AFC4]">Loading equipment...</div>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#282F36] rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#303943] mb-4">
              <AlertCircle className="h-6 w-6 text-[#A5AFC4]" />
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No equipment found</h3>
            <p className="text-[#A5AFC4]">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredEquipment.map((item) => (
            <div key={item.id} className="bg-[#282F36] rounded-lg shadow-xl border border-[#303943]/50 overflow-hidden hover:border-[#404A56] transition-colors">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{item.name}</h3>
                    <p className="text-sm text-[#A5AFC4] mt-1">
                      Owner: {item.user?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TypeBadge type={item.type} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Hash Rate</span>
                    <span className="font-semibold text-white">
                      {item.hashRate} {item.type === 'ASIC' ? 'TH/s' : 'MH/s'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Power</span>
                    <span className="font-semibold text-white">{item.powerConsumption}W</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Temperature</span>
                    <span className="font-semibold text-white">{item.temperature}°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Purchase Price</span>
                    <span className="font-semibold text-white">${item.purchasePrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#A5AFC4]">Runtime</span>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 text-[#A5AFC4]" />
                      <span className="font-semibold text-white">
                        {Math.round(item.totalRuntime / 3600)}h
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-[#404A56]">
                  <div className="text-xs text-[#A5AFC4]">
                    {item.specifications?.model || 'Standard model'}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 text-indigo-400 hover:text-indigo-300">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-1 text-[#A5AFC4] hover:text-white">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}