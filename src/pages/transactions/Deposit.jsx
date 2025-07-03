import { useState, useEffect } from 'react';
import { ChevronRight, Search, Check, X, Trash2, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { STATIC_BASE_URL } from '../../api/config';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Deposit() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProof, setCurrentProof] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deposits', {
        params: {
          page: currentPage,
          limit: entriesPerPage,
          search: searchTerm
        }
      });

      setDeposits(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = '/admin/login';
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch deposits');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/deposits/${id}/status`, { status: newStatus });
      setDeposits(deposits.map(deposit => 
        deposit.id === id ? { ...deposit, status: newStatus } : deposit
      ));
      toast.success(`Deposit ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      try {
        await api.delete(`/deposits/${id}`);
        setDeposits(deposits.filter(deposit => deposit.id !== id));
        toast.success('Deposit deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete deposit');
      }
    }
  };

  const handleDeleteFile = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment proof?')) {
      try {
        await api.delete(`/deposits/${id}/proof`);
        setDeposits(deposits.map(deposit => 
          deposit.id === id ? { ...deposit, proofUrl: '' } : deposit
        ));
        toast.success('Payment proof deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete payment proof');
      }
    }
  };

  const viewPaymentProof = (proofUrl) => {
    console.log('Viewing payment proof URL:', proofUrl);
    console.log('Full image src:', `${API_BASE_URL}${proofUrl}`);
    setCurrentProof(proofUrl);
    setShowProofModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-900 text-green-100';
      case 'pending': return 'bg-yellow-900 text-yellow-100';
      case 'rejected': return 'bg-red-900 text-red-100';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'pending': return <Clock className="h-4 w-4 mr-1" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const formatCurrency = (amount, currency) => {
    if (!amount || !currency) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      {/* Proof View Modal */}
      {showProofModal && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#3A4451]">
              <h3 className="text-lg font-medium text-[#aab8c5]">Payment Proof</h3>
              <button 
                onClick={() => setShowProofModal(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
            {console.log('Modal image src:', `${STATIC_BASE_URL}/Uploads${currentProof}`)}
            <img 
               src={`${STATIC_BASE_URL}/Uploads${currentProof}`}
              alt="Payment Proof"
              className="w-full h-auto rounded-md border border-[#3A4451]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/600x400?text=Proof+Not+Available';
              }}
            />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Manage Deposit</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Deposit</span>
        </div>
      </div>

      {/* Deposit List */}
      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] mb-6">
        <div className="p-4 border-b border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-sm text-[#A5AFC4] mr-2">Show</span>
            <select 
              className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded text-sm"
              value={entriesPerPage}
              onChange={handleEntriesPerPageChange}
            >
              <option value={10}>10 entries</option>
              <option value={25}>25 entries</option>
              <option value={50}>50 entries</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">s/N</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Proof</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-[#A5AFC4]">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-[#A5AFC4]">
                    No deposits found
                  </td>
                </tr>
              ) : (
                deposits.map((deposit, index) => (
                  <tr key={deposit.id} className="hover:bg-[#303943] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {(currentPage - 1) * entriesPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                        {getStatusIcon(deposit.status)}
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </span>
                      {deposit.reason && (
                        <div className="text-xs text-red-400 mt-1">{deposit.reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {new Date(deposit.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4] font-mono">
                      {deposit.accountId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {deposit.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {deposit.icon}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {deposit.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {formatCurrency(deposit.amount, deposit.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => viewPaymentProof(deposit.proofUrl)}
                        className="px-3 py-1 rounded-md bg-blue-900 text-blue-100 text-xs font-medium hover:bg-blue-800"
                        disabled={!deposit.proofUrl}
                      >
                        View Proof
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {deposit.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(deposit.id, 'approved')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(deposit.id, 'rejected')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteFile(deposit.id)}
                          className="p-1.5 rounded-md bg-yellow-900 text-yellow-100 hover:bg-yellow-800"
                          title="Delete File"
                          disabled={!deposit.proofUrl}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(deposit.id)}
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
            Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, deposits.length)} of {deposits.length} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}