const UserPagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between bg-[#282F36] rounded-lg shadow-md p-3 md:p-4">
      <div className="text-xs md:text-sm text-[#A5AFC4] mb-2 sm:mb-0">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-1 md:space-x-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-[#303943] text-[#A5AFC4] px-2 py-1 md:px-3 rounded-md disabled:opacity-50 text-xs md:text-sm"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-2 py-1 md:px-3 rounded-md text-xs md:text-sm ${
                currentPage === pageNum 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#303943] text-[#A5AFC4] hover:bg-[#3A4451]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-[#303943] text-[#A5AFC4] px-2 py-1 md:px-3 rounded-md disabled:opacity-50 text-xs md:text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserPagination;