import { ChevronRight } from 'lucide-react';

const PackageHeader = ({ packages }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center border border-[#2F3944] justify-between mb-4 md:mb-6 bg-[#282F36] p-3 md:p-4 rounded-sm">
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <h1 className="text-xl md:text-2xl font-semibold text-[#aab8c5]">Account Packages</h1>
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{packages.length}</span>
      </div>
      <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-2 py-1 md:px-3 rounded-full text-xs md:text-sm">
        <span>Dashboard</span>
        <ChevronRight size={14} className="text-gray-500" />
        <span className="font-medium">Packages</span>
      </div>
    </div>
  );
};

export default PackageHeader;