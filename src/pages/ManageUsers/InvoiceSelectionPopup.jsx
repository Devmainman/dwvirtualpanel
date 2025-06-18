import { useState } from 'react';

const InvoiceSelectionPopup = ({ invoices, onSelectInvoice, onClose }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#aab8c5]">Assign Invoice</h3>
            <button 
              onClick={onClose}
              className="text-[#A5AFC4] hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3A4451]">
              <thead className="bg-[#303943]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Select</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#A5AFC4] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-[#282F36] divide-y divide-[#3A4451]">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-[#A5AFC4]">
                      No invoices available
                    </td>
                  </tr>
                ) : (
                  invoices.filter(invoice => invoice.status === 'Active').map((invoice) => (
                    <tr 
                      key={invoice._id} 
                      className={`hover:bg-[#303943] cursor-pointer ${
                        selectedInvoice?._id === invoice._id ? 'bg-[#303943]' : ''
                      }`}
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="radio"
                          name="invoiceSelection"
                          checked={selectedInvoice?._id === invoice._id}
                          onChange={() => setSelectedInvoice(invoice)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-[#A5AFC4]"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4] font-medium">
                        {invoice.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#A5AFC4]">
                        ${invoice.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#A5AFC4]">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'pending' ? 'bg-yellow-900 text-yellow-100' :
                          invoice.status === 'paid' ? 'bg-green-900 text-green-100' :
                          'bg-red-900 text-red-100'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedInvoice) {
                  onSelectInvoice(selectedInvoice);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={!selectedInvoice}
            >
              Assign Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSelectionPopup;