import { useState } from 'react';
import { 
  Search, User, Mail, Phone, Globe, Wallet, Calendar, 
  Lock, Unlock, MessageSquare, Edit, Trash2, CreditCard,
  ArrowUp, ArrowDown, RefreshCw, Key, FileText, UserCheck,
  ChevronRight, Filter, MoreHorizontal, Settings, AlertTriangle, 
  Eye, Download, Upload, Shield
} from 'lucide-react';

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 'user_001',
      status: 'Active',
      accountId: 'ACC123456',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      mobile: '+2348012345678',
      country: 'Nigeria',
      currency: 'NGN',
      accountType: 'Basic',
      walletBalance: 125000.50,
      joinedDate: new Date('2023-01-15')
    },
    {
      id: 'user_002',
      status: 'Active',
      accountId: 'ACC789012',
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      mobile: '+2348098765432',
      country: 'Nigeria',
      currency: 'NGN',
      accountType: 'Premium',
      walletBalance: 87500.00,
      joinedDate: new Date('2023-03-22')
    },
    {
      id: 'user_003',
      status: 'Inactive',
      accountId: 'ACC345678',
      fullName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      mobile: '+234805551234',
      country: 'Nigeria',
      currency: 'NGN',
      accountType: 'Basic',
      walletBalance: 25000.75,
      joinedDate: new Date('2023-05-10')
    }
  ]);

  // Action handlers
  const handleBlockUser = (userId) => console.log(`Block user ${userId}`);
  const handleClearAccount = (userId) => console.log(`Clear account ${userId}`);
  const handleTurnOffTrade = (userId) => console.log(`Turn off trade for ${userId}`);
  const handleDeleteUser = (userId) => console.log(`Delete user ${userId}`);
  const handleSendMessage = (userId) => console.log(`Send message to ${userId}`);
  const handleEditUser = (userId) => console.log(`Edit user ${userId}`);
  const handleResetPassword = (userId) => console.log(`Reset password for ${userId}`);
  const handleChangeCurrency = (userId) => console.log(`Change currency for ${userId}`);
  const handleCreditDebit = (userId) => console.log(`Credit/Debit account ${userId}`);
  const handleAssignForm = (userId) => console.log(`Assign form to ${userId}`);
  const handleChangeAccountType = (userId) => console.log(`Change account type for ${userId}`);
  const handleAssignInvoice = (userId) => console.log(`Assign invoice to ${userId}`);
  const handleLockWithdrawal = (userId) => console.log(`Lock withdrawal for ${userId}`);
  const handleTurnOnUpgrade = (userId) => console.log(`Turn on upgrade for ${userId}`);
  const handleGainAccess = (userId) => console.log(`Gain access to ${userId}`);
  const handleUpdateSignal = (userId) => console.log(`Update signal strength for ${userId}`);

  const toggleUserExpansion = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.accountId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ActionButton = ({ icon, label, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`bg-${color}-600 hover:bg-${color}-700 text-white p-1 md:p-2 rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-200 h-14 md:h-16 shadow-md hover:shadow-lg min-w-[70px]`}
    >
      <div className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="mt-1 text-center px-1">{label}</span>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">
      {/* Page Header with improved styling */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-4 md:mb-6 bg-[#282F36] p-3 md:p-4 rounded-sm">
        <div className="flex items-center space-x-2 mb-2 md:mb-0">
          <h1 className="text-xl md:text-2xl font-semibold text-[#aab8c5]">Manage Users</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{users.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-2 py-1 md:px-3 rounded-full text-xs md:text-sm">
          <span>Dashboard</span>
          <ChevronRight size={14} className="text-gray-500" />
          <span className="font-medium">Users</span>
        </div>
      </div>

      {/* Search and Quick Actions with improved styling */}
      <div className="bg-[#282F36] rounded-sm border border-[#2F3944] p-3 md:p-5 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-[#303943] text-[#A5AFC4] pl-10 pr-4 py-2 md:py-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
           
          <div className="flex flex-wrap gap-2 justify-end">
            <button 
              onClick={() => console.log('Assign Popup')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <UserCheck className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Assign Popup</span>
            </button>
            <button 
              onClick={() => console.log('Clear Account')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Clear Account</span>
            </button>
            <button 
              onClick={() => console.log('Block')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Block</span>
            </button>
            <button 
              onClick={() => console.log('Filter')}
              className="bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Filter className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button 
              onClick={() => console.log('More Actions')}
              className="bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <MoreHorizontal className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* User stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-[#282F36] rounded-lg shadow-md p-3 md:p-4 flex items-center">
          <div className="bg-blue-500 bg-opacity-20 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <User className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#6B7280]">Total Users</p>
            <p className="text-lg md:text-xl font-semibold text-[#A5AFC4]">{users.length}</p>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg shadow-md p-3 md:p-4 flex items-center">
          <div className="bg-green-500 bg-opacity-20 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#6B7280]">Active Users</p>
            <p className="text-lg md:text-xl font-semibold text-[#A5AFC4]">{users.filter(u => u.status === 'Active').length}</p>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg shadow-md p-3 md:p-4 flex items-center">
          <div className="bg-red-500 bg-opacity-20 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#6B7280]">Inactive Users</p>
            <p className="text-lg md:text-xl font-semibold text-[#A5AFC4]">{users.filter(u => u.status === 'Inactive').length}</p>
          </div>
        </div>
        <div className="bg-[#282F36] rounded-lg shadow-md p-3 md:p-4 flex items-center">
          <div className="bg-yellow-500 bg-opacity-20 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <Wallet className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs md:text-sm text-[#6B7280]">Total Balance</p>
            <p className="text-lg md:text-xl font-semibold text-[#A5AFC4]">
              {formatCurrency(users.reduce((sum, user) => sum + user.walletBalance, 0), 'NGN')}
            </p>
          </div>
        </div>
      </div>

      {/* User Table with improved styling */}
      <div className="bg-[#282F36] rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#303943]">
            <thead className="bg-[#303943]">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Email</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Mobile</th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Country</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#303943]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#A5AFC4]">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-[#4B5563] mb-2" />
                      <p className="text-lg font-medium">No users found</p>
                      <p className="text-[#6B7280] text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <>
                    <tr 
                      key={user.id} 
                      className={`hover:bg-[#303943] cursor-pointer transition-colors duration-150 ${expandedUser === user.id ? 'bg-[#303943]' : ''}`}
                      onClick={() => toggleUserExpansion(user.id)}
                    >
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap text-[#A5AFC4] font-mono text-sm md:text-base">{user.accountId}</td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                        <div className="font-medium text-[#A5AFC4] text-sm md:text-base">{user.fullName}</div>
                        <div className="text-xs text-[#6B7280]">{user.accountType} Account</div>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.email}</td>
                      <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.mobile}</td>
                      <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap text-[#A5AFC4] text-sm md:text-base">{user.country}</td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 md:space-x-2">
                          <button 
                            className="p-1 rounded-md bg-[#303943] text-blue-400 hover:bg-[#3A4451] transition-colors duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUser(user.id);
                            }}
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <button 
                            className="p-1 rounded-md bg-[#303943] text-yellow-400 hover:bg-[#3A4451] transition-colors duration-150"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendMessage(user.id);
                            }}
                          >
                            <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                          <button 
                            className={`p-1 rounded-md ${expandedUser === user.id ? 'bg-blue-500 text-white' : 'bg-[#303943] text-blue-400'} hover:bg-blue-600 transition-colors duration-150`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleUserExpansion(user.id);
                            }}
                          >
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded User Details with improved styling */}
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan={7} className="px-0 py-0 bg-[#303943]">
                          <div className="p-4 md:p-6 border-t-2 border-blue-500">
                            <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                              {/* Account Details */}
                              <div className="bg-[#282F36] p-4 md:p-6 rounded-lg shadow-md flex-1">
                                <h3 className="text-md md:text-lg font-medium text-[#aab8c5] mb-3 md:mb-4 flex items-center">
                                  <User className="h-4 w-4 md:h-5 md:w-5 mr-2 text-blue-500" />
                                  Account Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Account ID</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base font-mono bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded">{user.accountId}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Full Name</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded">{user.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Email</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Mail className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-500" />
                                      {user.email}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Mobile</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-500" />
                                      {user.mobile}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Country</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Globe className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-purple-500" />
                                      {user.country}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Currency</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded">{user.currency}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Account Type</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-yellow-500" />
                                      {user.accountType}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Wallet Balance</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Wallet className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-green-500" />
                                      {formatCurrency(user.walletBalance, user.currency)}
                                    </p>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <p className="text-xs md:text-sm text-[#6B7280] mb-1">Joined</p>
                                    <p className="text-[#A5AFC4] text-sm md:text-base bg-[#303943] px-2 py-1 md:px-3 md:py-2 rounded flex items-center">
                                      <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 text-blue-500" />
                                      {user.joinedDate.toLocaleDateString()} ({Math.round((new Date() - user.joinedDate) / (1000 * 60 * 60 * 24))} days ago)
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Management Actions */}
                              <div className="bg-[#282F36] p-4 md:p-6 rounded-lg shadow-md flex-1">
                                <h3 className="text-md md:text-lg font-medium text-[#aab8c5] mb-3 md:mb-4 flex items-center">
                                  <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-500" />
                                  Management Actions
                                </h3>
                                
                                {/* Action categories */}
                                <div className="mb-3 md:mb-4">
                                  <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-1 md:mb-2">Security</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                                    <ActionButton 
                                      icon={<Lock className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Block User" 
                                      color="red" 
                                      onClick={() => handleBlockUser(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<Key className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Reset Password" 
                                      color="yellow" 
                                      onClick={() => handleResetPassword(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<Lock className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Lock Withdrawal" 
                                      color="red" 
                                      onClick={() => handleLockWithdrawal(user.id)} 
                                    />
                                  </div>
                                  
                                  <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-1 md:mb-2">Account</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-3 md:mb-4">
                                    <ActionButton 
                                      icon={<User className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Change Type" 
                                      color="blue" 
                                      onClick={() => handleChangeAccountType(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<Edit className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Edit User" 
                                      color="blue" 
                                      onClick={() => handleEditUser(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<RefreshCw className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Change Currency" 
                                      color="yellow" 
                                      onClick={() => handleChangeCurrency(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<MessageSquare className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Message" 
                                      color="blue" 
                                      onClick={() => handleSendMessage(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<Trash2 className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Delete User" 
                                      color="red" 
                                      onClick={() => handleDeleteUser(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<ArrowUp className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Turn on Upgrade" 
                                      color="green" 
                                      onClick={() => handleTurnOnUpgrade(user.id)} 
                                    />
                                  </div>
                                  
                                  <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-1 md:mb-2">Financial</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
                                    <ActionButton 
                                      icon={<CreditCard className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Credit/Debit" 
                                      color="green" 
                                      onClick={() => handleCreditDebit(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<FileText className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Assign Invoice" 
                                      color="yellow" 
                                      onClick={() => handleAssignInvoice(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<Trash2 className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Clear Account" 
                                      color="red" 
                                      onClick={() => handleClearAccount(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<RefreshCw className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Turn Off Trade" 
                                      color="yellow" 
                                      onClick={() => handleTurnOffTrade(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<FileText className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Assign Form" 
                                      color="blue" 
                                      onClick={() => handleAssignForm(user.id)} 
                                    />
                                    <ActionButton 
                                      icon={<ArrowUp className="h-3 w-3 md:h-4 md:w-4" />}
                                      label="Update Signal" 
                                      color="purple" 
                                      onClick={() => handleUpdateSignal(user.id)} 
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex justify-end mt-3 md:mt-4">
                                  <button
                                    onClick={() => toggleUserExpansion(null)}
                                    className="bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] px-3 py-1 md:px-4 md:py-2 rounded-md flex items-center text-xs md:text-sm font-medium transition-all duration-200"
                                  >
                                    Close Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between bg-[#282F36] rounded-lg shadow-md p-3 md:p-4">
        <div className="text-xs md:text-sm text-[#A5AFC4] mb-2 sm:mb-0">
          Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
        </div>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button className="bg-[#303943] text-[#A5AFC4] px-2 py-1 md:px-3 rounded-md disabled:opacity-50 text-xs md:text-sm">
            Previous
          </button>
          <button className="bg-blue-600 text-white px-2 py-1 md:px-3 rounded-md text-xs md:text-sm">
            1
          </button>
          <button className="bg-[#303943] text-[#A5AFC4] px-2 py-1 md:px-3 rounded-md text-xs md:text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}