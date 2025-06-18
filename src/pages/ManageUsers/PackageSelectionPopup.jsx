import { useState } from 'react';

const PackageSelectionPopup = ({ packages, onSelectPackage, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-[#aab8c5]">Select Account Package</h3>
            <button 
              onClick={onClose}
              className="text-[#A5AFC4] hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            {packages.filter(pkg => pkg.status === 'Active').map((pkg) => (
              <div 
                key={pkg._id} 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPackage?._id === pkg._id 
                    ? 'border-blue-500 bg-[#303943]' 
                    : 'border-[#3A4451] hover:border-blue-400'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-[#A5AFC4]">{pkg.name}</h4>
                    <p className="text-blue-400 mt-1">
                      {pkg.currency} {pkg.amount}
                    </p>
                  </div>
                  {selectedPackage?._id === pkg._id && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      Selected
                    </span>
                  )}
                </div>
                
                <ul className="mt-3 space-y-1">
                  {pkg.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm text-[#A5AFC4]">
                      <span className="mr-2">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                if (selectedPackage) {
                  onSelectPackage(selectedPackage);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              disabled={!selectedPackage}
            >
              Assign Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSelectionPopup;