import { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Check, File, Send, ChevronDown, ChevronLeft, ChevronRight,
  Mail, Phone, User, Lock, Unlock, MessageSquare, Edit, Trash2, 
  CreditCard, ArrowUp, ArrowDown, RefreshCw, Key, FileText, UserCheck,
  Filter, MoreHorizontal, Settings, AlertTriangle, Eye, Download, Upload, Shield
} from 'lucide-react';

const initialTickets = [
  {
    id: '1',
    subject: 'Login issues',
    priority: 'High',
    status: 'Open',
    createdAt: new Date('2023-05-15T10:30:00Z'),
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      accountType: 'Premium'
    },
    newRepliesCount: 2,
    messages: [
      {
        id: '1-1',
        sender: 'user',
        text: "I can't log in to my account, getting error 500",
        timestamp: new Date('2023-05-15T10:30:00Z'),
        attachments: []
      },
      {
        id: '1-2',
        sender: 'support',
        text: "We're looking into this issue. Can you try clearing your cache?",
        timestamp: new Date('2023-05-15T11:15:00Z'),
        attachments: []
      },
      {
        id: '1-3',
        sender: 'user',
        text: "Tried that, still not working. Here's a screenshot of the error",
        timestamp: new Date('2023-05-15T12:30:00Z'),
        attachments: ['https://example.com/screenshots/error1.png']
      }
    ]
  },
  {
    id: '2',
    subject: 'Payment question',
    priority: 'Medium',
    status: 'Open',
    createdAt: new Date('2023-05-14T09:15:00Z'),
    customer: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      accountType: 'Basic'
    },
    newRepliesCount: 0,
    messages: [
      {
        id: '2-1',
        sender: 'user',
        text: "When will my refund be processed?",
        timestamp: new Date('2023-05-14T09:15:00Z'),
        attachments: []
      }
    ]
  },
  {
    id: '3',
    subject: 'Feature request',
    priority: 'Low',
    status: 'Closed',
    createdAt: new Date('2023-05-10T14:45:00Z'),
    customer: {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      accountType: 'Basic'
    },
    newRepliesCount: 0,
    messages: [
      {
        id: '3-1',
        sender: 'user',
        text: "Can you add dark mode to the app?",
        timestamp: new Date('2023-05-10T14:45:00Z'),
        attachments: []
      },
      {
        id: '3-2',
        sender: 'support',
        text: "Thanks for the suggestion! We've added this to our roadmap.",
        timestamp: new Date('2023-05-11T10:30:00Z'),
        attachments: []
      }
    ]
  }
];

const Support = () => {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showTicketList, setShowTicketList] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      // On desktop, always show both panels
      if (!mobile) {
        setShowTicketList(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeTicket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleSendReply = () => {
    if (!replyText.trim() || !activeTicket) return;

    const newMessage = {
      id: `${activeTicket.id}-${activeTicket.messages.length + 1}`,
      sender: 'support',
      text: replyText,
      timestamp: new Date(),
      attachments: selectedFile ? [URL.createObjectURL(selectedFile)] : []
    };

    const updatedTicket = {
      ...activeTicket,
      messages: [...activeTicket.messages, newMessage]
    };

    const updatedTickets = tickets.map(ticket =>
      ticket.id === activeTicket.id ? updatedTicket : ticket
    );

    setTickets(updatedTickets);
    setActiveTicket(updatedTicket);
    setReplyText('');
    setSelectedFile(null);
    
    // Scroll to bottom after message is sent
    setTimeout(scrollToBottom, 100);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ActionButton = ({ icon, label, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`bg-${color}-600 hover:bg-${color}-700 text-white p-1 md:p-2 rounded-lg flex flex-col items-center justify-center text-xs transition-all duration-200 h-14 md:h-16 shadow-md hover:shadow-lg min-w-[70px]`}
    >
      <div className="h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
        {icon}
      </div>
      <span className="mt-1 text-center px-1">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen bg-[#1E293B] text-[#CBD5E1]">
      {/* Ticket List Sidebar */}
      {(showTicketList || !isMobileView) && (
        <div className="md:w-1/3 lg:w-1/4 border-r border-[#334155] flex flex-col h-full">
          {/* Search Bar */}
          <div className="p-3 md:p-4 border-b border-[#334155] bg-[#1E293B]">
            {isMobileView && activeTicket && (
              <button 
                onClick={() => setShowTicketList(true)}
                className="flex items-center mb-2 text-[#CBD5E1] hover:text-white"
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Back to tickets
              </button>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-[#64748B]" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                className="block w-full pl-10 pr-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-[#CBD5E1] focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Ticket List with custom scrollbar */}
          <div className="flex-1 overflow-y-auto bg-[#1E293B] custom-scrollbar">
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(75, 85, 99, 0.3);
                border-radius: 20px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(75, 85, 99, 0.5);
              }
              .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(75, 85, 99, 0.3) transparent;
              }
            `}</style>
            
            {currentData.length === 0 ? (
              <div className="p-4 text-center text-[#94A3B8]">
                <p>No tickets found</p>
              </div>
            ) : (
              currentData.map(ticket => (
                <div
                  key={ticket.id}
                  className={`p-3 md:p-4 border-b border-[#334155] cursor-pointer hover:bg-[#0F172A] transition-colors ${
                    activeTicket?.id === ticket.id ? 'bg-[#0F172A]' : ''
                  }`}
                  onClick={() => handleTicketSelect(ticket)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate text-[#E2E8F0]">{ticket.subject}</h3>
                    {ticket.newRepliesCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {ticket.newRepliesCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-xs md:text-sm text-[#94A3B8]">
                    <span className={`px-2 py-1 rounded mr-2 mb-1 text-xs ${
                      ticket.priority === 'High' ? 'bg-red-500 text-white' :
                      ticket.priority === 'Medium' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs mb-1 ${
                      ticket.status === 'Open' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {ticket.status}
                    </span>
                    <span className="ml-auto text-xs">{formatDate(ticket.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-xs text-[#94A3B8]">
                    From: {ticket.customer.name} ({ticket.customer.accountType})
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 md:p-4 border-t border-[#334155] bg-[#1E293B] flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <span className="text-xs md:text-sm text-[#94A3B8]">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-[#0F172A] border border-[#334155] text-[#CBD5E1] rounded-md px-2 py-1 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-xs md:text-sm text-[#94A3B8]">
                {startIndex + 1}-{Math.min(endIndex, filteredTickets.length)} of {filteredTickets.length}
              </span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-1 rounded-md ${
                    currentPage === 1 ? 'text-[#64748B] cursor-not-allowed' : 'text-[#CBD5E1] hover:bg-[#0F172A]'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-md ${
                    currentPage === totalPages ? 'text-[#64748B] cursor-not-allowed' : 'text-[#CBD5E1] hover:bg-[#0F172A]'
                  }`}
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details - On desktop, always show this panel */}
      <div className={`${isMobileView && showTicketList ? 'hidden' : 'flex flex-col'} md:flex-1 bg-[#0F172A] h-full`}>
        {activeTicket ? (
          <>
            {/* Ticket Header */}
            <div className="p-3 md:p-4 border-b border-[#334155] bg-[#1E293B]">
              {isMobileView && (
                <button 
                  onClick={() => setShowTicketList(true)}
                  className="flex items-center mb-2 text-[#CBD5E1] hover:text-white text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to tickets
                </button>
              )}
              <div className="flex flex-wrap justify-between items-center">
                <h2 className="text-lg md:text-xl font-semibold text-[#F1F5F9] mb-1 md:mb-0">
                  {activeTicket.subject}
                </h2>
                {activeTicket.status === 'Open' && (
                  <button
                    onClick={handleCloseTicket}
                    className="flex items-center px-2 md:px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-xs md:text-sm text-white"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Close
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center mt-2 text-xs md:text-sm text-[#94A3B8]">
                <span className={`px-2 py-1 rounded mr-2 mb-1 ${
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
                <span className="mb-1">Created: {formatDate(activeTicket.createdAt)}</span>
              </div>
              <div className="mt-2 flex items-center text-xs md:text-sm">
                <div className="bg-blue-500 bg-opacity-20 p-1 rounded-full mr-2">
                  <User className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[#E2E8F0]">{activeTicket.customer.name}</p>
                  <p className="text-[#94A3B8] text-xs truncate">{activeTicket.customer.email} ({activeTicket.customer.accountType})</p>
                </div>
              </div>
            </div>

            {/* Messages with custom scrollbar */}
            <div 
              className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 custom-scrollbar"
              ref={messagesContainerRef}
            >
              {activeTicket.messages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg max-w-[90%] md:max-w-[75%] ${
                    message.sender === 'support' ? 'bg-[#1E293B] ml-auto' : 'bg-blue-600 mr-auto text-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-medium">
                      {message.sender === 'support' ? 'Support Agent' : 'Customer'}
                    </span>
                    <span className={message.sender === 'support' ? 'text-[#94A3B8]' : 'text-blue-200'}>
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm break-words">{message.text}</p>
                  {message.attachments.length > 0 && (
                    <div className="mt-2">
                      {message.attachments.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-xs md:text-sm ${
                            message.sender === 'support' ? 'text-blue-300 hover:underline' : 'text-blue-200 hover:underline'
                          }`}
                        >
                          <File className="h-3 w-3 mr-1" />
                          {file.split('/').pop()}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Area */}
            <div className={`p-3 md:p-4 border-t border-[#334155] bg-[#1E293B] ${
              activeTicket.status === 'Closed' ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="w-full p-3 bg-[#0F172A] border border-[#334155] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[#CBD5E1] resize-none"
                rows={3}
              />
              <div className="flex flex-wrap items-center justify-between mt-2">
                <div className="flex items-center mb-2 md:mb-0">
                  <label className="flex items-center px-2 md:px-3 py-1 bg-[#0F172A] hover:bg-[#1E293B] rounded-md cursor-pointer text-xs md:text-sm mr-2 text-[#CBD5E1]">
                    <File className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Attach
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-xs md:text-sm text-[#94A3B8] truncate max-w-[120px] md:max-w-xs">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className={`flex items-center px-3 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm text-white ${
                    replyText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#334155] cursor-not-allowed'
                  }`}
                >
                  <Send className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#94A3B8]">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Select a ticket to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;