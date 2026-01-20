import { Edit, Trash2 } from 'lucide-react';

const SignalPackageItem = ({ pkg, handleEditPackage, handleDeletePackage }) => {
  return (
    <div className="bg-[#282F36] p-4 rounded border border-[#2F3944]">

      <h4 className="text-lg font-semibold text-white">{pkg.name}</h4>
      <p className="text-sm text-blue-400">{pkg.signalType}</p>
      <p className="text-sm">Duration: {pkg.duration}</p>
      <p className="text-sm">Strength +{pkg.signalStrength}%</p>
      <p className="text-sm text-yellow-400 mt-1">
        {pkg.currency || 'USD'} {pkg.amount}
      </p>

      <div className="flex justify-end gap-2 mt-3">
        <button onClick={() => handleEditPackage(pkg)} className="text-blue-400">
          <Edit size={16} />
        </button>
        <button onClick={() => handleDeletePackage(pkg._id)} className="text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default SignalPackageItem;
