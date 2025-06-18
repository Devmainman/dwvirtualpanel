import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Save, ChevronRight, ChevronLeft, Search, File, X } from 'lucide-react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const PopupManager = () => {
  const { token } = useAuth();
  const [popups, setPopups] = useState([]);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAnimation, setModalAnimation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredPopups = popups.filter(popup => 
    popup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    popup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newPopupTemplate = {
    title: '',
    description: '',
    status: 'Draft',
    file: null
  };

  const getAuthHeaders = () => {
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const validatePopup = (popup) => {
    if (!popup.title.trim()) {
      throw new Error('Title is required');
    }
  };

  const fetchPopupMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/admin/popup-messages`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch popups');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debugging
      
      // Handle different possible response structures
      let popupsData = [];
      
      if (Array.isArray(data)) {
        popupsData = data;
      } else if (data?.data?.popups && Array.isArray(data.data.popups)) {
        popupsData = data.data.popups;
      } else if (data?.popups && Array.isArray(data.popups)) {
        popupsData = data.popups;
      } else if (data?.data && Array.isArray(data.data)) {
        popupsData = data.data;
      } else if (data?.messages && Array.isArray(data.messages)) { // Add this new condition
        popupsData = data.messages;
      } else {
        console.error('Unexpected API format:', data);
        throw new Error('Invalid popups data format received');
      }
      
      setPopups(popupsData);
      localStorage.setItem('popups', JSON.stringify(popupsData));
    } catch (err) {
      console.error('Fetch popups error:', err);
      setError(err.message);
      
      // Fallback to localStorage if API fails
      const savedPopups = localStorage.getItem('popups');
      if (savedPopups) {
        setPopups(JSON.parse(savedPopups));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load from localStorage first for faster initial render
    const savedPopups = localStorage.getItem('popups');
    if (savedPopups) {
      setPopups(JSON.parse(savedPopups));
    }
    
    // Then fetch fresh data from API
    fetchPopupMessages();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setModalAnimation('animate-in'), 10);
    } else {
      setModalAnimation('animate-out');
      setTimeout(() => setCurrentPopup(null), 300);
    }
  }, [isModalOpen]);

  const startNewPopup = () => {
    setCurrentPopup({ ...newPopupTemplate });
    setIsCreating(true);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const editPopup = (popup) => {
    setCurrentPopup({ ...popup });
    setIsCreating(false);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handlePopupChange = (e) => {
    const { name, value } = e.target;
    setCurrentPopup(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setCurrentPopup(prev => ({ ...prev, file: file ? file.name : null }));
  };

  const savePopup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      validatePopup(currentPopup);
      
      const formData = new FormData();
      formData.append('title', currentPopup.title);
      formData.append('description', currentPopup.description);
      formData.append('status', currentPopup.status);
      if (selectedFile) formData.append('file', selectedFile);
  
      const url = isCreating 
        ? `${API_BASE_URL}/admin/popup-messages`
        : `${API_BASE_URL}/admin/popup-messages/${currentPopup._id}`;
      
      const method = isCreating ? 'POST' : 'PUT';
      const headers = getAuthHeaders();
      
      // Don't set Content-Type - let the browser set it with boundary
      const response = await fetch(url, {
        method,
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isCreating ? 'create' : 'update'} popup`);
      }
      
      const savedPopup = await response.json();
      console.log('Saved popup:', savedPopup); // Debugging
      
      if (!savedPopup._id) {
        throw new Error('Invalid popup data received from server');
      }
      
      setPopups(prev => {
        const newPopups = isCreating 
          ? [...prev, savedPopup] 
          : prev.map(p => p._id === savedPopup._id ? savedPopup : p);
        
        localStorage.setItem('popups', JSON.stringify(newPopups));
        return newPopups;
      });
      
      closeModal();
    } catch (err) {
      console.error('Save popup error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePopup = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/admin/popup-messages/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete popup');
      }
      
      setPopups(prev => {
        const newPopups = prev.filter(popup => popup._id !== id);
        localStorage.setItem('popups', JSON.stringify(newPopups));
        return newPopups;
      });
      
      if (currentPopup && currentPopup._id === id) {
        closeModal();
      }
    } catch (err) {
      console.error('Delete popup error:', err);
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

  if (isLoading && popups.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex items-center justify-center">
        <div className="text-[#A5AFC4]">Loading popup messages...</div>
      </div>
    );
  }

  if (error && popups.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex flex-col items-center justify-center">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={fetchPopupMessages}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Popup Messages</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{popups.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Popups</span>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-3 top-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
        </div>
        <input
          type="text"
          placeholder="Search popups..."
          className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end mb-4">
        <button 
          onClick={startNewPopup}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> Create New Popup
        </button>
      </div>

      <div className="bg-[#282F36] rounded-lg shadow overflow-x-auto border border-[#2F3944]">
        <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
            {filteredPopups.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <File className="h-10 w-10 mb-2" />
                    <p>No popups found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPopups.map((popup, index) => (
                <tr key={popup._id} className="hover:bg-[#303943] transition-colors duration-150">
                  <td className="px-6 py-4 text-[#A5AFC4]">{index + 1}</td>
                  <td className="px-6 py-4 text-[#A5AFC4]">{popup.title}</td>
                  <td className="px-6 py-4 text-[#A5AFC4] max-w-xs truncate">{popup.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(popup.status)}`}>
                      {popup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {popup.filePath && (
                        <a 
                          href={`${API_BASE_URL}${popup.filePath}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-300 p-1"
                          title="Download File"
                        >
                          <File size={18} />
                        </a>
                      )}
                      <button 
                        onClick={() => editPopup(popup)}
                        disabled={isLoading}
                        className="text-blue-400 hover:text-blue-300 p-1 disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deletePopup(popup._id)}
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
        <div className="fixed inset-0 overflow-hidden bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
          <div className={`bg-[#282F36] rounded-lg border border-[#2F3944] w-full max-w-2xl transform transition-all duration-300 ease-in-out ${modalAnimation === 'animate-in' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>
            <div className="flex justify-between items-center border-b border-[#3A4451] p-4">
              <h2 className="text-xl font-bold text-[#aab8c5]">{isCreating ? 'CREATE POPUP' : 'EDIT POPUP'}</h2>
              <button 
                onClick={closeModal}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-900/50 text-red-100 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-1">*Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentPopup?.title || ''}
                  onChange={handlePopupChange}
                  className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter popup title"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Description</label>
                <textarea
                  name="description"
                  value={currentPopup?.description || ''}
                  onChange={handlePopupChange}
                  className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter popup description"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Status</label>
                <select
                  name="status"
                  value={currentPopup?.status || 'Draft'}
                  onChange={handlePopupChange}
                  className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Attach File (Optional)</label>
                <div className="flex items-center gap-4">
                  <label className={`flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors border ${isLoading ? 'bg-[#3A4451] border-[#3A4451] text-[#6B7280] cursor-not-allowed' : 'bg-[#303943] hover:bg-[#3A4451] border-[#3A4451] text-[#A5AFC4]'}`}>
                    <File size={16} className="mr-2" />
                    <span className="text-sm">Choose File</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  <span className="text-sm text-[#A5AFC4] truncate max-w-xs">
                    {selectedFile ? selectedFile.name : currentPopup?.file || 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center border-t border-[#3A4451] p-4 gap-3">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="px-4 py-2 border border-[#3A4451] text-[#A5AFC4] hover:bg-[#303943] rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={savePopup}
                disabled={isLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (
                  <>
                    <Save size={16} /> Save Popup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupManager;