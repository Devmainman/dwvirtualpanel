import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

const PopupInvoiceModal = ({ invoices, onSelectInvoice, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-[#282F36] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-[#303943]">
        <h3 className="text-lg font-medium text-[#aab8c5]">Select Invoice to Assign</h3>
        <button onClick={onClose} className="text-[#6B7280] hover:text-[#aab8c5]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        {invoices.length === 0 ? (
          <p className="text-[#A5AFC4] text-center py-4">No invoices available</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {invoices.map(invoice => (
              <div 
                key={invoice._id}
                onClick={() => onSelectInvoice(invoice)}
                className="bg-[#303943] p-4 rounded-lg cursor-pointer hover:bg-[#3a4551] transition-colors border border-transparent hover:border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-[#aab8c5] mb-1">{invoice.title}</h4>
                  <span className="text-blue-500 font-medium">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>
                <p className="text-sm text-[#6B7280]">{invoice.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

PopupInvoiceModal.propTypes = {
  invoices: PropTypes.array.isRequired,
  onSelectInvoice: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PopupInvoiceModal;