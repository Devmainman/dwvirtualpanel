import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TicketItem from './TicketItem';

const TicketList = ({
  tickets,
  searchTerm,
  setSearchTerm,
  activeTicket,
  handleTicketSelect,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  filteredTickets,
  isMobileView,
  setShowTicketList
}) => {
  return (
    <div className={`${isMobileView ? 'w-full' : 'w-full mt-7 ml-1 md:w-1/3'} flex flex-col border-r border-[#2F3944]`}>
      {/* Header with Search */}
      <div className="p-3 md:p-4 border-b border-[#2F3944] bg-[#282F36]">
        {isMobileView && (
          <button 
            onClick={() => setShowTicketList(true)}
            className="flex items-center mb-2 text-[#A5AFC4] hover:text-white text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </button>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#A5AFC4]" />
          </div>
          <input
            type="text"
            placeholder="Search tickets..."
            className="block w-full pl-10 pr-3 py-2 bg-[#303943] border border-[#2F3944] rounded-md text-sm text-[#A5AFC4] focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tickets */}
      <div className="flex-1 overflow-y-auto bg-[#282F36]">
        {tickets.length === 0 ? (
          <div className="p-4 text-center text-[#A5AFC4]">
            <p>No tickets found</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <TicketItem
              key={ticket.id}
              ticket={ticket}
              activeTicket={activeTicket}
              handleTicketSelect={handleTicketSelect}
            />
          ))
        )}
      </div>

      {/* Footer Pagination Controls */}
      <div className="p-3 md:p-4 border-t border-[#2F3944] bg-[#282F36] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-[#6B7280] whitespace-nowrap">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="bg-[#303943] border border-[#2F3944] text-[#A5AFC4] rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <span className="text-xs sm:text-sm text-[#6B7280] whitespace-nowrap">
            {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-md ${
                currentPage === 1 ? 'text-[#6B7280] cursor-not-allowed' : 'text-[#A5AFC4] hover:bg-[#303943]'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1 rounded-md ${
                currentPage === totalPages ? 'text-[#6B7280] cursor-not-allowed' : 'text-[#A5AFC4] hover:bg-[#303943]'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
