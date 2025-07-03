import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useAuth } from '../context/AuthContext';
import {
  User, ChevronDown, Check, X, 
  FileMinus, Trash2, ChevronLeft, ChevronRight, 
  Search, Clock, AlertCircle, Mail, Eye, FileText, Loader2
} from 'lucide-react';

const Messaging = ({ userId }) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [totalMessages, setTotalMessages] = useState(0);

  // Fetch messages from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: rowsPerPage
        };
        
        if (searchTerm.trim() !== '') {
          params.search = searchTerm.trim();
        }
        
        

        // ✅ CORRECT WAY
        const response = await axios.get(`${API_BASE_URL}/messages/sent`, {
          params,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        


        setMessages(response.data.data);
        setTotalMessages(response.data.data.length);

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentPage, rowsPerPage, searchTerm, token]);

  const handleResend = async (messageId) => {
    try {
      await axios.post(`${API_BASE_URL}/messages/${messageId}/resend`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Refresh messages after resend
      const updatedMessages = messages.map(msg => 
        msg._id === messageId ? { ...msg, status: 'sent' } : msg
      );
      setMessages(updatedMessages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend message');
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await axios.delete(`${API_BASE_URL}/messages/${messageId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Remove deleted message from state
        setMessages(messages.filter(msg => msg._id !== messageId));
        setTotalMessages(prev => prev - 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete message');
      }
    }
  };

  const handleViewDetails = (message) => {
    // You can implement a modal here to show full message details
    console.log('View details:', message);
    alert(`Subject: ${message.subject}\n\nContent: ${message.content}`);
  };

  const toggleRowSelection = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === messages.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(messages.map(row => row._id));
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdown(prev => (prev === id ? null : id));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'sent':
      case 'delivered':
      case 'read':
        return <Check className="h-3 w-3 mr-1 text-green-500" />;
      case 'failed':
        return <X className="h-3 w-3 mr-1 text-red-500" />;
      case 'pending':
        return <Clock className="h-3 w-3 mr-1 text-yellow-500" />;
      default:
        return <AlertCircle className="h-3 w-3 mr-1 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading && !messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1E252C]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1E252C] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Outbox</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            {totalMessages}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Communications</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute left-3 top-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
        </div>
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
        />
      </div>

      {/* Messages Table */}
      <div className="bg-[#282F36] rounded-lg shadow overflow-x-auto border border-[#2F3944]">
        <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRows.length === messages.length && messages.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-[#3A4451] text-blue-500 focus:ring-blue-500 bg-[#282F36]"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
            {messages.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <Mail className="h-10 w-10 mb-2" />
                    <p>No messages found</p>
                  </div>
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message._id} className="hover:bg-[#303943] transition-colors duration-150">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(message._id)}
                      onChange={() => toggleRowSelection(message._id)}
                      className="rounded border-[#3A4451] text-blue-500 focus:ring-blue-500 bg-[#282F36]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      message.status === 'sent' || message.status === 'delivered' || message.status === 'read' ? 'bg-green-900 text-green-100' :
                      message.status === 'failed' ? 'bg-red-900 text-red-100' :
                      'bg-yellow-900 text-yellow-100'
                    }`}>
                      {getStatusIcon(message.status)}
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#A5AFC4] flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-400" />
                    {message.recipientDetails?.accountId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-[#A5AFC4]">
                    {message.recipientDetails?.firstName} {message.recipientDetails?.lastName}
                  </td>
                  <td className="px-6 py-4 text-[#A5AFC4]">
                    {message.subject.length > 50 
                      ? `${message.subject.substring(0, 50)}...` 
                      : message.subject}
                  </td>
                  <td className="px-6 py-4 text-[#A5AFC4]">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button 
                        onClick={() => toggleDropdown(message._id)} 
                        className="px-3 py-1 bg-[#303943] hover:bg-[#3A4451] rounded-md flex items-center text-[#A5AFC4] transition-colors duration-150"
                      >
                        Actions <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                      {openDropdown === message._id && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#303943] z-10 border border-[#3A4451]">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleResend(message._id);
                                setOpenDropdown(null);
                              }}
                              disabled={message.status !== 'failed'}
                              className={`flex items-center w-full px-4 py-2 text-sm text-[#A5AFC4] hover:bg-[#3A4451] transition ${
                                message.status !== 'failed' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Mail className="h-4 w-4 mr-2 text-blue-500" /> Resend
                            </button>
                            <button
                              onClick={() => {
                                handleViewDetails(message);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-[#A5AFC4] hover:bg-[#3A4451] transition"
                            >
                              <Eye className="h-4 w-4 mr-2 text-green-500" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                // Implement edit functionality
                                console.log('Edit:', message);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-[#A5AFC4] hover:bg-[#3A4451] transition"
                            >
                              <FileText className="h-4 w-4 mr-2 text-yellow-500" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(message._id);
                                setOpenDropdown(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-[#A5AFC4] hover:bg-[#3A4451] transition"
                            >
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
              setCurrentPage(1);
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
            className="p-1 rounded hover:bg-[#3A4451] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm">
            {currentPage} of {Math.ceil(totalMessages / rowsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(totalMessages / rowsPerPage)))}
            disabled={currentPage === Math.ceil(totalMessages / rowsPerPage)}
            className="p-1 rounded hover:bg-[#3A4451] disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messaging;