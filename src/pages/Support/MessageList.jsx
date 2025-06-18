import { File } from 'lucide-react';

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const MessageList = ({ messages }) => {
  return (
    <div className="flex-1 overflow-x-auto p-3 md:p-4 space-y-3 md:space-y-4">
      {messages.map(message => (
        <div 
          key={message.id} 
          className={`p-3 rounded-lg max-w-[90%] md:max-w-3/4 ${
            message.sender === 'support' ? 'bg-[#303943] ml-auto' : 'bg-blue-600 mr-auto text-white'
          }`}
        >
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-medium">
              {message.sender === 'support' ? 'Support Agent' : 'Customer'}
            </span>
            <span className={message.sender === 'support' ? 'text-[#6B7280]' : 'text-blue-200'}>
              {formatDate(message.timestamp)}
            </span>
          </div>
          <p className="text-sm">{message.text}</p>
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
    </div>
  );
};

export default MessageList;