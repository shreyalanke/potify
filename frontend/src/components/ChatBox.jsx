import { useEffect, useState, useRef } from "react";

function ChatBox({ socket, user }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleChatHistory = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "chat_history") {
        setMessages(message.messages || []);
      }
    };

    const handleNewMessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "new_message") {
        setMessages((prev) => [...prev, message.message]);
      }
    };

    socket.addEventListener("message", handleChatHistory);
    socket.addEventListener("message", handleNewMessage);

    return () => {
      socket.removeEventListener("message", handleChatHistory);
      socket.removeEventListener("message", handleNewMessage);
    };
  }, [socket]);

  function handleSendMessage(e) {
    e.preventDefault();

    if (!inputValue.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    setSending(true);

    socket.send(
      JSON.stringify({
        type: "send_message",
        message: inputValue.trim(),
      })
    );

    setInputValue("");
    setSending(false);
  }

  function formatTime(isoString) {
    if (!isoString) return "";
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
      {/* Chat Header */}
      <h3 className="font-semibold text-gray-200 text-sm">Chat</h3>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-green-400">
                  {msg.senderName}
                </span>
                <span className="text-xs text-gray-600">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-200 break-words">
                {msg.text}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto pt-2 border-t border-gray-800">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={sending || !socket}
          className="flex-1 bg-gray-950 border border-gray-700 text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-xs placeholder-gray-600 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim() || !socket}
          className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-3 py-1.5 rounded-lg transition text-xs whitespace-nowrap"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
