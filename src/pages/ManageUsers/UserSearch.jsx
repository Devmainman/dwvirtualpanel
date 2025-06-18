import { Search, Trash2, Lock, MoreHorizontal, ChevronDown, Filter } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const UserSearch = ({ 
  searchTerm, 
  setSearchTerm,
  selectedCount,
  onClearAccounts,
  onBlockUsers,
  onFilterChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const filterRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
    onFilterChange(filter);
  };

  const moreActions = [
    {
      icon: MoreHorizontal,
      label: 'Turn Off Trades',
      action: () => alert('Trades turned off for selected users')
    },
    {
      icon: MoreHorizontal,
      label: 'Turn On Upgrades',
      action: () => alert('Upgrades enabled for selected users')
    },
    {
      icon: Lock,
      label: 'Lock Withdrawal',
      action: () => alert('Withdrawals locked for selected users')
    },
    {
      icon: MoreHorizontal,
      label: 'Assign Form',
      action: () => alert('Form assignment initiated')
    },
    {
      icon: Trash2,
      label: 'Delete Account',
      action: onClearAccounts
    }
  ];

  return (
    <div className="bg-[#282F36] rounded-sm border border-[#2F3944] p-3 md:p-5 mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
          <input
            type="text"
            placeholder="Search users..."
            className="bg-[#303943] text-[#A5AFC4] pl-10 pr-4 py-2 md:py-3 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
         
        <div className="flex flex-wrap gap-2 justify-end">
          <button 
            onClick={onClearAccounts}
            disabled={selectedCount === 0}
            className={`bg-red-600 hover:bg-red-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
              selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Clear Account</span>
          </button>
          <button 
            onClick={onBlockUsers}
            disabled={selectedCount === 0}
            className={`bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
              selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Block</span>
          </button>
          
          {/* Filter Dropdown */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Filter</span>
              <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 ml-1 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#282F36] rounded-md shadow-lg z-20 border border-[#2F3944]">
                <div className="py-1">
                  <button
                    onClick={() => handleFilterSelect('all')}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'text-[#A5AFC4] hover:bg-[#303943]'}`}
                  >
                    All Accounts
                  </button>
                  <button
                    onClick={() => handleFilterSelect('active')}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeFilter === 'active' ? 'bg-green-500 text-white' : 'text-[#A5AFC4] hover:bg-[#303943]'}`}
                  >
                    Active Accounts
                  </button>
                  <button
                    onClick={() => handleFilterSelect('inactive')}
                    className={`block w-full text-left px-4 py-2 text-sm ${activeFilter === 'inactive' ? 'bg-red-500 text-white' : 'text-[#A5AFC4] hover:bg-[#303943]'}`}
                  >
                    Blocked Accounts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* More Actions Dropdown */}
          <div className="relative" ref={moreRef}>
            <button 
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">More</span>
              <ChevronDown className={`h-3 w-3 md:h-4 md:w-4 ml-1 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#282F36] rounded-md shadow-lg z-20 border border-[#2F3944]">
                <div className="py-1">
                  {moreActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setIsMoreOpen(false);
                      }}
                      disabled={selectedCount === 0 && index !== moreActions.length - 1}
                      className={`flex items-center w-full text-left px-4 py-2 text-sm text-[#A5AFC4] hover:bg-[#303943] ${
                        selectedCount === 0 && index !== moreActions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <action.icon className="h-4 w-4 mr-3" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearch;