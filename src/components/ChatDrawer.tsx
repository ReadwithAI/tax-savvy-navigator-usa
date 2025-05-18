import React, { useState, useRef } from "react";

export function ChatDrawer({ strategy, userProfile, chatHistory, setChatHistory }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamedMessage, setStreamedMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setChatHistory([...chatHistory, userMsg]);
    setInput("");
    setLoading(true);
    setStreamedMessage("");

    // Stream response from API
    const response = await fetch("http://localhost:3001/api/strategy-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategy,
        userProfile,
        chatHistory: [...chatHistory, userMsg],
      }),
    });
    if (!response.body) return;
    const reader = response.body.getReader();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      result += chunk;
      setStreamedMessage(result);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    setChatHistory([...chatHistory, userMsg, { role: "assistant", content: result }]);
    setLoading(false);
    setStreamedMessage("");
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamedMessage]);

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto p-2 bg-muted rounded mb-2">
        {chatHistory.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right mb-2" : "text-left mb-2"}>
            <span className={msg.role === "user" ? "bg-blue-100 text-blue-900 px-2 py-1 rounded" : "bg-gray-100 text-gray-900 px-2 py-1 rounded"}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-2">
            <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded animate-pulse">{streamedMessage}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this strategy..."
          disabled={loading}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
} 