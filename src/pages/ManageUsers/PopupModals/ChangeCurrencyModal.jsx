// components/PopupModals/ChangeCurrencyModal.jsx
import { useState } from 'react';
import { Globe, X, RefreshCw } from 'lucide-react';

const ChangeCurrencyModal = ({ 
  isOpen, 
  onClose, 
  currencies, 
  currentCurrency,
  onChange 
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!selectedCurrency) {
      setError('Please select a currency');
      return;
    }
    
    if (selectedCurrency === currentCurrency) {
      onClose();
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await onChange(selectedCurrency);
      if (result !== true) {
        setError(result);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-[#3a4552] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#aab8c5] flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-500" />
            Change Currency
          </h3>
          <button 
            onClick={onClose}
            className="text-[#aab8c5] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {error && (
            <div className="mb-4 p-2 bg-red-900 text-red-100 rounded text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-sm text-[#aab8c5] mb-2">
              Select New Currency
            </label>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full bg-[#303943] text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {currencies.map((currency) => (
                  <option 
                    key={currency.code} 
                    value={currency.code}
                    className="bg-[#282F36] text-white"
                  >
                    {currency.title} ({currency.code})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              Current: {currentCurrency}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3a4552] text-[#aab8c5] rounded hover:bg-[#4a5568] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : 'Change Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeCurrencyModal;