// src/pages/upgrade-invoice/UpgradeInvoice.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, Search, Check, X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/config';

export default function UpgradeInvoice() {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage, setInvoicesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProof, setCurrentProof] = useState('');
  const [currentReceipt, setCurrentReceipt] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch upgrade invoices
  useEffect(() => {
    const fetchUpgradeInvoices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/upgradeinvoices/admin`, {
          params: {
            page: currentPage,
            limit: invoicesPerPage,
            search: searchTerm
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setInvoices(response.data.invoices);
        setTotalInvoices(response.data.total);
      } catch (err) {
        console.error('Error fetching upgrade invoices:', err);
        setError('Failed to fetch upgrade invoices');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUpgradeInvoices();
    }
  }, [token, currentPage, invoicesPerPage, searchTerm]);

  const updateInvoiceStatus = async (id, action, disputeReason = '') => {
    try {
      await axios.patch(
        `${API_BASE_URL}/upgradeinvoices/admin/${id}/status`,
        { action, disputeReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh invoices after update
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { 
          ...inv, 
          status: action === 'approve' || action === 'resolve-approve' ? 'approved' : 
                  action === 'reject' || action === 'resolve-reject' ? 'rejected' : 
                  action === 'dispute' ? 'disputed' : inv.status,
          disputed: action === 'dispute',
          disputeReason: action === 'dispute' ? disputeReason : ''
        } : inv
      ));
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Failed to update invoice status');
    }
  };

  const deleteInvoice = async (id, paymentProof) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/upgradeinvoices/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove from local state
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Failed to delete invoice');
    }
  };

  const viewPaymentProof = (proofUrl) => {
    setCurrentProof(`${API_BASE_URL}${proofUrl}`);
    setShowProofModal(true);
  };

  const viewReceipt = (receipt) => {
    if (receipt) {
      setCurrentReceipt(`${API_BASE_URL}${receipt}`);
      setShowReceiptModal(true);
    }
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

  // Calculate total pages
  const totalPages = Math.ceil(totalInvoices / invoicesPerPage);

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

      {/* Receipt Modal */}
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
              {currentReceipt ? (
                <img 
                  src={currentReceipt} 
                  alt="Receipt" 
                  className="w-full h-auto rounded-md border border-[#3A4451]"
                />
              ) : (
                <div className="text-center py-10 text-[#A5AFC4]">
                  No receipt available
                </div>
              )}
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded-md">
          {error}
          <button 
            onClick={() => setError('')} 
            className="float-right"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Manage Upgrade Invoices</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Upgrade Invoices</span>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] mb-6">
        <div className="p-4 border-b border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <span className="text-sm text-[#A5AFC4] mr-2">Show</span>
            <select 
              className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded text-sm"
              value={invoicesPerPage}
              onChange={(e) => {
                setInvoicesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Proof</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center">
                    <Loader2 className="animate-spin mx-auto h-8 w-8 text-blue-500" />
                    <p className="mt-2 text-[#A5AFC4]">Loading upgrade invoices...</p>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-[#A5AFC4]">
                    No upgrade invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[#303943] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {new Date(invoice.date).toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {invoice.package.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4] font-mono">
                      {invoice.user.accountId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {invoice.user.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {invoice.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#A5AFC4]">
                      {invoice.amount} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                        {invoice.disputed && ' (disputed)'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => viewReceipt(invoice.receipt)}
                        className="px-3 py-1 rounded-md bg-[#303943] text-blue-100 text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
                        disabled={!invoice.receipt}
                      >
                        {invoice.receipt ? 'View Receipt' : 'N/A'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {invoice.status === 'pending' && !invoice.disputed && (
                          <>
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'approve')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'reject')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter dispute reason:');
                                if (reason) {
                                  updateInvoiceStatus(invoice.id, 'dispute', reason);
                                }
                              }}
                              className="p-1.5 rounded-md bg-purple-900 text-purple-100 hover:bg-purple-800"
                              title="Dispute"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {invoice.disputed && (
                          <>
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'resolve-approve')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Resolve (Approve)"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateInvoiceStatus(invoice.id, 'resolve-reject')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Resolve (Reject)"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => deleteInvoice(invoice.id, invoice.paymentProof)}
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
        <div className="px-4 py-3 bg-[#303943] border-t border-[#3A4451] flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-[#A5AFC4] mb-2 md:mb-0">
            Showing {(currentPage - 1) * invoicesPerPage + 1} to {Math.min(currentPage * invoicesPerPage, totalInvoices)} of {totalInvoices} entries
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 rounded-md bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] text-sm hover:bg-[#303943] disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}