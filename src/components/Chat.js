"use client";

import { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [expandedChatIndexes, setExpandedChatIndexes] = useState({});
  const [selectedModel, setSelectedModel] = useState("meta-llama/Meta-Llama-3.1-70B-Instruct");
  const endOfMessagesRef = useRef(null);

  const models = [
    "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    "mistralai/Mistral-Nemo-Instruct-2407",
    "suntomoon/Mistral-Large-Instruct-2407",
  ];

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    const savedChatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setMessages(savedMessages);
    setChatHistory(savedChatHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [messages, chatHistory]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const inputMessage = input;
    setInput("");

    const allUserMessages = [...messages, userMessage]
      .map(msg => `${msg.sender}: ${msg.text}`)
      .join("\n");

    await fetchResponseFromAI(allUserMessages, selectedModel);
  };

  const fetchResponseFromAI = async (message, model) => {
     // Display the user's message immediately
     setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: message },
    ]);
    
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
    const segments = response
      .replace(/(?:\\n|\\")/g, (match) => (match === "\\n" ? "\n" : '"'))
      .split('"')
      .filter((_, index) => index % 2 !== 0)
      .filter((segment) => segment.trim() !== "" && segment !== "\n0:");

    return segments.join("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      const firstUserMessage = messages.find((msg) => msg.sender === "user")?.text || "New Chat";
      const filteredMessages = messages.filter((msg) => msg.text.trim() !== "");
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { title: firstUserMessage, messages: filteredMessages },
      ]);
      setMessages([]);
    }
  };

  const deleteChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  const deleteSingleChat = (index) => {
    const updatedChatHistory = chatHistory.filter((_, i) => i !== index);
    setChatHistory(updatedChatHistory);
    localStorage.setItem("chatHistory", JSON.stringify(updatedChatHistory));
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
          <div>
            <button onClick={startNewChat} className="p-2 bg-green-500 text-white rounded">
              Start New Chat
            </button>
            <button onClick={deleteChatHistory} className="p-2 bg-red-500 text-white rounded ml-2">
              Delete All
            </button>
          </div>
        </div>
        {chatHistory.map((chat, index) => (
          <div key={index} className="border-b">
            <div className="p-4 cursor-pointer bg-gray-300 flex justify-between items-center" onClick={() => toggleChatHistoryVisibility(index)}>
              <h3 className="font-bold">{chat.title}</h3>
              <button onClick={(e) => { e.stopPropagation(); deleteSingleChat(index); }} className="p-1 bg-red-500 text-white rounded">
                Delete
              </button>
            </div>
            {expandedChatIndexes[index] && (
              <div className="p-4">
                {chat.messages.map((msg, idx) => (
                  <div key={idx} className={`p-2 my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <span
                      className={`inline-block px-4 py-2 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
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
          <label htmlFor="model-select" className="mr-2 font-bold">Select Model:</label>
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
            <div key={idx} className={`p-2 my-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span
                className={`inline-block px-4 py-2 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
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
