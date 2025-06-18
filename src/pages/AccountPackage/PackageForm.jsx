import { Trash2, Plus, X, Upload } from 'lucide-react';

const PackageForm = ({
  newPackage,
  setNewPackage,
  handleBenefitChange,
  addBenefitField,
  removeBenefitField,
  handleAddPackage,
  resetForm,
  editingId,
  isLoading
}) => {
  return (
    <div className="bg-[#282F36] rounded-lg shadow-md p-4 md:p-6 border border-[#2F3944]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-[#aab8c5]">
          {editingId ? 'Edit Package' : 'Create New Package'}
        </h2>
        <button 
          onClick={resetForm}
          className="text-[#6B7280] hover:text-[#aab8c5] transition-colors"
          disabled={isLoading}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-1">Package Name*</label>
          <input
            type="text"
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Basic, Premium, VIP"
            value={newPackage.name}
            onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
            disabled={isLoading}
          />
        </div>
        
        
<div>
  <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-1">
    Package Icon
  </label>
  <div className="flex items-center gap-2">
    <label className="flex-1">
      <div className="flex items-center justify-center w-full px-4 py-2 bg-[#303943] border border-[#3A4451] rounded-md cursor-pointer hover:bg-[#3A4451] transition-colors">
        <Upload className="h-4 w-4 mr-2" />
        <span className="text-sm">
          {newPackage.iconFile ? newPackage.iconFile.name : 'Choose an image'}
        </span>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files[0]) {
            setNewPackage({...newPackage, iconFile: e.target.files[0]});
          }
        }}
        disabled={isLoading}
      />
    </label>
    {newPackage.icon && !newPackage.iconFile && (
  <div className="h-10 w-10 rounded-md overflow-hidden border border-[#3A4451]">
    <img 
      src={newPackage.icon.startsWith('/uploads') 
           ? `${window.location.origin}${newPackage.icon}`
           : newPackage.icon}
      alt="Current icon" 
      className="h-full w-full object-cover"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/default-package-icon.png';
      }}
    />
  </div>
)}
  </div>
</div>
        
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-1">Currency</label>
          <select
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={newPackage.currency}
            onChange={(e) => setNewPackage({...newPackage, currency: e.target.value})}
            disabled={isLoading}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-1">Amount*</label>
          <input
            type="number"
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Package price"
            value={newPackage.amount}
            onChange={(e) => setNewPackage({...newPackage, amount: e.target.value})}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-1">Status</label>
          <select
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={newPackage.status}
            onChange={(e) => setNewPackage({...newPackage, status: e.target.value})}
            disabled={isLoading}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-2">Maximum threshold</label>
          <input
            type="number"
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            placeholder="Maximum Threshold"
            value={newPackage.threshold}
            onChange={(e) => setNewPackage({...newPackage, threshold: e.target.value})}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-2">Required Signal</label>
          <input
            type="number"
            className="w-full bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            placeholder="Required Signal"
            value={newPackage.requiredSignal}
            onChange={(e) => setNewPackage({...newPackage, requiredSignal: e.target.value})}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs md:text-sm font-medium text-[#6B7280] mb-2">Benefits*</label>
        {newPackage.benefits.map((benefit, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              className="flex-1 bg-[#303943] border border-[#3A4451] text-[#A5AFC4] p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mr-2"
              placeholder="Enter benefit description"
              value={benefit}
              onChange={(e) => handleBenefitChange(index, e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={() => removeBenefitField(index)}
              className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-150"
              disabled={isLoading}
            >
              <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addBenefitField}
          className="mt-2 px-3 py-1 bg-[#303943] hover:bg-[#3A4451] text-[#A5AFC4] rounded-md flex items-center text-xs md:text-sm transition-colors duration-150"
          disabled={isLoading}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Benefit
        </button>
      </div>
      
      <div className="flex justify-between items-center">
        <button
          onClick={resetForm}
          disabled={isLoading}
          className={`px-3 md:px-4 py-1 md:py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleAddPackage}
          disabled={isLoading || !newPackage.name || !newPackage.amount || newPackage.benefits.filter(b => b.trim() !== '').length === 0}
          className={`px-3 md:px-4 py-1 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition-all duration-200 shadow-md hover:shadow-lg text-xs md:text-sm ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            'Processing...'
          ) : editingId ? (
            'Update Package'
          ) : (
            'Create Package'
          )}
        </button>
      </div>
    </div>
  );
};

export default PackageForm;