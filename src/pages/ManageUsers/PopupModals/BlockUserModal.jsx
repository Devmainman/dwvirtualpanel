import React, { useState } from 'react';

const BlockUserModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#282F36] text-[#aab8c5] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Block User</h2>
        <textarea
          rows={4}
          className="w-full text-[#aab8c5] border rounded p-2 text-sm"
          placeholder="Enter reason for blocking..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-[#3a4552] rounded hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) return alert('Reason required');
              onConfirm(reason.trim());
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirm Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal;
