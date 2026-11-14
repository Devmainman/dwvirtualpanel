import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { DollarSign, BarChart2, Headphones, Wrench, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../../api/config';

const getBenefitIcon = (benefit) => {
  if (benefit.toLowerCase().includes('fee')) return <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-2 text-green-500" />;
  if (benefit.toLowerCase().includes('market') || benefit.toLowerCase().includes('report')) return <BarChart2 className="h-3 w-3 md:h-4 md:w-4 mr-2 text-blue-500" />;
  if (benefit.toLowerCase().includes('support')) return <Headphones className="h-3 w-3 md:h-4 md:w-4 mr-2 text-purple-500" />;
  if (benefit.toLowerCase().includes('tool')) return <Wrench className="h-3 w-3 md:h-4 md:w-4 mr-2 text-yellow-500" />;
  if (benefit.toLowerCase().includes('withdrawal')) return <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 mr-2 text-red-500" />;
  return <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2 text-gray-500" />;
};

const PackageItem = ({ pkg, currency, handleEditPackage, handleDeletePackage, toggleStatus, isLoading }) => {
  return (
    <div className={`h-full bg-[#282F36] rounded-lg shadow-md p-4 md:p-6 border border-[#2F3944] ${
      isLoading ? 'opacity-75' : ''
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          {/* Package Icon Display */}
          {pkg.icon && (
            <div className="h-12 w-12 rounded-md overflow-hidden border border-[#3A4451] flex-shrink-0">
              <img 
                src={`${API_BASE_URL.replace('/api', '')}${pkg.icon}`}
                alt="Package icon"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-package-icon.png';
                }}
              />
            </div>
          )}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-[#A5AFC4]">{pkg.name}</h3>
            <div className="flex items-center mt-1">
              <span className="text-base md:text-lg font-medium text-blue-400 mr-2">
                {pkg.currency} {pkg.amount}
              </span>
              <span 
                className={`inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-xs font-medium cursor-pointer ${
                  pkg.status === 'Active' 
                    ? 'bg-green-900 text-green-100' 
                    : 'bg-red-900 text-red-100'
                } ${isLoading ? 'cursor-not-allowed' : ''}`}
                onClick={() => !isLoading && toggleStatus(pkg._id)}
              >
                {pkg.status === 'Active' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {pkg.status}
              </span>
            </div>

            {pkg.threshold && (
              <div className="mt-2">
                <span className="text-sm text-[#6B7280]">Max Threshold:</span>
                <span className="text-sm text-[#A5AFC4] ml-1">{pkg.threshold}</span>
              </div>
            )}
            {pkg.requiredSignal && (
              <div>
                <span className='text-sm text-[#6B7280]'>Required Signal:</span>
                <span className='text-sm text-[#A5AFC4] ml-1'>{pkg.requiredSignal}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => !isLoading && handleEditPackage(pkg)}
            disabled={isLoading}
            className={`p-2 rounded-md bg-[#303943] text-blue-400 hover:bg-[#3A4451] transition-colors duration-150 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
            title="Edit"
          >
            <Edit className="h-3 w-3 md:h-4 md:w-4" />
          </button>
          <button
            onClick={() => !isLoading && handleDeletePackage(pkg._id)}
            disabled={isLoading}
            className={`p-2 rounded-md bg-[#303943] text-red-400 hover:bg-[#3A4451] transition-colors duration-150 ${
              isLoading ? 'cursor-not-allowed' : ''
            }`}
            title="Delete"
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-xs md:text-sm font-medium text-[#6B7280] mb-2">Benefits</h4>
        <ul className="space-y-2">
          {pkg.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              {getBenefitIcon(benefit)}
              <span className="text-[#A5AFC4] text-sm md:text-base">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PackageItem;