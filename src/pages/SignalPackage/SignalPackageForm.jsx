// components/SignalPackageForm.jsx
import { Plus, Trash2, X } from 'lucide-react';

const SignalPackageForm = ({
  newPackage,
  setNewPackage,
  handleAddPackage,
  resetForm,
  editingId
}) => {
  const handleBenefitChange = (index, value) => {
    const updated = [...newPackage.benefits];
    updated[index] = value;
    setNewPackage({ ...newPackage, benefits: updated });
  };

  const addBenefitField = () => {
    setNewPackage({ ...newPackage, benefits: [...newPackage.benefits, ''] });
  };

  const removeBenefitField = (index) => {
    if (newPackage.benefits.length <= 1) return;
    const updated = [...newPackage.benefits];
    updated.splice(index, 1);
    setNewPackage({ ...newPackage, benefits: updated });
  };

  return (
    <div className="p-6 text-[#A5AFC4]">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {editingId ? 'Edit Signal Package' : 'Create Signal Package'}
        </h2>
        <button onClick={resetForm}><X /></button>
      </div>

      {/* Name */}
      <input
        placeholder="Signal Package Name"
        className="w-full mb-3 bg-[#303943] p-2 rounded"
        value={newPackage.name}
        onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
      />

      {/* Amount */}
      <input
        type="number"
        placeholder="Price"
        className="w-full mb-3 bg-[#303943] p-2 rounded"
        value={newPackage.amount}
        onChange={(e) => setNewPackage({ ...newPackage, amount: e.target.value })}
      />

      {/* Strength */}
      <input
        type="number"
        min="0"
        max="100"
        placeholder="Signal Strength (%)"
        className="w-full mb-3 bg-[#303943] p-2 rounded"
        value={newPackage.strength}
        onChange={(e) => setNewPackage({ ...newPackage, strength: e.target.value })}
      />

      {/* Benefits */}
      {newPackage.benefits.map((b, i) => (
        <div key={i} className="flex mb-2">
          <input
            className="flex-1 bg-[#303943] p-2 rounded"
            value={b}
            onChange={(e) => handleBenefitChange(i, e.target.value)}
          />
          <button onClick={() => removeBenefitField(i)} className="ml-2 text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <button onClick={addBenefitField} className="mb-4 flex items-center text-blue-400">
        <Plus size={16} className="mr-1" /> Add Benefit
      </button>

      <div className="flex justify-end gap-2">
        <button onClick={resetForm} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
        <button onClick={handleAddPackage} className="bg-blue-600 px-4 py-2 rounded">
          {editingId ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
};

export default SignalPackageForm;
