import { ChevronRight } from 'lucide-react';

const SignalPackageHeader = ({ packages }) => {
  return (
    <div className="flex justify-between items-center mb-6 bg-[#282F36] p-4 rounded-sm border border-[#2F3944]">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl font-semibold text-[#aab8c5]">Signal Packages</h1>
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {packages.length}
        </span>
      </div>
      <div className="flex items-center space-x-2 text-[#aab8c5] bg-[#303943] px-3 py-1 rounded-full text-sm">
        <span>Dashboard</span>
        <ChevronRight size={16} />
        <span className="font-medium">Signal Packages</span>
      </div>
    </div>
  );
};

export default SignalPackageHeader;
