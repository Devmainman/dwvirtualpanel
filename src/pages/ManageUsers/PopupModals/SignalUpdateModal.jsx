import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SignalStrengthModal = ({ isOpen, onClose, onSubmit, currentValue }) => {
  const [strength, setStrength] = useState(currentValue ?? 100);

  const handleSubmit = () => {
    const parsed = parseInt(strength);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert("Signal strength must be a whole number between 0 and 100");
      return;
    }
    onSubmit(parsed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
      <div className="bg-[#1f2937] rounded-lg p-6 w-full max-w-sm text-white">
        <h2 className="text-lg font-semibold mb-4">Update Signal Strength</h2>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={strength}
          onChange={(e) => setStrength(e.target.value)}
          className="w-full bg-[#111827] px-3 py-2 rounded text-white border border-gray-600 focus:outline-none focus:ring"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

SignalStrengthModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  currentValue: PropTypes.number,
};

export default SignalStrengthModal;
