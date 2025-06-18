import { useState } from 'react';
import { Search, Trash2, Plus, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

// Mock data
const mockUsers = [
  { accountId: 'ACC1001', fullName: 'John Doe' },
  { accountId: 'ACC1002', fullName: 'Jane Smith' },
  { accountId: 'ACC1003', fullName: 'Bob Johnson' },
  { accountId: 'ACC1004', fullName: 'Alice Williams' },
];

const mockTokens = [
  { id: '1', status: 'Unused', date: new Date('2023-05-15'), accountId: 'ACC1001', fullName: 'John Doe', token: 'XKJ9-7H2P-4LQ1' },
  { id: '2', status: 'Used', date: new Date('2023-05-14'), accountId: 'ACC1002', fullName: 'Jane Smith', token: 'M3N8-B5V7-C9X2' },
  { id: '3', status: 'Unused', date: new Date('2023-05-13'), accountId: 'ACC1003', fullName: 'Bob Johnson', token: 'Z1Y4-W6U8-T0R3' },
];

export default function WithdrawalToken() {
  const [tokens, setTokens] = useState(mockTokens);
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Generate a random token
  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
      if ([3, 7].includes(i)) token += '-';
    }
    return token;
  };

  // Create new token
  const handleCreateToken = () => {
    if (!selectedUser) return;
    
    const user = users.find(u => u.accountId === selectedUser);
    const newToken = {
      id: Date.now().toString(),
      status: 'Unused',
      date: new Date(),
      accountId: user.accountId,
      fullName: user.fullName,
      token: generateToken()
    };
    
    setTokens([newToken, ...tokens]);
    setIsModalOpen(false);
    setSelectedUser('');
  };

  // Delete token
  const handleDeleteToken = (id) => {
    setTokens(tokens.filter(token => token.id !== id));
  };

  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token =>
    token.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTokens.length / rowsPerPage);
  const currentTokens = filteredTokens.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Withdrawal Tokens</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{tokens.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Tokens</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        {/* Search */}
        <div className="relative mb-4 md:mb-0 w-full md:w-1/2">
          <div className="absolute left-3 top-3">
            <Search className="h-4 w-4 text-[#6B7280]" />
          </div>
          <input
            type="text"
            placeholder="Search tokens..."
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-150"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Token
        </button>
      </div>

      {/* Tokens Table */}
      <div className="bg-[#282F36] rounded-lg shadow overflow-x-auto border border-[#2F3944]">
        <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
            {currentTokens.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <Search className="h-10 w-10 mb-2" />
                    <p>No tokens found</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentTokens.map((token) => (
                <tr key={token.id} className="hover:bg-[#303943] transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      token.status === 'Used' ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'
                    }`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                    {token.date.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                    {token.accountId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                    {token.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4] font-mono">
                    {token.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteToken(token.id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-150"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6 text-[#A5AFC4]">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(parseInt(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
            className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] text-sm rounded-md px-2 py-1"
          >
            {[5, 10, 15, 20].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-[#3A4451] disabled:opacity-50 transition-colors duration-150"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">{currentPage} of {totalPages || 1}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded hover:bg-[#3A4451] disabled:opacity-50 transition-colors duration-150"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Create Token Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md border border-[#3A4451]">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#aab8c5]">Create Withdrawal Token</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#A5AFC4] mb-2">Select User</label>
                <div className="relative">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="block appearance-none w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] py-2 px-3 pr-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.accountId} value={user.accountId}>
                        {user.fullName} ({user.accountId})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[#6B7280]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#3A4451] text-[#A5AFC4] rounded-md hover:bg-[#303943] transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateToken}
                  disabled={!selectedUser}
                  className={`px-4 py-2 rounded-md flex items-center transition-colors duration-150 ${
                    selectedUser ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#3A4451] text-[#6B7280] cursor-not-allowed'
                  }`}
                >
                  Create Token
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}