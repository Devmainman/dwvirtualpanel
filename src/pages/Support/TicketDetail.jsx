import { X, ChevronLeft, File, Send, User } from 'lucide-react';

import MessageList from './MessageList';
import ReplyForm from './ReplyForm';

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  
const TicketDetail = ({
  activeTicket,
  handleCloseTicket,
  isMobileView,
  setShowTicketList,
  setTickets,
  setActiveTicket
}) => {
  if (!activeTicket) {
    return (
      <div className="flex flex border w-full mt-7 pb-100 pt-20 items-center justify-center text-[#6B7280]">
        <p>Select a ticket to view details</p>
      </div>
    );
  }

  return (
    <div className={`${isMobileView ? 'w-full' : 'mt-7 flex-1'} flex flex-col bg-[#282F36]`}>
      <div className="p-3 md:p-4 border-b border-[#2F3944] bg-[#303943]">
        {isMobileView && (
          <button 
            onClick={() => setShowTicketList(true)}
            className="flex items-center mb-2 text-[#A5AFC4] hover:text-white text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to tickets
          </button>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold text-[#aab8c5]">{activeTicket.subject}</h2>
          {activeTicket.status === 'Open' && (
            <button
              onClick={handleCloseTicket}
              className="flex items-center px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-xs md:text-sm"
            >
              <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              Close
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-between items-center mt-2 text-xs md:text-sm text-[#6B7280]">
        <div className="flex justify-start items-center text-xs md:text-sm">
          <div className="bg-blue-500 bg-opacity-20 p-1 rounded-full mr-2">
            <User className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[#A5AFC4]">{activeTicket.customer.name}</p>
            
          </div>
        </div>
        <div>

        <span className="mb-1">Created: {formatDate(activeTicket.createdAt)}</span>
          <span className={`px-2 ml-3 py-1 rounded mr-2 mb-1 ${
            activeTicket.priority === 'High' ? 'bg-red-500 text-white' :
            activeTicket.priority === 'Medium' ? 'bg-yellow-500 text-white' :
            'bg-green-500 text-white'
          }`}>
            {activeTicket.priority}
          </span>
          <span className={`px-2 py-1 rounded mr-2 mb-1 ${
            activeTicket.status === 'Open' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {activeTicket.status}
          </span>

        </div>
        
         
        </div>
       
      </div>

      <MessageList messages={activeTicket.messages} />

      <ReplyForm
        activeTicket={activeTicket}
        setTickets={setTickets}
        setActiveTicket={setActiveTicket}
      />
    </div>
  );
};

export default TicketDetail;