import React from 'react';

const FeedbackModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-[#1f2937] text-white rounded-lg shadow-lg p-6 max-w-md w-[90%]">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="mb-4 text-sm text-gray-300">{message}</p>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default FeedbackModal;
