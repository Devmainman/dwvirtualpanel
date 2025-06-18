import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, ChevronRight, ChevronLeft, Search, X, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const PopupInvoiceManager = () => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredInvoices = invoices.filter(invoice => 
    invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newInvoiceTemplate = {
    title: 'Invoice Title',
    amount: '',
    currency: 'USD',
    description: '',
    assignedTo: 'All Users',
    status: 'Draft'
  };

  const getAuthHeaders = () => {
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Authentication required');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/admin/popup-invoices`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }
      
      const responseData = await response.json();
      console.log('API Response:', responseData); // Log the actual response
      
      // More flexible response handling
      let invoicesData = [];
      
      if (Array.isArray(responseData)) {
        invoicesData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        invoicesData = responseData.data;
      } else if (responseData && responseData.invoices) {
        invoicesData = responseData.invoices;
      } else {
        console.warn('Unexpected API response format:', responseData);
        invoicesData = []; // Default to empty array
      }
      
      setInvoices(invoicesData);
    } catch (err) {
      console.error('Fetch invoices error:', err);
      setError(err.message);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setIsModalAnimating(true), 10);
    } else {
      setIsModalAnimating(false);
      setTimeout(() => setCurrentInvoice(null), 300);
    }
  }, [isModalOpen]);

  const startNewInvoice = () => {
    setCurrentInvoice({ ...newInvoiceTemplate });
    setIsCreating(true);
    setIsModalOpen(true);
  };

  const editInvoice = (invoice) => {
    setCurrentInvoice({ ...invoice });
    setIsCreating(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setCurrentInvoice(prev => ({ ...prev, [name]: value }));
  };

  const saveInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = isCreating
        ? `${API_BASE_URL}/admin/popup-invoices`
        : `${API_BASE_URL}/admin/popup-invoices/${currentInvoice._id}`;
      
      const response = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentInvoice)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isCreating ? 'create' : 'update'} invoice`);
      }
      
      const savedInvoice = await response.json();
      
      if (isCreating) {
        setInvoices(prev => [...prev, savedInvoice]);
      } else {
        setInvoices(prev => prev.map(i => i._id === currentInvoice._id ? savedInvoice : i));
      }
      
      closeModal();
    } catch (err) {
      console.error('Save invoice error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/popup-invoices/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders() // Fix: don't spread, use headers property
      });
      
      if (!response.ok) throw new Error('Failed to delete invoice');
      
      setInvoices(invoices.filter(invoice => invoice._id !== id));
      if (currentInvoice && currentInvoice._id === id) {
        closeModal();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusClass = (status) => ({
    Active: 'bg-green-900 text-green-100',
    Draft: 'bg-yellow-900 text-yellow-100',
    Inactive: 'bg-red-900 text-red-100'
  }[status]);

  const assignedToClass = (assignedTo) => ({
    'All Users': 'bg-blue-900 text-blue-100',
    'Withdrawal': 'bg-purple-900 text-purple-100',
    'Signal Strength': 'bg-indigo-900 text-indigo-100'
  }[assignedTo]);

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex items-center justify-center">
        <div className="text-[#A5AFC4]">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Popup Invoices</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{invoices.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Invoices</span>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-3 top-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
        </div>
        <input
          type="text"
          placeholder="Search invoices..."
          className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end mb-4">
        <button 
          onClick={startNewInvoice}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> Create New Invoice
        </button>
      </div>

      <div className="bg-[#282F36] rounded-lg shadow overflow-x-auto border border-[#2F3944]">
        <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>No invoices found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice, index) => (
                <tr key={invoice._id} className="hover:bg-[#303943] transition-colors duration-150">
                  <td className="px-6 py-4 text-[#A5AFC4]">{index + 1}</td>
                  <td className="px-6 py-4 text-[#A5AFC4]">{invoice.title}</td>
                  <td className="px-6 py-4 text-[#A5AFC4]">{invoice.amount} {invoice.currency}</td>
                  <td className="px-6 py-4 text-[#A5AFC4] max-w-xs truncate">{invoice.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignedToClass(invoice.assignedTo)}`}>
                      {invoice.assignedTo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => editInvoice(invoice)}
                        disabled={isLoading}
                        className="text-blue-400 hover:text-blue-300 p-1 disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteInvoice(invoice._id)}
                        disabled={isLoading}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4" 
          style={{ opacity: isModalAnimating ? 1 : 0 }}
        >
          <div 
            className="bg-[#282F36] rounded-lg border border-[#2F3944] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl transition-all duration-300 ease-in-out"
            style={{ 
              transform: isModalAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)'
            }}
          >
            <div className="flex justify-between items-center p-6 border-b border-[#3A4451]">
              <h2 className="text-xl font-bold text-[#aab8c5]">{isCreating ? 'CREATE INVOICE' : 'EDIT INVOICE'}</h2>
              <button 
                onClick={closeModal}
                disabled={isLoading}
                className="text-[#A5AFC4] hover:text-white p-1 rounded-full hover:bg-[#3A4451] transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">*Title</label>
                  <input
                    type="text"
                    name="title"
                    value={currentInvoice?.title || ''}
                    onChange={handleInvoiceChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Invoice Title"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">*Amount</label>
                  <div className="flex">
                    <select
                      name="currency"
                      value={currentInvoice?.currency || 'USD'}
                      onChange={handleInvoiceChange}
                      className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <input
                      type="text"
                      name="amount"
                      value={currentInvoice?.amount || ''}
                      onChange={handleInvoiceChange}
                      className="flex-1 bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentInvoice?.description || ''}
                    onChange={handleInvoiceChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter invoice description"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Status</label>
                  <select
                    name="status"
                    value={currentInvoice?.status || 'Draft'}
                    onChange={handleInvoiceChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Assigned To</label>
                  <select
                    name="assignedTo"
                    value={currentInvoice?.assignedTo || 'All Users'}
                    onChange={handleInvoiceChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="All Users">All Users</option>
                    <option value="Withdrawal">Withdrawal</option>
                    <option value="Signal Strength">Signal Strength</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#3A4451] pt-4">
                <button
                  onClick={closeModal}
                  disabled={isLoading}
                  className="text-[#A5AFC4] hover:text-white flex items-center disabled:opacity-50"
                >
                  <ChevronLeft size={16} className="mr-1" /> Cancel
                </button>
                <button
                  onClick={saveInvoice}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save size={16} /> Save Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupInvoiceManager;