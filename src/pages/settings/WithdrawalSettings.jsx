import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL, STATIC_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WithdrawalSettings = () => {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [withdrawalMethods, setWithdrawalMethods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    icon: null,
    status: 'Active',
    details: [{ label: '' }],
    requiredSignal: 100,
    minAmount: '',
    maxAmount: ''
  });

  

  const styles = {
    input: 'w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    button: {
      primary: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 flex items-center',
      secondary: 'px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-all duration-200',
      danger: 'text-red-400 hover:text-red-300 flex items-center',
      edit: 'text-blue-400 hover:text-blue-300 flex items-center',
      view: 'text-gray-400 bg-gray-700 px-2 rounded-sm hover:text-gray-300 flex items-center text-sm',
    },
    tableHeader: 'px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider',
    tableCell: 'px-4 py-4 text-sm text-[#A5AFC4]',
  };

  // ================== API Functions ================== //
  const fetchWithdrawalMethods = async () => {
    setIsLoading(true);
    if (!token || !isAuthenticated) {
      console.log('No token or not authenticated, redirecting to login');
      toast.error('Please log in to continue');
      navigate('/login');
      setIsLoading(false);
      return;
    }

    const url = `${API_BASE_URL}/admin/withdrawal-methods`;
    console.log('Fetching Withdrawal Methods URL:', url);
    console.log('Using Token:', token ? `Bearer ${token.slice(0, 20)}...` : 'None');

    try {
      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const methods = response.data.data.map(method => ({
        id: method._id,
        icon: method.icon || '',
        title: method.title,
        status: method.isActive ? 'Active' : 'Inactive',
        details: method.details || [],
        requiredSignal: method.requiredSignal ?? 100,
        minAmount: method.minAmount ?? 0,
        maxAmount: method.maxAmount ?? 0,
        currency: method.currency,
      }));
      
      console.log('Fetched Withdrawal Methods:', methods);
      setWithdrawalMethods(methods);
    } catch (error) {
      console.error('Error fetching withdrawal methods:', error.response?.data || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch withdrawal methods');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveWithdrawalMethod = async () => {
    if (!token || !isAuthenticated) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }
  
    if (formData.title.trim() === '') {
      toast.error('Title is required');
      return;
    }
  
    const validDetails = formData.details.filter(d => d.label.trim());
    if (validDetails.length === 0) {
      toast.error('At least one detail is required');
      return;
    }
  
    try {
      setIsLoading(true);
      const url = editingMethod 
        ? `${API_BASE_URL}/admin/withdrawal-methods/${editingMethod.id}`
        : `${API_BASE_URL}/admin/withdrawal-methods`;
  
      const headers = { Authorization: `Bearer ${token}` };
      let response;
  
      if (formData.icon instanceof File) {
        const formDataToSend = new FormData();
        if (!editingMethod) {
          formDataToSend.append('methodId', formData.title.toLowerCase().replace(/\s+/g, '_'));
        }
        formDataToSend.append('title', formData.title);
        formDataToSend.append('isActive', formData.status === 'Active');
        formDataToSend.append('details', JSON.stringify(validDetails));
        formDataToSend.append('icon', formData.icon);
        formDataToSend.append('minAmount', parseFloat(formData.minAmount));
        formDataToSend.append('maxAmount', parseFloat(formData.maxAmount));
        formDataToSend.append('requiredSignal', parseInt(formData.requiredSignal) || 100);
  
        response = editingMethod
          ? await axios.put(url, formDataToSend, { headers })
          : await axios.post(url, formDataToSend, { headers });
      } else {
        const jsonData = {
          title: formData.title,
          isActive: formData.status === 'Active',
          details: validDetails,
          minAmount: parseFloat(formData.minAmount),
          maxAmount: parseFloat(formData.maxAmount),
          requiredSignal: parseInt(formData.requiredSignal) || 100,
        };
        if (!editingMethod) {
          jsonData.methodId = formData.title.toLowerCase().replace(/\s+/g, '_');
        }
  
        response = editingMethod
          ? await axios.put(url, jsonData, {
              headers: { ...headers, 'Content-Type': 'application/json' },
            })
          : await axios.post(url, jsonData, {
              headers: { ...headers, 'Content-Type': 'application/json' },
            });
      }
  
      if (response.data?.success) {
        toast.success(`Withdrawal method ${editingMethod ? 'updated' : 'created'}`);
        fetchWithdrawalMethods();
        closeModal();
      } else {
        toast.error(response.data.message || 'Failed to save withdrawal method');
      }
  
    } catch (error) {
      console.error('Save withdrawal method error:', error.response?.data || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save withdrawal method');
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const deleteWithdrawalMethod = async (id) => {
    if (!token || !isAuthenticated) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this method?')) return;
    
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/admin/withdrawal-methods/${id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Withdrawal method deleted');
      fetchWithdrawalMethods();
    } catch (error) {
      console.error('Delete error:', error.response?.data || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete withdrawal method');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMethodStatus = async (id) => {
    if (!token || !isAuthenticated) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const method = withdrawalMethods.find(m => m.id === id);
      await axios.patch(
        `${API_BASE_URL}/admin/withdrawal-methods/${id}/status`,
        { isActive: method.status !== 'Active' },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      toast.success(`Method ${method.status === 'Active' ? 'deactivated' : 'activated'}`);
      fetchWithdrawalMethods();
    } catch (error) {
      console.error('Status toggle error:', error.response?.data || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================== UI Helpers ================== //
  const openDetailsModal = (method) => {
    setSelectedMethod(method);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedMethod(null);
  };

  const resetForm = (method) => {
    if (!selectedMethod) return;
    setFormData({
      title: '',
      icon: null,
      status: 'Active',
      details: [{ label: '' }],
      requiredSignal: 100,
      minAmount: '',
      maxAmount: '',
      currency: selectedMethod.currency,
    });
    setEditingMethod(null);
  };
  

  const openModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        title: method.title,
        icon: null,
        status: method.status,
        details: method.details.map(d => ({ label: d.label })),
        requiredSignal: method.requiredSignal || 100,
        minAmount: method.minAmount ?? '',
        maxAmount: method.maxAmount ?? '',
        currency: method.currency,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };
  

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleDetailChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index].label = value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleAddDetailRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { label: '' }],
    });
  };

  const handleRemoveDetailRow = (index) => {
    if (formData.details.length <= 1) {
      toast.error('At least one detail is required');
      return;
    }
    setFormData({
      ...formData,
      details: formData.details.filter((_, i) => i !== index),
    });
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG, JPG, JPEG, or SVG file');
        return;
      }
      console.log('Selected File:', file.name, file.type, file.size);
      setFormData({ ...formData, icon: file });
    } else {
      console.log('No file selected');
      setFormData({ ...formData, icon: null });
    }
  };

  const MethodIcon = ({ icon }) => {
    let iconUrl = '/icons/default.png';
    
    if (icon) {
      console.log('MethodIcon - Raw icon value:', icon);
      if (icon.startsWith('http') || icon.startsWith('data:')) {
        iconUrl = icon;
      } else {
        const normalizedPath = icon.startsWith('/') ? icon : `/icons/${icon}`;
        iconUrl = `${STATIC_BASE_URL}${normalizedPath}`;
      }
    }
  
    console.log('MethodIcon - Constructed iconUrl:', iconUrl);
  
    return (
      <img
        src={iconUrl}
        alt="Withdrawal method icon"
        className="h-6 w-6 object-contain rounded-full bg-[#303943] p-1"
        onError={(e) => {
          console.log('MethodIcon - Image load error for URL:', iconUrl);
          e.target.onerror = null;
          e.target.src = '/icons/default.png';
        }}
      />
    );
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWithdrawalMethods();
  }, [token, isAuthenticated]);

  const getCurrencySymbol = (currencyCode) => {
    try {
      const formatted = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(0);
  
      return formatted.replace(/\d/g, '').trim(); // Remove numbers, keep symbol
    } catch (err) {
      return currencyCode; // fallback to code if unknown
    }
  };

  // ================== Render ================== //
  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl md:text-2xl font-semibold text-[#aab8c5]">Withdrawal Settings</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{withdrawalMethods.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Withdrawals</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        <button 
          className={styles.button.primary}
          onClick={() => openModal()}
          disabled={isLoading || !isAuthenticated}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </button>
      </div>

      {/* Withdrawal Methods Table */}
      <div className="bg-[#282F36] rounded-lg shadow-md p-4 border border-[#2F3944] overflow-hidden">
        {isLoading && withdrawalMethods.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3A4451]">
              <thead>
                <tr>
                  <th className={styles.tableHeader}>No</th>
                  <th className={styles.tableHeader}>Icon</th>
                  <th className={styles.tableHeader}>Title</th>
                  <th className={styles.tableHeader}>Details</th>
                  <th className={styles.tableHeader}>Status</th>
                  <th className={styles.tableHeader}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A4451]">
                {withdrawalMethods.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-[#A5AFC4]">
                      {isLoading ? 'Loading...' : 'No withdrawal methods configured yet'}
                    </td>
                  </tr>
                ) : (
                  withdrawalMethods.map((method, index) => (
                    <tr key={method.id} className="hover:bg-[#303943]">
                      <td className={styles.tableCell}>{index + 1}</td>
                      <td className={styles.tableCell}>
                        <MethodIcon icon={method.icon} />
                      </td>
                      <td className={styles.tableCell}>{method.title}</td>
                      <td className={styles.tableCell}>
                        <button 
                          className={styles.button.view}
                          onClick={() => openDetailsModal(method)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                      <td className={styles.tableCell}>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            method.status === 'Active' 
                              ? 'bg-green-900 text-green-100' 
                              : 'bg-red-900 text-red-100'
                          }`}
                          onClick={() => toggleMethodStatus(method.id)}
                        >
                          <div className={`h-2 w-2 rounded-full mr-1 ${method.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          {method.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <button 
                            className={styles.button.edit}
                            onClick={() => openModal(method)}
                          >
                            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button 
                            className={styles.button.danger}
                            onClick={() => deleteWithdrawalMethod(method.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
{isDetailsModalOpen && selectedMethod && (
  <div className="fixed inset-0 overflow-y-auto bg-black/30 backdrop-blur-[3px] flex items-center justify-center z-50 p-4">
    <div className="bg-[#282F36] rounded-lg shadow-md p-6 w-full max-w-md border border-[#2F3944]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#aab8c5]">
          {selectedMethod.title} Details
        </h2>
        <button 
          className="text-gray-400 hover:text-gray-300"
          onClick={closeDetailsModal}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-[#303943]">
            <MethodIcon icon={selectedMethod.icon} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#aab8c5]">{selectedMethod.title}</h3>
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                selectedMethod.status === 'Active' 
                  ? 'bg-green-900 text-green-100' 
                  : 'bg-red-900 text-red-100'
              }`}
            >
              {selectedMethod.status}
            </span>
          </div>
        </div>

        <div className="border-t border-[#3A4451] pt-4">
          <h4 className="text-sm font-medium text-[#6B7280] mb-3">WITHDRAWAL DETAILS</h4>
          <div className="space-y-3">
            {selectedMethod.details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-[#6B7280]">{detail.label}</span>
                <span className="text-sm font-medium text-[#aab8c5]">[User will provide]</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <span className="text-sm text-[#6B7280]">Required Signal</span>
            <span className="text-sm font-medium text-[#aab8c5]">
              {(selectedMethod.requiredSignal ?? 100)}%
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[#6B7280]">Min Withdrawal</span>
            <span className="text-sm font-medium text-[#aab8c5]">
              {selectedMethod.minAmount !== undefined
                ? `${getCurrencySymbol(selectedMethod.currency)}${selectedMethod.minAmount}`
                : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-[#6B7280]">Max Withdrawal</span>
            <span className="text-sm font-medium text-[#aab8c5]">
              {selectedMethod.maxAmount !== undefined
                ? `${getCurrencySymbol(selectedMethod.currency)}${selectedMethod.maxAmount}`
                : 'N/A'}
            </span>
          </div>

        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button 
          className={styles.button.secondary}
          onClick={closeDetailsModal}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-[#282F36] rounded-lg shadow-md p-5 w-full max-w-md border-[#2F3944] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#aab8c5]">
                {editingMethod ? 'Edit Withdrawal Method' : 'Create Withdrawal Method'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-300"
                onClick={closeModal}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Title*</label>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="Method Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Icon</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  className={styles.input}
                  onChange={handleIconChange}
                />
                {formData.icon && (
                  <div className="mt-2">
                    <span className="text-sm text-[#A5AFC4]">Selected: {formData.icon.name}</span>
                  </div>
                )}
                {editingMethod && editingMethod.icon && !formData.icon && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-[#A5AFC4]">Current icon:</span>
                    <MethodIcon icon={editingMethod.icon} />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Status</label>
                <select 
                  className={styles.input}
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">
                  Required Signal (%) <span className="text-red-400">*</span>
                </label>
                <input 
                  type="number"
                  min="1"
                  max="100"
                  value={formData.requiredSignal}
                  onChange={(e) => setFormData({ ...formData, requiredSignal: e.target.value })}
                  className={styles.input}
                  placeholder="e.g. 80"
                />
              </div>

              <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Minimum Withdrawal Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] text-sm">
                {getCurrencySymbol(formData.currency)}
              </span>
              <input 
                type="number"
                className={`${styles.input} pl-7`} // 👈 adjust padding for icon
                min="0"
                value={formData.minAmount}
                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                placeholder="e.g. 10"
              />
            </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">
                Maximum Withdrawal Amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] text-sm">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <input 
                  type="number"
                  className={`${styles.input} pl-7`} // 👈 adjust padding for icon
                  min="0"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>

            </div>


              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-[#6B7280]">Details</label>
                  <button
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    onClick={handleAddDetailRow}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Field
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`${styles.input} flex-1`}
                        placeholder="Label (e.g., Bank Name)"
                        value={detail.label}
                        onChange={(e) => handleDetailChange(index, e.target.value)}
                      />
                      <button
                        className="p-2 rounded-md bg-[#303943] text-red-500 hover:bg-[#3E475B] transition-colors disabled:bg-gray-600 disabled:text-gray-400"
                        onClick={() => handleRemoveDetailRow(index)}
                        disabled={formData.details.length <= 1}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                className={styles.button.secondary}
                onClick={closeModal}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.button.primary}
                onClick={saveWithdrawalMethod}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {editingMethod ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  editingMethod ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalSettings;
