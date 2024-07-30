"use client";

import { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expandedMessages, setExpandedMessages] = useState({});
  const [chatHistory, setChatHistory] = useState([]);
  const [expandedChatIndexes, setExpandedChatIndexes] = useState({});
  const [selectedModel, setSelectedModel] = useState(
    "meta-llama/Meta-Llama-3.1-8B-Instruct"
  ); // Default model
  const endOfMessagesRef = useRef(null);
  const MESSAGE_LIMIT = 200; // Character limit for displaying "Read More"

  const models = [
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "mistralai/Mistral-Nemo-Instruct-2407",
  ];

  // Load messages and chat history from local storage when the component mounts
  useEffect(() => {
    const savedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    const savedChatHistory =
      JSON.parse(localStorage.getItem("chatHistory")) || [];
    setMessages(savedMessages);
    setChatHistory(savedChatHistory);
  }, []);

  // Save messages and chat history to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [messages, chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    // Fetch response from the AI model using the selected model
    await fetchResponseFromAI(input, selectedModel);
    setInput("");
  };

  const fetchResponseFromAI = async (message, model) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, model }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessage = { sender: "ai", text: "" };
    let aggregatedText = "";

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
    const segments = response
      .replace(/(?:\\n|\\")/g, (match) => {
        if (match === "\\n") return "\n";
        if (match === '\\"') return '"';
      })
      .split('"')
      .filter((_, index) => index % 2 !== 0);

    // Remove empty values
    const nonEmptySegments = segments.filter(
      (segment) => segment.trim() !== "" && segment !== "\n0:"
    );

    // Join the segments into a single string
    return nonEmptySegments.join("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
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
      const firstUserMessage =
        messages.find((msg) => msg.sender === "user")?.text || "New Chat";
      const filteredMessages = messages.filter((msg) => msg.text.trim() !== "");
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { title: firstUserMessage, messages: filteredMessages },
      ]);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChatHistoryVisibility = (index) => {
    setExpandedChatIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  return (
    <div className="flex h-screen">
  <div className="fixed left-0 top-0 w-64 h-full bg-gray-200 overflow-y-auto flex flex-col flex-shrink-0">
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
  <div className="ml-64 flex flex-col flex-1">
    <div className="fixed top-0 left-64 w-full bg-white shadow-md z-10 flex items-center p-4">
      <label htmlFor="model-select" className="mr-2 font-bold">
        Select Model:
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={handleModelChange}
        className="p-2 border rounded"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
    <div className="mt-16 p-4 flex-1 overflow-y-auto">
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
      <button
        onClick={sendMessage}
        className="p-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  </div>
</div>

  );
};

export default Chat;
