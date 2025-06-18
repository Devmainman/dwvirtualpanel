import { useState } from 'react';
import { File, Send } from 'lucide-react';

const ReplyForm = ({ activeTicket, setTickets, setActiveTicket }) => {
  const [replyText, setReplyText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
  };

  if (activeTicket.status === 'Closed') {
    return (
      <div className="p-3 md:p-4 border-t border-[#2F3944] bg-[#303943] opacity-50 pointer-events-none">
        <p className="text-center text-[#6B7280]">This ticket is closed</p>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 border-t border-[#2F3944] bg-[#303943]">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Type your reply here..."
        className="w-full p-3 bg-[#282F36] border border-[#2F3944] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-[#A5AFC4]"
        rows={3}
      />
      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center px-2 md:px-3 py-1 bg-[#282F36] hover:bg-[#303943] rounded-md cursor-pointer text-xs md:text-sm">
          <File className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Attach
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {selectedFile && (
          <span className="text-xs md:text-sm text-[#6B7280] truncate max-w-[120px] md:max-w-xs">
            {selectedFile.name}
          </span>
        )}
        <button
          onClick={handleSendReply}
          disabled={!replyText.trim()}
          className={`flex items-center px-3 md:px-4 py-1 md:py-2 rounded-md text-xs md:text-sm ${
            replyText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#2F3944] cursor-not-allowed'
          }`}
        >
          <Send className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          Send
        </button>
      </div>
    </div>
  );
};

export default ReplyForm;