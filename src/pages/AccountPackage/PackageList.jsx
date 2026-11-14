import { Plus } from 'lucide-react';
import PackageItem from './PackageItem';

const PackageList = ({
  packages,
  setShowCreateForm,
  handleEditPackage,
  handleDeletePackage,
  toggleStatus,
  isLoading,
  currency
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-medium text-[#aab8c5]">Available Packages</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className={`px-3 md:px-4 py-1 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          Create New Package
        </button>
      </div>

      {isLoading && packages.length === 0 ? (
        <div className="bg-[#282F36] rounded-lg shadow-md p-4 md:p-6 text-center border border-[#2F3944]">
          <p className="text-[#A5AFC4]">Loading packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-[#282F36] rounded-lg shadow-md p-4 md:p-6 text-center border border-[#2F3944]">
          <p className="text-[#A5AFC4]">No packages created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <PackageItem
              key={pkg._id}
              pkg={pkg}
              currency={currency}
              handleEditPackage={handleEditPackage}
              handleDeletePackage={handleDeletePackage}
              toggleStatus={toggleStatus}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageList;