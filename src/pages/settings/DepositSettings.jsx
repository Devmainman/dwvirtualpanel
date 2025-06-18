import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL, STATIC_BASE_URL } from '../../api/config';

// Helper function to get admin token
const getAdminToken = () => {
  return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
};

const DepositSettings = () => {
  const [depositMethods, setDepositMethods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: null,
    status: 'Active',
    details: [{ label: '', value: '' }],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Styles
  const styles = {
    input:
      'w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    button: {
      primary:
        'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 flex items-center',
      secondary:
        'px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-all duration-200',
      danger: 'text-red-400 hover:text-red-300 flex items-center',
      edit: 'text-blue-400 hover:text-blue-300 flex items-center',
      view: 'text-gray-400 bg-gray-700 px-2 rounded-sm hover:text-gray-300 flex items-center',
    },
    tableHeader: 'px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider',
    tableCell: 'px-4 py-4 text-sm text-[#A5AFC4]',
  };

  // ================== API FUNCTIONS ================== //
  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    const token = getAdminToken();

    if (!token) {
      toast.error('Authentication required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/payments/payment-methods`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const apiData = response.data.data || response.data;
      const methodsArray = Array.isArray(apiData) ? apiData : [apiData].filter(Boolean);

      const methods = methodsArray.map((method) => ({
        id: method._id,
        icon: method.icon || '',
        title: method.title,
        status: method.isActive ? 'Active' : 'Inactive',
        details: method.details || [],
      }));

      console.log('Fetched Methods:', methods); // Debug icon paths
      setDepositMethods(methods);
    } catch (error) {
      console.error('Fetch payment methods error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const savePaymentMethod = async () => {
    const token = getAdminToken();
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (formData.title.trim() === '') {
      toast.error('Title is required');
      return;
    }

    const validDetails = formData.details.filter((d) => d.label && d.value);
    if (validDetails.length === 0) {
      toast.error('At least one detail is required');
      return;
    }

    try {
      setIsLoading(true);
      const url = editingMethod
        ? `${API_BASE_URL}/admin/payments/payment-methods/${editingMethod.id}`
        : `${API_BASE_URL}/admin/payments/payment-methods`;

      const headers = { Authorization: `Bearer ${token}` };
      let response;

      console.log('Save Payment Method - FormData:', formData);
      console.log('Save Payment Method - Icon Type:', formData.icon ? formData.icon.constructor.name : 'null');
      console.log('Save Payment Method - Is Icon a File?', formData.icon instanceof File);

      if (formData.icon instanceof File) {
        console.log('Sending multipart/form-data with icon:', formData.icon.name);
        const formDataToSend = new FormData();
        if (!editingMethod) {
          formDataToSend.append('methodId', formData.title.toLowerCase().replace(/\s+/g, '_'));
        }
        formDataToSend.append('title', formData.title);
        formDataToSend.append('isActive', formData.status === 'Active');
        formDataToSend.append('details', JSON.stringify(validDetails));
        formDataToSend.append('icon', formData.icon);

        console.log('FormData Entries:');
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }

        response = editingMethod
          ? await axios.put(url, formDataToSend, { headers })
          : await axios.post(url, formDataToSend, { headers });
      } else {
        console.log('Sending application/json request');
        const jsonData = {
          title: formData.title,
          isActive: formData.status === 'Active',
          details: validDetails,
        };
        if (!editingMethod) {
          jsonData.methodId = formData.title.toLowerCase().replace(/\s+/g, '_');
        }

        console.log('JSON Payload:', jsonData);

        response = editingMethod
          ? await axios.put(url, jsonData, {
              headers: { ...headers, 'Content-Type': 'application/json' },
            })
          : await axios.post(url, jsonData, {
              headers: { ...headers, 'Content-Type': 'application/json' },
            });
      }

      toast.success(`Payment method ${editingMethod ? 'updated' : 'created'}`);
      fetchPaymentMethods();
      closeModal();
    } catch (error) {
      console.error('Save payment method error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to save payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (id) => {
    const token = getAdminToken();
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this method?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/admin/payments/payment-methods/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Payment method deleted');
      fetchPaymentMethods();
    } catch (error) {
      console.error('Delete payment method error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payment method');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMethodStatus = async (id) => {
    const token = getAdminToken();
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setIsLoading(true);
      const method = depositMethods.find((m) => m.id === id);
      await axios.patch(
        `${API_BASE_URL}/admin/payments/payment-methods/${id}/status`,
        { isActive: method.status !== 'Active' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(`Method ${method.status === 'Active' ? 'deactivated' : 'activated'}`);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  // ================== UI HELPERS ================== //
  const openDetailsModal = (method) => {
    setSelectedMethod(method);
    setIsDetailsModalOpen(true);
  };

  const openModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        title: method.title,
        icon: null,
        status: method.status,
        details: method.details.length ? [...method.details] : [{ label: '', value: '' }],
      });
    } else {
      setFormData({
        title: '',
        icon: null,
        status: 'Active',
        details: [{ label: '', value: '' }],
      });
      setEditingMethod(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
    setFormData({
      title: '',
      icon: null,
      status: 'Active',
      details: [{ label: '', value: '' }],
    });
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedMethod(null);
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index][field] = value;
    setFormData({ ...formData, details: updatedDetails });
  };

  const handleAddDetailRow = () => {
    setFormData({
      ...formData,
      details: [...formData.details, { label: '', value: '' }],
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

  // Fetch data on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const MethodIcon = ({ icon }) => {
    let iconUrl = '/icons/default.png';
    
    if (icon) {
      console.log('MethodIcon - Raw icon value:', icon);
      // Handle absolute URLs or data URLs
      if (icon.startsWith('http') || icon.startsWith('data:')) {
        iconUrl = icon;
      } else {
        // Use STATIC_BASE_URL and ensure path starts with /icons/
        const normalizedPath = icon.startsWith('/') ? icon : `/icons/${icon}`;
        iconUrl = `${STATIC_BASE_URL}${normalizedPath}`;
      }
    }
  
    console.log('MethodIcon - Constructed iconUrl:', iconUrl);
  
    return (
      <img
        src={iconUrl}
        alt="Payment method icon"
        className="h-6 w-6 object-contain rounded-full bg-[#303943] p-1"
        onError={(e) => {
          console.log('MethodIcon - Image load error for URL:', iconUrl);
          e.target.onerror = null;
          e.target.src = '/icons/default.png';
        }}
      />
    );
  };

  // ================== RENDER ================== //
  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl md:text-2xl font-semibold text-[#aab8c5]">Deposit Settings</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{depositMethods.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Deposits</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        <button className={styles.button.primary} onClick={() => openModal()} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Method
        </button>
      </div>

      {/* Deposit Methods Table */}
      <div className="bg-[#282F36] rounded-lg shadow-md p-4 border border-[#2F3944] overflow-hidden">
        {isLoading && depositMethods.length === 0 ? (
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
                {depositMethods.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-4 text-center text-[#A5AFC4]">
                      {isLoading ? 'Loading...' : 'No deposit methods configured yet'}
                    </td>
                  </tr>
                ) : (
                  depositMethods.map((method, index) => (
                    <tr key={method.id} className="hover:bg-[#303943]">
                      <td className={styles.tableCell}>{index + 1}</td>
                      <td className={styles.tableCell}>
                        <MethodIcon icon={method.icon} />
                      </td>
                      <td className={styles.tableCell}>{method.title}</td>
                      <td className={styles.tableCell}>
                        <button className={styles.button.view} onClick={() => openDetailsModal(method)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                      </td>
                      <td className={styles.tableCell}>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            method.status === 'Active' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                          }`}
                          onClick={() => toggleMethodStatus(method.id)}
                        >
                          <div
                            className={`h-2 w-2 rounded-full mr-1 ${
                              method.status === 'Active' ? 'bg-green-400' : 'bg-red-400'
                            }`}
                          />
                          {method.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                          <button className={styles.button.edit} onClick={() => openModal(method)}>
                            <svg
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button className={styles.button.danger} onClick={() => deletePaymentMethod(method.id)}>
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
              <h2 className="text-xl font-semibold text-[#aab8c5]">{selectedMethod.title} Details</h2>
              <button className="text-gray-400 hover:text-gray-300" onClick={closeDetailsModal}>
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
                      selectedMethod.status === 'Active' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                    }`}
                  >
                    {selectedMethod.status}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#3A4451] pt-4">
                <h4 className="text-sm font-medium text-[#6B7280] mb-3">PAYMENT DETAILS</h4>
                <div className="space-y-3">
                  {selectedMethod.details.map((detail, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">{detail.label}</span>
                      <span className="text-sm font-medium text-[#aab8c5]">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button className={styles.button.secondary} onClick={closeDetailsModal}>
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
                {editingMethod ? 'Edit Deposit Method' : 'Create Deposit Method'}
              </h2>
              <button className="text-gray-400 hover:text-gray-300" onClick={closeModal}>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-[#6B7280]">Details*</label>
                  <button
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                    onClick={handleAddDetailRow}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className={`${styles.input} flex-1`}
                        placeholder="Label"
                        value={detail.label}
                        onChange={(e) => handleDetailChange(index, 'label', e.target.value)}
                      />
                      <input
                        type="text"
                        className={`${styles.input} flex-1`}
                        placeholder="Value"
                        value={detail.value}
                        onChange={(e) => handleDetailChange(index, 'value', e.target.value)}
                      />
                      <button
                        className="p-2 rounded-md bg-[#303943] text-red-400 hover:bg-[#3A4451] transition-colors disabled:bg-gray-600 disabled:text-gray-400"
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
              <button className={styles.button.secondary} onClick={closeModal} disabled={isLoading}>
                Cancel
              </button>
              <button className={styles.button.primary} onClick={savePaymentMethod} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {editingMethod ? 'Updating...' : 'Saving...'}
                  </>
                ) : editingMethod ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositSettings;