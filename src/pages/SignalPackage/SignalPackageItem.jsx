import { Edit, Trash2 } from 'lucide-react';

const SignalPackageItem = ({ pkg, handleEditPackage, handleDeletePackage }) => {
  return (
    <div className="bg-[#282F36] p-4 rounded border border-[#2F3944]">

      <h4 className="text-lg font-semibold text-white">{pkg.name}</h4>

      {/* Strength */}
      <p className="text-sm text-green-400">
        Signal Strength: +{pkg.strength}%
      </p>

      {/* Amount */}
      <p className="text-sm text-yellow-400 mt-1">
        {pkg.currency || 'USD'} {pkg.amount}
      </p>

      {/* Benefits (optional preview) */}
      {pkg.benefits?.length > 0 && (
        <ul className="text-xs text-[#A5AFC4] mt-2 list-disc list-inside space-y-1">
          {pkg.benefits.slice(0, 3).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
          {pkg.benefits.length > 3 && (
            <li className="text-gray-400">+{pkg.benefits.length - 3} more…</li>
          )}
        </ul>
      )}

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => handleEditPackage(pkg)}
          className="text-blue-400 hover:text-blue-300"
          title="Edit"
        >
          <Edit size={16} />
        </button>

        <button
          onClick={() => handleDeletePackage(pkg._id)}
          className="text-red-500 hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default SignalPackageItem;
