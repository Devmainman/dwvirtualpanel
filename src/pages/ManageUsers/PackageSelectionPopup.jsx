import { useState } from 'react';

const PackageSelectionPopup = ({
  packages,
  onSelectPackage,
  onClose,
  mode = 'edit', // 'edit' or 'upgrade'
  currentPackageId = null
}) => {
  const [selectedPackage, setSelectedPackage] = useState(
    mode === 'edit' ? packages.find(p => p._id === currentPackageId) || null : null
  );

  const isEditMode = mode === 'edit';

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-[#3A4451]">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-xl font-semibold ${
              isEditMode ? 'text-blue-300' : 'text-red-300'
            }`}>
              {isEditMode ? 'Edit Account Package' : 'Mandatory Package Upgrade'}
            </h3>
            <button onClick={onClose} className="text-[#A5AFC4] hover:text-white text-xl">
              ✕
            </button>
          </div>

          {/* Optional Instructions */}
          {!isEditMode && (
            <div className="mb-4 text-sm text-red-300 bg-[#3a1f1f] p-3 rounded-md border border-red-500">
              Select a new package to assign to this user. This will force them to upgrade before continuing.
            </div>
          )}

          {/* Package List */}
          <div className="space-y-4">
            {packages.filter(pkg => pkg.status === 'Active').map((pkg) => {
              const isSelected = selectedPackage?._id === pkg._id;

              return (
                <div 
                  key={pkg._id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? isEditMode
                        ? 'border-blue-500 bg-[#2d3844]'
                        : 'border-red-500 bg-[#402b2b]'
                      : 'border-[#3A4451] hover:border-blue-400'
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-medium text-[#A5AFC4]">{pkg.name}</h4>
                      <p className={isEditMode ? 'text-blue-400' : 'text-red-400'}>
                        {pkg.currency} {pkg.amount}
                      </p>
                    </div>
                    {isSelected && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isEditMode ? 'bg-blue-500' : 'bg-red-600'
                      } text-white`}>
                        Selected
                      </span>
                    )}
                  </div>

                  <ul className="mt-3 space-y-1">
                    {pkg.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm text-[#A5AFC4]">
                        <span className="mr-2">•</span>{benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] rounded-md mr-2"
            >
              Cancel
            </button>

            {isEditMode ? (
              <button
                onClick={() => {
                  if (selectedPackage) {
                    onSelectPackage(selectedPackage); // handle edit logic
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={!selectedPackage || selectedPackage._id === currentPackageId}
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => {
                  if (selectedPackage) {
                    onSelectPackage(selectedPackage); // handle upgrade logic
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                disabled={!selectedPackage}
              >
                Assign Package
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSelectionPopup;
