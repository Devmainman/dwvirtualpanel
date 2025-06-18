import { useState } from 'react';
import { ChevronRight, Search, Check, X, Trash2, AlertTriangle, CreditCard, Lock, RefreshCw, Eye, Bell, Zap } from 'lucide-react';

export default function CardInvoice() {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      date: new Date('2024-05-10T14:30:00'),
      cardType: 'Virtual Visa',
      last4: '7892',
      expiry: '12/25',
      accountId: 'USR8823567123',
      fullName: 'Alexandra Johnson',
      paymentMethod: 'Bank Transfer',
      amount: '25 USD', // Card issuance fee
      status: 'active',
      paymentProof: 'https://via.placeholder.com/600x400?text=Payment+Proof',
      receipt: 'https://via.placeholder.com/600x400?text=Receipt',
      cardStatus: 'active',
      lastUsed: new Date('2024-06-15T09:45:00'),
      spendingLimit: '5000 USD',
      disputed: false
    },
    {
      id: 2,
      date: new Date('2024-06-05T11:20:00'),
      cardType: 'Physical Mastercard',
      last4: '4512',
      expiry: '10/26',
      accountId: 'USR4598236712',
      fullName: 'Michael Chen',
      paymentMethod: 'Crypto',
      amount: '50 USD',
      status: 'pending',
      paymentProof: 'https://via.placeholder.com/600x400?text=Payment+Proof',
      receipt: 'https://via.placeholder.com/600x400?text=Receipt',
      cardStatus: 'pending_activation',
      lastUsed: null,
      spendingLimit: '10000 USD',
      disputed: false
    },
    {
      id: 3,
      date: new Date('2024-06-12T16:45:00'),
      cardType: 'Virtual Debit',
      last4: '9821',
      expiry: '08/25',
      accountId: 'USR7734598123',
      fullName: 'Sarah Williams',
      paymentMethod: 'Credit Card',
      amount: '10 USD',
      status: 'blocked',
      paymentProof: 'https://via.placeholder.com/600x400?text=Payment+Proof',
      receipt: 'https://via.placeholder.com/600x400?text=Receipt',
      cardStatus: 'blocked',
      lastUsed: new Date('2024-06-10T12:30:00'),
      spendingLimit: '2000 USD',
      disputed: true,
      disputeReason: 'Unauthorized transaction'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProof, setCurrentProof] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState('');
  const [showCardActionModal, setShowCardActionModal] = useState(false);
  const [currentCardAction, setCurrentCardAction] = useState('');
  const [currentCardId, setCurrentCardId] = useState(null);

  // Handle invoice actions (approve/reject/dispute)
  const handleAction = (id, action) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { ...invoice, status: action } : invoice
    ));
  };

  // Delete an invoice
  const handleDelete = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  // Dispute an invoice
  const handleDispute = (id) => {
    if (disputeReason.trim() === '') {
      alert('Please enter a dispute reason');
      return;
    }
    
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { 
        ...invoice, 
        disputed: true,
        status: 'disputed',
        disputeReason 
      } : invoice
    ));
    
    setDisputeReason('');
  };

  // Resolve a dispute
  const resolveDispute = (id, resolution) => {
    setInvoices(invoices.map(invoice => 
      invoice.id === id ? { 
        ...invoice, 
        disputed: false,
        status: resolution,
        disputeReason: '' 
      } : invoice
    ));
  };

  // View payment proof
  const viewPaymentProof = (proofUrl) => {
    setCurrentProof(proofUrl);
    setShowProofModal(true);
  };

  // View receipt
  const viewReceipt = (receiptUrl) => {
    setCurrentReceipt(receiptUrl);
    setShowReceiptModal(true);
  };

  // Manage card (block/unblock/replace)
  const manageCard = (id, action) => {
    setCurrentCardId(id);
    setCurrentCardAction(action);
    setShowCardActionModal(true);
    
    // Simulate API call
    setTimeout(() => {
      setInvoices(invoices.map(invoice => {
        if (invoice.id === id) {
          return {
            ...invoice,
            cardStatus: action === 'block' ? 'blocked' : 
                       action === 'unblock' ? 'active' : 
                       action === 'replace' ? 'pending_replacement' : invoice.cardStatus,
            status: action === 'block' ? 'blocked' : 
                   action === 'unblock' ? 'active' : invoice.status
          };
        }
        return invoice;
      }));
      setShowCardActionModal(false);
    }, 1000);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active':
        return 'bg-green-900 text-green-100';
      case 'pending':
        return 'bg-yellow-900 text-yellow-100';
      case 'blocked':
        return 'bg-red-900 text-red-100';
      case 'disputed':
        return 'bg-purple-900 text-purple-100';
      case 'expired':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-blue-900 text-blue-100';
    }
  };

  // Get card status color
  const getCardStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active':
        return 'bg-green-900 text-green-100';
      case 'blocked':
        return 'bg-red-900 text-red-100';
      case 'pending_activation':
        return 'bg-yellow-900 text-yellow-100';
      case 'pending_replacement':
        return 'bg-blue-900 text-blue-100';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  // Filter invoices based on search
  const filteredInvoices = invoices.filter(invoice => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.cardType.toLowerCase().includes(searchLower) ||
      invoice.accountId.toLowerCase().includes(searchLower) ||
      invoice.fullName.toLowerCase().includes(searchLower) ||
      invoice.status.toLowerCase().includes(searchLower) ||
      invoice.last4.includes(searchTerm)
    );
  });

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
              <img 
                src={currentReceipt} 
                alt="Receipt" 
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

      {/* Card Action Modal */}
      {showCardActionModal && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg max-w-md w-full overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-[#3A4451]">
              <h3 className="text-lg font-medium text-[#aab8c5]">
                {currentCardAction === 'block' && 'Block Card'}
                {currentCardAction === 'unblock' && 'Unblock Card'}
                {currentCardAction === 'replace' && 'Replace Card'}
              </h3>
              <button 
                onClick={() => setShowCardActionModal(false)}
                className="text-[#A5AFC4] hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[#A5AFC4] mb-4">
                {currentCardAction === 'block' && 'Are you sure you want to block this card?'}
                {currentCardAction === 'unblock' && 'Are you sure you want to unblock this card?'}
                {currentCardAction === 'replace' && 'This will issue a new card and deactivate the current one. Proceed?'}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCardActionModal(false)}
                  className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => manageCard(currentCardId, currentCardAction)}
                  className={`px-4 py-2 rounded-md ${
                    currentCardAction === 'block' ? 'bg-red-900 text-red-100 hover:bg-red-800' :
                    currentCardAction === 'unblock' ? 'bg-green-900 text-green-100 hover:bg-green-800' :
                    'bg-blue-900 text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Card Invoices Management</h1>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Card Invoices</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#282F36] border border-[#3A4451] p-4 rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A5AFC4]">Total Cards</p>
              <p className="text-2xl font-semibold text-[#aab8c5]">{invoices.length}</p>
            </div>
            <div className="p-2 bg-blue-900/30 rounded-full">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#282F36] border border-[#3A4451] p-4 rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A5AFC4]">Active Cards</p>
              <p className="text-2xl font-semibold text-green-400">
                {invoices.filter(i => i.status === 'active').length}
              </p>
            </div>
            <div className="p-2 bg-green-900/30 rounded-full">
              <Check className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#282F36] border border-[#3A4451] p-4 rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A5AFC4]">Blocked Cards</p>
              <p className="text-2xl font-semibold text-red-400">
                {invoices.filter(i => i.status === 'blocked').length}
              </p>
            </div>
            <div className="p-2 bg-red-900/30 rounded-full">
              <Lock className="h-5 w-5 text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-[#282F36] border border-[#3A4451] p-4 rounded-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#A5AFC4]">Revenue</p>
              <p className="text-2xl font-semibold text-[#aab8c5]">
                {invoices.reduce((sum, invoice) => {
                  const amount = parseFloat(invoice.amount);
                  return sum + (isNaN(amount) ? 0 : amount);
                }, 0)} USD
              </p>
            </div>
            <div className="p-2 bg-purple-900/30 rounded-full">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Reason Input */}
      {disputeReason !== '' && (
        <div className="mb-4 p-4 bg-[#282F36] border border-[#3A4451] rounded-sm">
          <h4 className="text-sm font-medium text-[#aab8c5] mb-2">Dispute Reason</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Enter dispute reason..."
              className="flex-1 bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md"
            />
            <button
              onClick={() => setDisputeReason('')}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Invoice List */}
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
              placeholder="Search cards, users..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Card</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Issued On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Card Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Payment Proof</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Receipt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-[#A5AFC4]">
                    No card invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[#303943] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-900/30 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#aab8c5]">{invoice.cardType}</div>
                          <div className="text-xs text-[#A5AFC4]">**** **** **** {invoice.last4}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#aab8c5]">{invoice.fullName}</div>
                      <div className="text-xs text-[#A5AFC4] font-mono">{invoice.accountId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.date.toLocaleDateString('en-GB', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.expiry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.amount}
                      <div className="text-xs mt-1">
                        {invoice.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                        {invoice.disputed && ' (disputed)'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${getCardStatusColor(invoice.cardStatus)}`}>
                        {invoice.cardStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {invoice.lastUsed ? invoice.lastUsed.toLocaleDateString('en-GB') : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      <button 
                          onClick={() => viewPaymentProof(invoice.paymentProof)}
                          className="px-3 py-1 rounded-md bg-[#303943] text-blue-100 text-xs font-medium hover:bg-gray-8000"
                          title="View Payment Proof"
                        >
                          <span>view proof</span>
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      <button 
                          onClick={() =>  viewReceipt(invoice.receipt)}
                          className="px-3 py-1 rounded-md bg-[#303943] text-blue-100 text-xs font-medium hover:bg-gray-800"
                          title="View Payment Proof"
                        >
                          <span>view receipt</span>
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                       
                        {/* Card Management Actions */}
                        {invoice.status === 'active' && (
                          <button
                            onClick={() => manageCard(invoice.id, 'block')}
                            className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                            title="Block Card"
                          >
                            <Lock className="h-4 w-4" />
                          </button>
                        )}

                        {invoice.status === 'blocked' && (
                          <button
                            onClick={() => manageCard(invoice.id, 'unblock')}
                            className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                            title="Unblock Card"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}

                        {invoice.status !== 'pending' && (
                          <button
                            onClick={() => manageCard(invoice.id, 'replace')}
                            className="p-1.5 rounded-md bg-blue-900 text-blue-100 hover:bg-blue-800"
                            title="Replace Card"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}

                        {invoice.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(invoice.id, 'active')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter dispute reason:');
                                if (reason) {
                                  setDisputeReason(reason);
                                  handleDispute(invoice.id);
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
                              onClick={() => resolveDispute(invoice.id, 'active')}
                              className="p-1.5 rounded-md bg-green-900 text-green-100 hover:bg-green-800"
                              title="Resolve (Approve)"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => resolveDispute(invoice.id, 'rejected')}
                              className="p-1.5 rounded-md bg-red-900 text-red-100 hover:bg-red-800"
                              title="Resolve (Reject)"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this invoice?')) {
                              handleDelete(invoice.id);
                            }
                          }}
                          className="p-1.5 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600"
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
            Showing 1 to {filteredInvoices.length} of {filteredInvoices.length} entries
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
    </div>
  );
}