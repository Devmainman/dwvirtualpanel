import { useState, useEffect } from 'react';
import { ChevronRight, Search, Check, X, Trash2, Clock, AlertCircle, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { getAdminApiBaseUrl } from '../../api/config.js';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Withdrawal() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const fetchWithdrawals = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminApiBaseUrl = await getAdminApiBaseUrl(token);
        const response = await axios.get(`${adminApiBaseUrl}/withdrawals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const transformedWithdrawals = response.data.withdrawals.map(w => ({
          id: w._id,
          date: new Date(w.createdAt),
          accountId: w.user.accountId,
          fullName: `${w.user.firstName} ${w.user.lastName || ''}`,
          icon: w.method.icon,
          paymentMethod: w.method.title,
          amount: `${w.amount} ${w.user.currency || 'NGN'}`,
          status: w.status,
          bankName: w.details.find(d => d.label === 'Bank Name')?.value || '',
          accountName: w.details.find(d => d.label === 'Account Name')?.value || '',
          accountNumber: w.details.find(d => d.label === 'Account Number')?.value || '',
          withdrawalToken: w._id,
          receipt: w.receipt || ''
        }));
        setWithdrawals(transformedWithdrawals);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch withdrawals');
        console.error('Fetch withdrawals error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWithdrawals();
  }, [token, isAuthenticated, authLoading]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setError(null);
      const adminApiBaseUrl = await getAdminApiBaseUrl(token);
      await axios.put(
        `${adminApiBaseUrl}/withdrawals/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWithdrawals(withdrawals.map(w => 
        w.id === id ? { ...w, status: newStatus } : w
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update withdrawal status');
      console.error('Update status error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this withdrawal?')) return;
    try {
      setError(null);
      const adminApiBaseUrl = await getAdminApiBaseUrl(token);
      await axios.delete(`${adminApiBaseUrl}/withdrawals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(withdrawals.filter(w => w.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete withdrawal');
      console.error('Delete withdrawal error:', err);
    }
  };

  const handleReceiptUpload = async (withdrawalId) => {
    if (!receiptFile) {
      setError('Please select a receipt file');
      return;
    }
    try {
      setError(null);
      const adminApiBaseUrl = await getAdminApiBaseUrl(token);
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      const response = await axios.post(
        `${adminApiBaseUrl}/withdrawals/${withdrawalId}/receipt`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      setWithdrawals(withdrawals.map(w => 
        w.id === withdrawalId ? { ...w, receipt: response.data.receipt } : w
      ));
      setReceiptFile(null);
      alert('Receipt uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload receipt');
      console.error('Upload receipt error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-900 text-green-100';
      case 'pending':
        return 'bg-yellow-900 text-yellow-100';
      case 'rejected':
        return 'bg-red-900 text-red-100';
      case 'processing':
        return 'bg-blue-900 text-blue-100';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case 'processing':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedWithdrawal(null);
    setReceiptFile(null);
  };

  const viewReceipt = (receipt) => {
    setCurrentReceipt(receipt);
    setShowReceiptModal(true);
  };

  if (authLoading) {
    return <div className="text-[#A5AFC4] p-6">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-red-500 p-6">Please log in to view withdrawals</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      {showReceiptModal && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#3A4451]">
              <h3 className="text-lg font-medium text-[#aab8c5]">Receipt</h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <img 
                src={currentReceipt} 
                alt="Payment Proof" 
                className="w-full h-auto rounded-md border border-[#3A4451]"
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Manage Withdrawal</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Withdrawals</span>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-[#A5AFC4] mb-4">Loading withdrawals...</div>}

      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] mb-6">
        <div className="p-4 border-b border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-sm text-[#A5AFC4] mr-2">Show</span>
            <select className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded text-sm">
              <option>10 entries</option>
              <option>25 entries</option>
              <option>50 entries</option>
            </select>
            <span className="text-sm text-[#A5AFC4] ml-2">entries</span>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3A4451]">
            <thead className="bg-[#303943]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {withdrawals.length === 0 && !loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-[#A5AFC4]">
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                withdrawals
                  .filter(w => 
                    w.accountId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    w.fullName.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((withdrawal, index) => (
                    <tr key={withdrawal.id} className="hover:bg-[#303943] transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                        {withdrawal.date.toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4] font-mono">
                        {withdrawal.accountId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                        {withdrawal.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                        {withdrawal.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                        {withdrawal.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                        <button
                          onClick={() => openDetailsModal(withdrawal)}
                          className="px-3 py-1 rounded-md bg-blue-900 text-blue-100 text-xs font-medium hover:bg-blue-800"
                        >
                          View Details
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {withdrawal.receipt && (
                          <button 
                            onClick={() => viewReceipt(withdrawal.receipt)}
                            className="px-3 py-1 rounded-md bg-[#303943] text-blue-100 text-xs font-medium hover:bg-gray-800"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(withdrawal.id, 'completed')}
                                className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(withdrawal.id, 'rejected')}
                                className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                                title="Reject"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(withdrawal.id)}
                            className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-[#303943] border-t border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-[#A5AFC4] mb-2 md:mb-0">
            Showing 1 to {withdrawals.length} of {withdrawals.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              disabled={true}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              disabled={true}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#A5AFC4]">Withdrawal Details</h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-[#A5AFC4] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#6B7280]">Bank Name</p>
                    <p className="text-[#A5AFC4]">{selectedWithdrawal.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Account Name</p>
                    <p className="text-[#A5AFC4]">{selectedWithdrawal.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Account Number</p>
                    <p className="text-[#A5AFC4]">{selectedWithdrawal.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Withdrawal Token</p>
                    <p className="text-[#A5AFC4]">{selectedWithdrawal.withdrawalToken}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280]">Upload Receipt</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    className="mt-1 block w-full text-[#A5AFC4] bg-[#303943] border border-[#3A4451] rounded-md p-2"
                  />
                  <button
                    onClick={() => handleReceiptUpload(selectedWithdrawal.id)}
                    className="mt-2 px-4 py-2 bg-blue-900 text-blue-100 rounded-md hover:bg-blue-800"
                    disabled={!receiptFile}
                  >
                    Upload Receipt
                  </button>
                </div>
                {selectedWithdrawal.receipt && (
                  <div>
                    <p className="text-sm text-[#6B7280]">Current Receipt</p>
                    <button
                      onClick={() => viewReceipt(selectedWithdrawal.receipt)}
                      className="mt-1 px-3 py-1 rounded-md bg-[#303943] text-blue-100 text-xs font-medium hover:bg-gray-800"
                    >
                      View Receipt
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}