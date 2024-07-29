'use client';

import { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [expandedMessages, setExpandedMessages] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [expandedChatIndexes, setExpandedChatIndexes] = useState({});
  const endOfMessagesRef = useRef(null);
  const MESSAGE_LIMIT = 1000; // Character limit for displaying "Read More"

  // Load messages and chat history from local storage when the component mounts
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    const savedChatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setMessages(savedMessages);
    setChatHistory(savedChatHistory);
  }, []);

  // Save messages and chat history to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [messages, chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Fetch response from the AI model using streaming
    await fetchResponseFromAI(input);
    setInput('');
  };

  const fetchResponseFromAI = async (message) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = { sender: 'ai', text: '' };
    let aggregatedText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const decodedText = decoder.decode(value, { stream: true });
      aggregatedText += decodedText;
      aiMessage.text = formatResponse(aggregatedText);
      setMessages((prevMessages) => [...prevMessages.slice(0, -1), aiMessage]);
    }
  };

  const formatResponse = (response) => {
    // Format the response by joining segments, handling escaped characters,
    // and removing empty values
    const segments = response.replace(/(?:\\n|\\")/g, match => {
      if (match === '\\n') return '\n';
      if (match === '\\"') return '"';
    }).split('"').filter((_, index) => index % 2 !== 0);
  
    // Remove empty values
    const nonEmptySegments = segments.filter(segment => segment.trim() !== '' && segment !== '\n0:');
  
    // Join the segments into a single string
    return nonEmptySegments.join('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find(msg => msg.sender === 'user')?.text || 'New Chat';
      setChatHistory((prevHistory) => [...prevHistory, { title: firstUserMessage, messages }]);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChatHistoryVisibility = (index) => {
    setExpandedChatIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Panel */}
      <div className="w-64 bg-gray-200 overflow-y-auto flex flex-col">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Chat History</h2>
          <button onClick={startNewChat} className="p-2 bg-green-500 text-white rounded">
            Start New Chat
          </button>
        </div>
        {chatHistory.map((chat, index) => (
          <div key={index} className="border-b">
            <div
              className="p-4 cursor-pointer bg-gray-300"
              onClick={() => toggleChatHistoryVisibility(index)}
            >
              <h3 className="font-bold">{chat.title}</h3>
            </div>
            {expandedChatIndexes[index] && (
              <div className="p-4">
                {chat.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <span
                      className={`inline-block px-4 py-2 rounded ${
                        msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                      }`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <span
                className={`inline-block px-4 py-2 rounded ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {expandedMessages[idx] || msg.text.length <= MESSAGE_LIMIT
                  ? msg.text
                  : `${msg.text.slice(0, MESSAGE_LIMIT)}...`}
                {msg.text.length > MESSAGE_LIMIT && (
                  <button
                    onClick={() => toggleExpandMessage(idx)}
                    className="ml-2 text-blue-500 underline"
                  >
                    {expandedMessages[idx] ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </span>
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
        </div>
        <div className="p-4 bg-gray-100 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2 border rounded mr-2"
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
