import { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List, Plus, Trash2, Edit, 
  Users, BarChart2, Settings, Wallet, Activity, 
  CheckCircle, XCircle, MoreVertical, ArrowUpDown
} from 'lucide-react';

const categories = ['All', 'Art', 'Gaming', 'Music', 'Photography', 'Sports', 'Virtual Worlds'];
const statuses = ['All', 'Active', 'Sold', 'Expired'];

const mockNFTs = [
  {
    id: 1,
    name: 'Cosmic Dreamer #5847',
    creator: 'ArtistX',
    price: 2.5,
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    likes: 342,
    views: 1250,
    category: 'Art',
    status: 'Active',
    sales: 3,
    revenue: 7.5,
    created: '2023-05-15',
    verified: true
  },
  {
    id: 2,
    name: 'Neon City #2134',
    creator: 'CyberArt',
    price: 1.8,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    likes: 528,
    views: 2100,
    category: 'Virtual Worlds',
    status: 'Sold',
    sales: 1,
    revenue: 1.8,
    created: '2023-04-22',
    verified: true
  },
  {
    id: 3,
    name: 'Ethereal Moments',
    creator: 'DigitalDream',
    price: 0.75,
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=400&h=400&fit=crop',
    likes: 189,
    views: 890,
    category: 'Photography',
    status: 'Active',
    sales: 0,
    revenue: 0,
    created: '2023-06-10',
    verified: false
  },
  {
    id: 4,
    name: 'Bass Drop Legends',
    creator: 'SoundWave',
    price: 3.2,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    likes: 721,
    views: 3200,
    category: 'Music',
    status: 'Active',
    sales: 5,
    revenue: 16.0,
    created: '2023-03-18',
    verified: true
  },
  {
    id: 5,
    name: 'Pixel Warriors #891',
    creator: 'GameCraft',
    price: 1.2,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop',
    likes: 445,
    views: 1800,
    category: 'Gaming',
    status: 'Expired',
    sales: 2,
    revenue: 2.4,
    created: '2023-02-28',
    verified: true
  },
  {
    id: 6,
    name: 'Abstract Harmony',
    creator: 'ModernArt',
    price: 0.95,
    image: 'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=400&h=400&fit=crop',
    likes: 267,
    views: 1100,
    category: 'Art',
    status: 'Active',
    sales: 1,
    revenue: 0.95,
    created: '2023-06-05',
    verified: false
  }
];

export default function AdminNFTStore() {
  const [nfts, setNfts] = useState(mockNFTs);
  const [filteredNFTs, setFilteredNFTs] = useState(mockNFTs);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    category: 'Art',
    status: 'Active',
    verified: false
  });

  // Stats for dashboard
  const stats = {
    totalNFTs: nfts.length,
    activeNFTs: nfts.filter(nft => nft.status === 'Active').length,
    totalSales: nfts.reduce((sum, nft) => sum + nft.sales, 0),
    totalRevenue: nfts.reduce((sum, nft) => sum + nft.revenue, 0).toFixed(2)
  };

  useEffect(() => {
    let filtered = nfts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(nft => nft.category === selectedCategory);
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(nft => nft.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.creator.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return b.price - a.price;
        case 'price-low':
          return a.price - b.price;
        case 'sales':
          return b.sales - a.sales;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'recent':
        default:
          return new Date(b.created) - new Date(a.created);
      }
    });

    setFilteredNFTs(filtered);
  }, [nfts, selectedCategory, selectedStatus, searchTerm, sortBy]);

  const handleDelete = (id) => {
    setNfts(nfts.filter(nft => nft.id !== id));
  };

  const handleEdit = (nft) => {
    setSelectedNFT(nft);
    setEditForm({
      name: nft.name,
      price: nft.price,
      category: nft.category,
      status: nft.status,
      verified: nft.verified
    });
    setIsEditing(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedNFTs = nfts.map(nft => 
      nft.id === selectedNFT.id ? { ...nft, ...editForm } : nft
    );
    setNfts(updatedNFTs);
    setIsEditing(false);
    setSelectedNFT(null);
  };

  const NFTCard = ({ nft }) => (
    <div className="bg-[#282F36] rounded-xl overflow-hidden border border-[#303943]">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMzAzOTQzIi8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDMwMCAyMDBMMjAwIDMwMEwxMDAgMjAwTDIwMCAxMDBaIiBmaWxsPSIjNEY1NjY4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNBNUFGQzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5GVCBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
            }}
          />
        </div>
        
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full ${
          nft.status === 'Active' ? 'bg-green-500/90 text-white' :
          nft.status === 'Sold' ? 'bg-blue-500/90 text-white' :
          'bg-gray-500/90 text-white'
        }`}>
          {nft.status}
        </div>

        {/* Verified Badge */}
        {nft.verified && (
          <div className="absolute top-3 right-3 bg-blue-500 p-1 rounded-full">
            <CheckCircle size={12} className="text-white" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold truncate">
            {nft.name}
          </h3>
          <div className="dropdown relative">
            <button className="text-[#A5AFC4] hover:text-white">
              <MoreVertical size={16} />
            </button>
            <div className="dropdown-menu absolute right-0 mt-2 w-40 bg-[#303943] rounded-md shadow-lg z-10 hidden">
              <button 
                onClick={() => handleEdit(nft)}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3A444F] flex items-center gap-2"
              >
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => handleDelete(nft.id)}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#3A444F] flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Users size={12} className="text-white" />
          </div>
          <span className="text-[#A5AFC4] text-sm">by {nft.creator}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#303943] p-2 rounded-lg">
            <div className="text-[#A5AFC4] text-xs mb-1">Price</div>
            <div className="text-white font-medium">{nft.price} ETH</div>
          </div>
          <div className="bg-[#303943] p-2 rounded-lg">
            <div className="text-[#A5AFC4] text-xs mb-1">Sales</div>
            <div className="text-white font-medium">{nft.sales}</div>
          </div>
          <div className="bg-[#303943] p-2 rounded-lg">
            <div className="text-[#A5AFC4] text-xs mb-1">Revenue</div>
            <div className="text-white font-medium">{nft.revenue} ETH</div>
          </div>
          <div className="bg-[#303943] p-2 rounded-lg">
            <div className="text-[#A5AFC4] text-xs mb-1">Views</div>
            <div className="text-white font-medium">{nft.views}</div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-[#A5AFC4]">
          <div>Created: {new Date(nft.created).toLocaleDateString()}</div>
          <div className="capitalize">{nft.category}</div>
        </div>
      </div>
    </div>
  );

  const NFTListItem = ({ nft }) => (
    <div className="bg-[#282F36] rounded-lg border border-[#303943] p-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMzAzOTQzIi8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDMwMCAyMDBMMjAwIDMwMEwxMDAgMjAwTDIwMCAxMDBaIiBmaWxsPSIjNEY1NjY4Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNBNUFGQzQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5GVCBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+';
            }}
          />
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold truncate">{nft.name}</h3>
            <div className="flex items-center gap-2">
              {nft.verified && (
                <CheckCircle size={16} className="text-blue-500" />
              )}
              <button 
                onClick={() => handleEdit(nft)}
                className="text-[#A5AFC4] hover:text-blue-500"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={() => handleDelete(nft.id)}
                className="text-[#A5AFC4] hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[#A5AFC4] mb-1">
            <span>by {nft.creator}</span>
            <span>•</span>
            <span className="capitalize">{nft.category}</span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              nft.status === 'Active' ? 'bg-green-500/20 text-green-400' :
              nft.status === 'Sold' ? 'bg-blue-500/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {nft.status}
            </span>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-sm mt-2">
            <div>
              <div className="text-[#A5AFC4]">Price</div>
              <div className="text-white">{nft.price} ETH</div>
            </div>
            <div>
              <div className="text-[#A5AFC4]">Sales</div>
              <div className="text-white">{nft.sales}</div>
            </div>
            <div>
              <div className="text-[#A5AFC4]">Revenue</div>
              <div className="text-white">{nft.revenue} ETH</div>
            </div>
            <div>
              <div className="text-[#A5AFC4]">Created</div>
              <div className="text-white">{new Date(nft.created).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1E232A]">
      {/* Admin Header */}
      <div className="bg-[#282F36] border-b border-[#303943]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">NFT Management</h1>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A5AFC4]" size={18} />
                <input
                  type="text"
                  placeholder="Search NFTs..."
                  className="bg-[#303943] text-white pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-[#3A444F]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <Plus size={16} />
                Add NFT
              </button>
            </div>
          </div>
          
          {/* Admin Navigation */}
          <div className="flex items-center gap-6 mt-6">
            <button className="flex items-center gap-2 text-white border-b-2 border-indigo-500 pb-2">
              <Wallet size={18} />
              NFTs
            </button>
            <button className="flex items-center gap-2 text-[#A5AFC4] hover:text-white pb-2">
              <Users size={18} />
              Users
            </button>
            <button className="flex items-center gap-2 text-[#A5AFC4] hover:text-white pb-2">
              <BarChart2 size={18} />
              Analytics
            </button>
            <button className="flex items-center gap-2 text-[#A5AFC4] hover:text-white pb-2">
              <Activity size={18} />
              Transactions
            </button>
            <button className="flex items-center gap-2 text-[#A5AFC4] hover:text-white pb-2">
              <Settings size={18} />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#282F36] rounded-xl p-4 border border-[#303943]">
            <div className="text-[#A5AFC4] text-sm mb-1">Total NFTs</div>
            <div className="text-white text-2xl font-bold">{stats.totalNFTs}</div>
          </div>
          <div className="bg-[#282F36] rounded-xl p-4 border border-[#303943]">
            <div className="text-[#A5AFC4] text-sm mb-1">Active NFTs</div>
            <div className="text-white text-2xl font-bold">{stats.activeNFTs}</div>
          </div>
          <div className="bg-[#282F36] rounded-xl p-4 border border-[#303943]">
            <div className="text-[#A5AFC4] text-sm mb-1">Total Sales</div>
            <div className="text-white text-2xl font-bold">{stats.totalSales}</div>
          </div>
          <div className="bg-[#282F36] rounded-xl p-4 border border-[#303943]">
            <div className="text-[#A5AFC4] text-sm mb-1">Total Revenue</div>
            <div className="text-white text-2xl font-bold">{stats.totalRevenue} ETH</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#282F36] text-[#A5AFC4] hover:text-white hover:bg-[#303943]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#282F36] text-[#A5AFC4] hover:text-white hover:bg-[#303943]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#282F36] text-white px-3 py-1.5 rounded-lg border border-[#303943] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            >
              <option value="recent">Recently Added</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="sales">Most Sales</option>
              <option value="revenue">Highest Revenue</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#282F36] text-[#A5AFC4] hover:text-white px-3 py-1.5 rounded-lg border border-[#303943] flex items-center gap-1.5 transition-colors text-sm"
            >
              <Filter size={16} />
              Advanced
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-[#282F36] text-[#A5AFC4] hover:text-white'
              }`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-[#282F36] text-[#A5AFC4] hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* NFT Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNFTs.map(nft => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNFTs.map(nft => (
              <NFTListItem key={nft.id} nft={nft} />
            ))}
          </div>
        )}

        {filteredNFTs.length === 0 && (
          <div className="text-center py-16 bg-[#282F36] rounded-xl border border-[#303943]">
            <div className="mx-auto w-24 h-24 bg-[#303943] rounded-full flex items-center justify-center mb-4">
              <Wallet size={32} className="text-[#A5AFC4]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs found</h3>
            <p className="text-[#A5AFC4]">Try adjusting your filters or add a new NFT</p>
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto">
              <Plus size={16} />
              Add NFT
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && selectedNFT && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-2xl p-6 w-full max-w-md border border-[#303943]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit NFT</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-[#A5AFC4] hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[#A5AFC4] text-sm mb-1">NFT Name</label>
                  <input
                    type="text"
                    className="w-full bg-[#303943] border border-[#3A444F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#A5AFC4] text-sm mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full bg-[#303943] border border-[#3A444F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#A5AFC4] text-sm mb-1">Category</label>
                  <select
                    className="w-full bg-[#303943] border border-[#3A444F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#A5AFC4] text-sm mb-1">Status</label>
                  <select
                    className="w-full bg-[#303943] border border-[#3A444F] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={editForm.status}
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  >
                    {statuses.filter(s => s !== 'All').map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verified"
                    className="w-4 h-4 text-indigo-600 bg-[#303943] border-[#3A444F] rounded focus:ring-indigo-500"
                    checked={editForm.verified}
                    onChange={(e) => setEditForm({...editForm, verified: e.target.checked})}
                  />
                  <label htmlFor="verified" className="text-[#A5AFC4] text-sm">Verified Creator</label>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-[#303943] hover:bg-[#3A444F] text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}