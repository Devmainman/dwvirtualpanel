import { Plus } from 'lucide-react';
import SignalPackageItem from './SignalPackageItem';

const SignalPackageList = ({
  packages,
  setShowCreateForm,
  handleEditPackage,
  handleDeletePackage,
  isLoading
}) => {
  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg text-[#aab8c5]">Available Signal Packages</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 px-3 py-2 rounded text-white flex items-center"
        >
          <Plus size={16} className="mr-1" /> Create Signal Package
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-400">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="text-gray-400">No signal packages created yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <SignalPackageItem
              key={pkg._id}
              pkg={pkg}
              handleEditPackage={handleEditPackage}
              handleDeletePackage={handleDeletePackage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SignalPackageList;
