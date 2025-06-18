import { X } from 'lucide-react';

export default function ViewFormSubmission({ form, onClose }) {
  if (!form || !form.formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#282F36] rounded-lg border border-[#2F3944] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[#3A4451]">
          <h2 className="text-xl font-bold text-[#aab8c5]">
            Form Submission Details - {form.referenceId?.title}
          </h2>
          <button 
            onClick={onClose}
            className="text-[#A5AFC4] hover:text-white p-1 rounded-full hover:bg-[#3A4451] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-[#aab8c5] mb-2">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-[#A5AFC4]">Account ID</p>
                <p className="text-[#A5AFC4] font-mono">{form.userId?.accountId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#A5AFC4]">Full Name</p>
                <p className="text-[#A5AFC4]">{form.userId?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-[#A5AFC4]">Submitted At</p>
                <p className="text-[#A5AFC4]">
                  {new Date(form.submittedAt || form.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#A5AFC4]">Form Status</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  form.formStatus === 'Submitted' 
                    ? 'bg-green-900 text-green-100' 
                    : form.formStatus === 'Rejected'
                      ? 'bg-red-900 text-red-100'
                      : 'bg-yellow-900 text-yellow-100'
                }`}>
                  {form.formStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#aab8c5] mb-2">Submitted Data</h3>
            <div className="bg-[#303943] p-4 rounded-md border border-[#3A4451]">
              <pre className="text-[#A5AFC4] text-sm overflow-x-auto">
                {JSON.stringify(form.formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#3A4451] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#3A4451] text-[#A5AFC4] hover:bg-[#303943] rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}