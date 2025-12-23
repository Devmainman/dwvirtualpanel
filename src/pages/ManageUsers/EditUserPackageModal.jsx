// components/PopupModals/EditUserPackageModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditUserPackageModal = ({ isOpen, onClose, onSave, currentPackage, availablePackages }) => {
  const [selectedPackageId, setSelectedPackageId] = useState(currentPackage?._id || '');

  useEffect(() => {
    if (isOpen) setSelectedPackageId(currentPackage?._id || '');
  }, [isOpen, currentPackage]);

  const handleSubmit = () => {
    if (!selectedPackageId) return alert('Please select a package');
    onSave(selectedPackageId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit User Package</h2>
        <select
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
          className="w-full border p-2 mb-4"
        >
          <option value="">-- Select Package --</option>
          {availablePackages.map((pkg) => (
            <option key={pkg._id} value={pkg._id}>
              {pkg.name} - {pkg.price} {pkg.currency}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

EditUserPackageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentPackage: PropTypes.object,
  availablePackages: PropTypes.array.isRequired,
};

export default EditUserPackageModal;
