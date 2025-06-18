import { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import { initialTickets } from './data';

const Support = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeTicket, setActiveTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showTicketList, setShowTicketList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTickets.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = filteredTickets.slice(startIndex, endIndex);

  const handleTicketSelect = (ticket) => {
    const updatedTickets = tickets.map(t => 
      t.id === ticket.id ? { ...t, newRepliesCount: 0 } : t
    );
    setTickets(updatedTickets);
    setActiveTicket({ ...ticket, newRepliesCount: 0 });
    if (isMobileView) setShowTicketList(false);
  };

  const handleCloseTicket = () => {
    if (!activeTicket) return;
    
    const updatedTickets = tickets.map(ticket =>
      ticket.id === activeTicket.id ? { ...ticket, status: 'Closed' } : ticket
    );
    
    setTickets(updatedTickets);
    setActiveTicket({ ...activeTicket, status: 'Closed' });
  };

  return (
    
    <div className="flex-col w-full bg-[#1E252C] text-[#A5AFC4]">

<div className="flex flex-1 overflow-hidden">
{(showTicketList || !isMobileView) && (
        <TicketList
          tickets={currentData}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTicket={activeTicket}
          handleTicketSelect={handleTicketSelect}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          filteredTickets={filteredTickets}
          isMobileView={isMobileView}
          setShowTicketList={setShowTicketList}
        />
      )}

      {(!showTicketList || !isMobileView) && (
        <TicketDetail
          activeTicket={activeTicket}
          setActiveTicket={setActiveTicket}
          setTickets={setTickets}
          tickets={tickets}
          handleCloseTicket={handleCloseTicket}
          isMobileView={isMobileView}
          setShowTicketList={setShowTicketList}
        />
      )}
    </div>
    </div>
  );
};

export default Support;