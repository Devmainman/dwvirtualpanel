import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Plus, Minus, Save, ChevronRight, ChevronLeft, Search, X, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';

const PopupFormManager = () => {
  const { token } = useAuth();
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newFormTemplate = {
    icon: '📝',
    title: 'New Form',
    description: '',
    status: 'Draft',
    fields: [
      {
        label: 'Email',
        type: 'text',  // Lowercase!
        required: true,
        readonly: false,
        defaultValue: '',
        options: ''
      }
    ]
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

  const fetchPopupForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/admin/popup-forms`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch forms');
      }
      
      const data = await response.json();
      console.log('API response:', data); // Debug
      
      // Handle different response formats
      let formsData = [];
      if (Array.isArray(data)) {
        formsData = data;
      } else if (Array.isArray(data.forms)) {
        formsData = data.forms;
      } else if (Array.isArray(data.data)) {
        formsData = data.data;
      }
      
      setForms(formsData);
    } catch (err) {
      console.error('Fetch forms error:', err);
      setError(err.message);
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPopupForms();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (isModalOpen && event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]);

  const startNewForm = () => {
    setCurrentForm({ ...newFormTemplate });
    setIsCreating(true);
    openModal();
  };

  const editForm = (form) => {
    setCurrentForm({ ...form });
    setIsCreating(false);
    openModal();
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      setIsModalAnimating(true);
    }, 10);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setCurrentForm(null);
      document.body.style.overflow = 'auto';
    }, 300);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (id, field, value) => {
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === id ? { ...f, [field]: value } : f
      )
    }));
  };

  const addNewField = () => {
    const newId = Date.now();
    setCurrentForm(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          id: newId,
          label: 'New Field',
          type: 'Input',
          required: true,
          readonly: false,
          defaultValue: '',
          options: [] // Initialize as array instead of empty string
        }
      ]
    }));
  };

  const removeField = (id) => {
    if (currentForm.fields.length <= 1) return;
    setCurrentForm(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
  };

  const saveForm = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // Transform data to match backend schema
      const payload = {
        title: currentForm.title,
        icon: currentForm.icon,
        description: currentForm.description,
        status: currentForm.status,
        fields: currentForm.fields.map(field => ({
          name: field.label.toLowerCase().replace(/\s+/g, '-'), // Generate a URL-safe name
          label: field.label,
          type: field.type.toLowerCase(), // Ensure lowercase to match enum
          required: field.required,
          readonly: field.readonly,
          defaultValue: field.defaultValue,
          options: field.options 
            ? field.options.split(',').map(opt => ({ 
                value: opt.trim(), 
                label: opt.trim() 
              }))
            : []
        }))
      };
  
      console.log("Final Payload:", payload); // Debug
  
      const url = isCreating
        ? `${API_BASE_URL}/admin/popup-forms`
        : `${API_BASE_URL}/admin/popup-forms/${currentForm._id}`;
      
      const response = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Validation failed");
      }
  
      const savedForm = await response.json();
      console.log("Saved Form:", savedForm);
  
      // Update state and close modal
      if (isCreating) {
        setForms(prev => [...prev, savedForm]);
      } else {
        setForms(prev => prev.map(f => f._id === currentForm._id ? savedForm : f));
      }
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteForm = async (id) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/admin/popup-forms/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete form');
      }
      
      setForms(prev => prev.filter(form => form._id !== id));
      if (currentForm && currentForm._id === id) {
        closeModal();
      }
    } catch (err) {
      console.error('Delete form error:', err);
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

  if (isLoading && forms.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6 flex items-center justify-center">
        <div className="text-[#A5AFC4]">Loading forms...</div>
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
          <h1 className="text-2xl font-semibold text-[#aab8c5]">Popup Forms</h1>
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{forms.length}</span>
        </div>
        <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm mt-2 md:mt-0">
          <span>Dashboard</span>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="font-medium">Forms</span>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute left-3 top-3">
          <Search className="h-4 w-4 text-[#6B7280]" />
        </div>
        <input
          type="text"
          placeholder="Search forms..."
          className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end mb-4">
        <button 
          onClick={startNewForm}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Plus size={18} /> Create New Form
        </button>
      </div>

      <div className="bg-[#282F36] rounded-lg shadow overflow-x-auto border border-[#2F3944]">
        <table className="min-w-full divide-y divide-[#3A4451]">
          <thead className="bg-[#303943]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
            {filteredForms.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-[#6B7280]">
                    <FileText className="h-10 w-10 mb-2" />
                    <p>No forms found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredForms.map((form, index) => (
                <tr key={form._id} className="hover:bg-[#303943] transition-colors duration-150">
                  <td className="px-6 py-4 text-[#A5AFC4]">{index + 1}</td>
                  <td className="px-6 py-4 text-2xl">{form.icon}</td>
                  <td className="px-6 py-4 text-[#A5AFC4]">{form.title}</td>
                  <td className="px-6 py-4 text-[#A5AFC4] max-w-xs truncate">{form.description}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(form.status)}`}>
                      {form.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => editForm(form)}
                        disabled={isLoading}
                        className="text-blue-400 hover:text-blue-300 p-1 disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteForm(form._id)}
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
            ref={modalRef}
            className="bg-[#282F36] rounded-lg border border-[#2F3944] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl transition-all duration-300 ease-in-out"
            style={{ 
              transform: isModalAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)'
            }}
          >
            <div className="flex justify-between items-center p-6 border-b border-[#3A4451]">
              <h2 className="text-xl font-bold text-[#aab8c5]">{isCreating ? 'CREATE FORM' : 'EDIT FORM'}</h2>
              <button 
                onClick={closeModal}
                disabled={isLoading}
                className="text-[#A5AFC4] hover:text-white p-1 rounded-full hover:bg-[#3A4451] transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">*Title</label>
                  <input
                    type="text"
                    name="title"
                    value={currentForm?.title || ''}
                    onChange={handleFormChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Form Title Here"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    value={currentForm?.icon || ''}
                    onChange={handleFormChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Status</label>
                  <select
                    name="status"
                    value={currentForm?.status || 'Draft'}
                    onChange={handleFormChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-[#A5AFC4] mb-1">Description</label>
                  <textarea
                    name="description"
                    value={currentForm?.description || ''}
                    onChange={handleFormChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter Form Description"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-[#aab8c5]">Form Fields</h3>
                  <button
                    onClick={addNewField}
                    disabled={isLoading}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} /> Add Field
                  </button>
                </div>

                <div className="space-y-4">
                  {currentForm?.fields.map((field) => (
                    <div key={field.id} className="bg-[#303943] p-4 rounded-md border border-[#3A4451]">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                        <div className="md:col-span-4">
                          <label className="block text-xs font-medium text-[#A5AFC4] mb-1">*Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                            className="w-full bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-[#A5AFC4] mb-1">*Field Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                            className="w-full bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          >
                            <option value="Input">Input</option>
                            <option value="Textarea">Textarea</option>
                            <option value="Dropdown">Dropdown</option>
                            <option value="Checkbox">Checkbox</option>
                            <option value="Radio">Radio</option>
                            <option value="Number">Number</option>
                            <option value="File">File</option>
                          </select>
                        </div>
                        <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-[#A5AFC4] mb-1">Default Value</label>
                        <input
                          type="text"
                          value={field.defaultValue}
                          onChange={(e) => handleFieldChange(field.id, 'defaultValue', e.target.value)}
                          disabled={isLoading}
                          className="w-full rounded-md border border-gray-600 bg-[#1C1F2E] text-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end items-end">
                        <button
                          onClick={() => removeField(field.id)}
                          disabled={currentForm.fields.length <= 1 || isLoading}
                          className={`p-2 rounded-md ${
                            currentForm.fields.length <= 1 || isLoading
                              ? 'bg-[#3A4451] text-[#6B7280] cursor-not-allowed'
                              : 'bg-red-900 text-red-100 hover:bg-red-800'
                          }`}
                        >
                          <Minus size={16} />
                        </button>
                      </div></div>

    
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-4 md:col-start-2">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-[#A5AFC4] mb-1">*Required</label>
                                  <select
                                    value={field.required ? 'Yes' : 'No'}
                                    onChange={(e) => handleFieldChange(field.id, 'required', e.target.value === 'Yes')}
                                    className="w-full bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                  >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[#A5AFC4] mb-1">*Readonly</label>
                                  <select
                                    value={field.readonly ? 'Yes' : 'No'}
                                    onChange={(e) => handleFieldChange(field.id, 'readonly', e.target.value === 'Yes')}
                                    className="w-full bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isLoading}
                                  >
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[#A5AFC4] mb-1">Options</label>
                                  <input
                                    type="text"
                                    value={field.options}
                                    onChange={(e) => handleFieldChange(field.id, 'options', e.target.value)}
                                    className="w-full bg-[#282F36] border border-[#3A4451] text-[#A5AFC4] rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Option1, Option2"
                                    disabled={!['Dropdown', 'Checkbox', 'Radio'].includes(field.type) || isLoading}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
                      onClick={saveForm}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : (
                        <>
                          <Save size={16} /> Save Form
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
    
    export default PopupFormManager;