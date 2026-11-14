import { useState, useEffect } from 'react';
import { Search, RefreshCw, Settings as SettingsIcon, Currency, Globe } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/config';
import { useAuth } from '../../context/AuthContext';
import { FxPanel } from '../../products/TradingOps';

const CurrenciesSettings = () => {
  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCurrencies, setTotalCurrencies] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  
  // Modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Currency settings state
  const [currencySettings, setCurrencySettings] = useState({
    currencyApiKey: '',
    currencyApiUrl: '',
    currencyInterval: '',
    defaultCurrency: ''
  });
  
  // Currency list for dropdown
  const [currenciesList, setCurrenciesList] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  // Fetch currencies list for dropdown
  const fetchCurrenciesList = async () => {
    setLoadingCurrencies(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/currencies?status=Enabled&limit=151`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrenciesList(response.data.currencies || []);
    } catch (error) {
      console.error('Failed to fetch currencies list', error);
    } finally {
      setLoadingCurrencies(false);
    }
  };

  // Fetch currency settings
  const fetchCurrencySettings = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/settings/currency`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.settings) {
        setCurrencySettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch currency settings', error);
    }
  };

  // Fetch currencies from backend
  const fetchCurrencies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/currencies`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const currenciesWithSelection = response.data.currencies.map(currency => ({
        ...currency,
        selected: false
      }));
      
      setCurrencies(currenciesWithSelection);
      setTotalCurrencies(response.data.totalCurrencies);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrencies();
      fetchCurrencySettings();
      fetchCurrenciesList();
    }
  }, [currentPage, itemsPerPage, searchTerm, token]);

  // Handle settings modal open
  const handleOpenSettings = () => {
    fetchCurrencySettings();
    fetchCurrenciesList();
    setShowSettingsModal(true);
  };

  // Handle settings modal close
  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  // Handle settings input change
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setCurrencySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save currency settings
  const saveCurrencySettings = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/settings/currency`,
        currencySettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCloseSettings();
    } catch (error) {
      console.error('Failed to save currency settings', error);
    }
  };

  // Toggle currency status
  const toggleStatus = async (id) => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/currencies/${id}/status`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrencies(currencies.map(currency => 
        currency._id === id 
          ? { ...currency, status: currency.status === 'Enabled' ? 'Disabled' : 'Enabled' } 
          : currency
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Update currency rate
  const updateRate = async (id, newRate) => {
    try {
      await axios.put(
        `${API_BASE_URL}/admin/currencies/${id}/rate`, 
        { rate: newRate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setCurrencies(currencies.map(currency => 
        currency._id === id ? { ...currency, rate: newRate } : currency
      ));
    } catch (error) {
      console.error('Failed to update rate:', error);
    }
  };

  // Batch update status
  const batchUpdateStatus = async (status) => {
    const selectedIds = currencies.filter(c => c.selected).map(c => c._id);
    if (selectedIds.length === 0) return;

    try {
      await axios.put(
        `${API_BASE_URL}/admin/currencies/batch-status`, 
        { ids: selectedIds, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchCurrencies(); // Refresh data after update
    } catch (error) {
      console.error('Batch update failed:', error);
    }
  };

  // Toggle selection for a single currency
  const toggleSelection = (id) => {
    setCurrencies(currencies.map(currency => 
      currency._id === id 
        ? { ...currency, selected: !currency.selected } 
        : currency
    ));
  };

  // Toggle all selection
  const toggleAllSelection = (select) => {
    const shouldSelect = select !== undefined ? select : !currencies.every(c => c.selected);
    setCurrencies(currencies.map(currency => ({ 
      ...currency, 
      selected: shouldSelect
    })));
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCurrencies / itemsPerPage);
  const allSelected = currencies.length > 0 && currencies.every(c => c.selected);
  const someSelected = currencies.length > 0 && currencies.some(c => c.selected) && !allSelected;

  return (
    <div className="flex-1 overflow-y-auto bg-[#1E252C] p-6">
      <FxPanel />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-6 bg-[#282F36] p-4 rounded-sm">
        <h1 className="text-2xl font-semibold text-[#aab8c5]">MANAGE CURRENCIES</h1>
        <div className="p-1 bg-[#282F36]">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleOpenSettings}
              className="px-4 py-2 bg-blue-900 text-blue-100 rounded text-sm hover:bg-[#3A4451] transition-colors duration-150 flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              Currency Settings
            </button>
            <button 
              onClick={() => batchUpdateStatus('Enabled')}
              className="px-4 py-2 bg-green-900 text-green-100 rounded text-sm hover:bg-[#3A4451] transition-colors duration-150"
              disabled={!someSelected && !allSelected}
            >
              Enable Selected
            </button>
            <button 
              onClick={() => batchUpdateStatus('Disabled')}
              className="px-4 py-2 bg-red-900 text-red-100 rounded text-sm hover:bg-[#3A4451] transition-colors duration-150"
              disabled={!someSelected && !allSelected}
            >
              Disable Selected
            </button>
            <button 
              onClick={() => {
                toggleAllSelection(true);
                batchUpdateStatus('Enabled');
              }}
              className="px-4 py-2 bg-green-900 text-green-100 rounded text-sm hover:bg-[#3A4451] transition-colors duration-150"
            >
              Enable All
            </button>
            <button 
              onClick={() => {
                toggleAllSelection(true);
                batchUpdateStatus('Disabled');
              }}
              className="px-4 py-2 bg-red-900 text-red-100 rounded text-sm hover:bg-[#3A4451] transition-colors duration-150"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      {/* Currency List */}
      <div className="bg-[#282F36] rounded-lg shadow-md overflow-hidden border border-[#2F3944]">
        <div className="p-4 border-b border-[#2F3944] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <span className="text-sm text-[#A5AFC4] mr-2">Show</span>
            <select 
              className="bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10 entries</option>
              <option value={25}>25 entries</option>
              <option value={50}>50 entries</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A5AFC4]" />
            <input 
              type="text" 
              className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] pl-10 pr-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#303943]">
            <thead className="bg-[#303943]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#3A4451] bg-[#282F36]"
                    checked={allSelected}
                    onChange={(e) => toggleAllSelection(e.target.checked)}
                    ref={input => {
                      if (input) {
                        input.indeterminate = someSelected;
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">S/N</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Dollar Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-[#282F36] divide-y divide-[#303943]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#A5AFC4]">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="mt-4 text-lg font-medium">Loading currencies...</p>
                    </div>
                  </td>
                </tr>
              ) : currencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#A5AFC4]">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-10 w-10 text-[#4B5563] mb-2" />
                      <p className="text-lg font-medium">No currencies found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currencies.map((currency, index) => (
                  <tr key={currency._id} className="hover:bg-[#303943] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={currency.selected}
                        onChange={() => toggleSelection(currency._id)}
                        className="rounded border-[#3A4451] bg-[#282F36]"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-[#A5AFC4]">{currency.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#A5AFC4]">
                      {currency.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                      <input
                        type="number"
                        className="w-20 bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-1 rounded"
                        value={currency.rate}
                        onChange={(e) => updateRate(currency._id, e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currency.status === 'Enabled' 
                            ? 'bg-green-900 text-green-100' 
                            : 'bg-red-900 text-red-100'
                        }`}
                      >
                        {currency.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => toggleStatus(currency._id)}
                          className="p-1.5 rounded-md bg-[#303943] text-blue-400 hover:bg-[#3A4451] transition-colors duration-150"
                          title={currency.status === 'Enabled' ? 'Disable' : 'Enable'}
                        >
                          <RefreshCw className="h-4 w-4" />
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
        <div className="px-4 py-3 bg-[#303943] border-t border-[#3A4451] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#A5AFC4]">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCurrencies)} of {totalCurrencies} entries
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#3A4451] bg-[#282F36] text-sm font-medium text-[#A5AFC4] hover:bg-[#303943] disabled:opacity-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNum 
                        ? 'z-10 bg-blue-600 border-blue-600 text-white' 
                        : 'bg-[#282F36] border-[#3A4451] text-[#A5AFC4] hover:bg-[#303943]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#3A4451] bg-[#282F36] text-sm font-medium text-[#A5AFC4] hover:bg-[#303943] disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Currency Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-2xl border border-[#2F3944]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2F3944]">
              <div className="flex items-center">
                <Currency className="h-6 w-6 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold text-[#aab8c5]">Currency Settings</h2>
              </div>
              <button
                onClick={handleCloseSettings}
                className="text-[#A5AFC4] hover:text-white transition-colors duration-150"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Currency API Key</label>
                  <input
                    type="text"
                    name="currencyApiKey"
                    value={currencySettings.currencyApiKey || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Your Currency API Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Currency API URL</label>
                  <input
                    type="text"
                    name="currencyApiUrl"
                    value={currencySettings.currencyApiUrl || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="http://api.exchangerate.host/convert"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Currency Interval</label>
                  <select
                    name="currencyInterval"
                    value={currencySettings.currencyInterval || ''}
                    onChange={handleSettingsChange}
                    className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Interval</option>
                    <option value="Every Hour">Every Hour</option>
                    <option value="Every 3 Hours">Every 3 Hours</option>
                    <option value="Every 6 Hours">Every 6 Hours</option>
                    <option value="Every 12 Hours">Every 12 Hours</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Default Currency</label>
                  {loadingCurrencies ? (
                    <div className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md">
                      Loading currencies...
                    </div>
                  ) : (
                    <select
                      name="defaultCurrency"
                      value={currencySettings.defaultCurrency || ''}
                      onChange={handleSettingsChange}
                      className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a default currency</option>
                      {currenciesList.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.title} ({currency.code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#2F3944]">
              <button
                onClick={handleCloseSettings}
                className="px-4 py-2 bg-[#303943] text-[#A5AFC4] rounded-md hover:bg-[#3A4451] transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrencySettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrenciesSettings;