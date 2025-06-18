const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const TicketItem = ({ ticket, activeTicket, handleTicketSelect }) => {
    return (
      <div
        className={`p-3 md:p-4 border-b border-[#2F3944] cursor-pointer hover:bg-[#303943] transition-colors ${
          activeTicket?.id === ticket.id ? 'bg-[#303943]' : ''
        }`}
        onClick={() => handleTicketSelect(ticket)}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-medium truncate text-[#A5AFC4]">{ticket.subject}</h3>
          {ticket.newRepliesCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {ticket.newRepliesCount}
            </span>
          )}
        </div>
        <div className="flex items-center mt-2 text-xs md:text-sm text-[#6B7280]">
          <span className={`px-2 py-1 rounded mr-2 text-xs ${
            ticket.priority === 'High' ? 'bg-red-500 text-white' :
            ticket.priority === 'Medium' ? 'bg-yellow-500 text-white' :
            'bg-green-500 text-white'
          }`}>
            {ticket.priority}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            ticket.status === 'Open' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {ticket.status}
          </span>
          <span className="ml-auto">{formatDate(ticket.createdAt)}</span>
        </div>
        <div className="mt-1 text-xs text-[#6B7280]">
          From: {ticket.customer.name} ({ticket.customer.accountType})
        </div>
      </div>
    );
  };
  
  export default TicketItem;