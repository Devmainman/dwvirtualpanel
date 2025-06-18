import { useState, useEffect } from 'react';
import { ChevronRight, Search, Banknote, Check, X, Trash2, AlertTriangle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { getAdminApiBaseUrl } from '../../api/config'; // Adjust path as needed

export default function OtherInvoice() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProof, setCurrentProof] = useState('');
  const entriesPerPage = 10;

  // Fetch invoices from API
  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const adminApiUrl = await getAdminApiBaseUrl(token);
      const response = await fetch(
        `${adminApiUrl}/invoices?page=${currentPage}&limit=${entriesPerPage}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }
      
      const data = await response.json();
      setInvoices(data.results.map(invoice => ({
        ...invoice,
        date: new Date(invoice.date)
      })));
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchTerm]);

  const handleStatusChange = async (id, status) => {
    try {
      const adminApiUrl = await getAdminApiBaseUrl(token);
      const response = await fetch(`${adminApiUrl}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }
      
      fetchInvoices(); // Refresh data
    } catch (err) {
      setError(err.message);
      console.error('Error updating status:', err);
    }
  };

  const handleDispute = async (id) => {
    const reason = prompt('Enter dispute reason:');
    if (!reason) return;
    
    try {
      const adminApiUrl = await getAdminApiBaseUrl(token);
      const response = await fetch(`${adminApiUrl}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'disputed',
          disputeReason: reason 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to dispute invoice: ${response.status}`);
      }
      
      fetchInvoices(); // Refresh data
    } catch (err) {
      setError(err.message);
      console.error('Error disputing invoice:', err);
    }
  };

  const resolveDispute = async (id, status) => {
    try {
      const adminApiUrl = await getAdminApiBaseUrl(token);
      const response = await fetch(`${adminApiUrl}/invoices/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status,
          disputeReason: '' // Clear dispute reason
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to resolve dispute: ${response.status}`);
      }
      
      fetchInvoices(); // Refresh data
    } catch (err) {
      setError(err.message);
      console.error('Error resolving dispute:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      const adminApiUrl = await getAdminApiBaseUrl(token);
      const response = await fetch(`${adminApiUrl}/invoices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete invoice: ${response.status}`);
      }
      
      // If we're on the last page and deleting the only item, go to previous page
      if (invoices.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchInvoices();
      }
    } catch (err) {
      setError(err.message);
      console.error('Error deleting invoice:', err);
    }
  };

  const viewPaymentProof = (proofUrl) => {
    setCurrentProof(proofUrl);
    setShowProofModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-900 text-green-100';
      case 'pending':
        return 'bg-yellow-900 text-yellow-100';
      case 'rejected':
        return 'bg-red-900 text-red-100';
      case 'disputed':
        return 'bg-purple-900 text-purple-100';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Calculate showing range
  const firstItem = (currentPage - 1) * entriesPerPage + 1;
  const lastItem = Math.min(currentPage * entriesPerPage, totalItems);

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 text-[#A5AFC4]">
      {/* Payment Proof Modal */}
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
              <img 
                src={currentProof} 
                alt="Payment Proof" 
                className="w-full h-auto rounded-md border border-[#3A4451]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentNode.innerHTML = `
                    <div class="bg-gray-800 border border-dashed border-gray-700 rounded-md w-full h-64 flex items-center justify-center">
                      <p class="text-gray-500">Failed to load image</p>
                    </div>
                  `;
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-[#282F36] p-4 rounded-sm border border-[#2F3944]">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Manage Other Invoices</h1>
          <span className="text-sm text-[#6B7280]">
            Showing {totalItems} entries
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Other Invoices</span>
        </div>
      </div>

      {/* Search and Error */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#A5AFC4]" />
          <input
            type="text"
            placeholder="Search invoices..."
            className="bg-[#303943] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-[#3A4451]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
          />
        </div>
        
        {error && (
          <div className="flex-1 bg-red-900/30 border border-red-700 rounded-md px-4 py-2 text-red-300">
            Error: {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 text-red-500 hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3A4451]">
            <thead className="bg-[#303943]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Account ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase">Payment Proof</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <Loader className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                    <p className="mt-2 text-[#A5AFC4]">Loading invoices...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-[#A5AFC4]">
                    {searchTerm ? 'No invoices match your search' : 'No invoices found'}
                  </td>
                </tr>
              ) : (
                invoices.map(invoice => (
                  <tr key={invoice._id} className="hover:bg-[#303943]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">{invoice._id.slice(-6)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">{invoice.accountId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#aab8c5]">{invoice.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      <div className="flex items-center">
                        <Banknote className="h-4 w-4 mr-2 text-[#6B7280]" />
                        {invoice.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#aab8c5]">
                      {invoice.amount.toLocaleString()} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.entity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        {invoice.status === 'disputed' && ' (disputed)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => viewPaymentProof(invoice.paymentProof)}
                        className="px-3 py-1 rounded-md bg-blue-900 text-blue-100 text-xs font-medium hover:bg-blue-800"
                      >
                        View Proof
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {invoice.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(invoice._id, 'approved')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(invoice._id, 'rejected')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDispute(invoice._id)}
                              className="p-1.5 rounded-md bg-purple-900 text-purple-100 hover:bg-purple-800"
                              title="Dispute"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {invoice.status === 'disputed' && (
                          <>
                            <button
                              onClick={() => resolveDispute(invoice._id, 'approved')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Resolve (Approve)"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => resolveDispute(invoice._id, 'rejected')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Resolve (Reject)"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDelete(invoice._id)}
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#303943] border-t border-[#3A4451] flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-[#A5AFC4]">
            Showing {firstItem} to {lastItem} of {totalItems} entries
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-1 rounded bg-[#3A4451] text-[#A5AFC4] disabled:opacity-50 hover:bg-[#4A5568]"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-[#A5AFC4]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-1 rounded bg-[#3A4451] text-[#A5AFC4] disabled:opacity-50 hover:bg-[#4A5568]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}