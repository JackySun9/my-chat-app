'use client';

import { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [expandedMessages, setExpandedMessages] = useState({});
  const endOfMessagesRef = useRef(null);
  const MESSAGE_LIMIT = 200; // Character limit for displaying "Read More"

  // Load messages from local storage when the component mounts
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    setMessages(savedMessages);
  }, []);

  // Save messages to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Fetch response from the AI model
    const response = await fetchResponseFromAI(input);
    const formattedResponse = formatResponse(response);
    const aiMessage = { sender: 'ai', text: formattedResponse };

    setMessages((prevMessages) => [...prevMessages, userMessage, aiMessage]);
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

    const data = await response.json();
    return data.response;
  };

  // Utility function to format AI response
  const formatResponse = (response) => {
    // Custom formatting logic (e.g., adding new lines)
    return response.split('. ').join('.\n');
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

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
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
  );
};

export default Chat;
