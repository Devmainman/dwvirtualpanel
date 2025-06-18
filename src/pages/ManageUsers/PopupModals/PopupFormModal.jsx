import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const PopupFormModal = ({ forms, onSelectForm, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-[#282F36] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-[#303943]">
        <h3 className="text-lg font-medium text-[#aab8c5]">Select Form to Assign</h3>
        <button onClick={onClose} className="text-[#6B7280] hover:text-[#aab8c5]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        {forms.length === 0 ? (
          <p className="text-[#A5AFC4] text-center py-4">No forms available</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {forms.map(form => (
              <div 
                key={form._id}
                onClick={() => onSelectForm(form)}
                className="bg-[#303943] p-4 rounded-lg cursor-pointer hover:bg-[#3a4551] transition-colors border border-transparent hover:border-blue-500"
              >
                <h4 className="text-lg font-medium text-[#aab8c5] mb-1">{form.title}</h4>
                <p className="text-sm text-[#6B7280]">{form.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

PopupFormModal.propTypes = {
  forms: PropTypes.array.isRequired,
  onSelectForm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default PopupFormModal;