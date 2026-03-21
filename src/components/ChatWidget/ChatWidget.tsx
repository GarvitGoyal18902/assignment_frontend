import { useState, useRef, useEffect } from "react";
import MessageInput from './MessageInput/MessageInput';
import { Message } from '../../types/chat';

type Props = {
  messages: Message[];
  currentUser: string;
  onSendMessage: (message: string) => void;
};

const ChatWidget = ({ messages, currentUser, onSendMessage }: Props) => {
  const [open, setOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // If chat is closed and a new message arrives, show ping
    if (!open && messages.length > 0) {
      setHasNewMessage(true);
      const timer = setTimeout(() => setHasNewMessage(false), 1200); // ping lasts 1.2s
      return () => clearTimeout(timer);
    }
  }, [messages, open]);

  // Type-safe date formatter
 const formatDate = (iso: string | Date | undefined) => {
  if (!iso) return ""; // return empty string if undefined
  const d = typeof iso === "string" || iso instanceof String ? new Date(iso as string) : iso;
  if (isNaN(d.getTime())) return ""; // invalid date
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')} ${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

  return (
    <>
      {/* Floating Chat Button with Ping */}
      <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
        {hasNewMessage && !open && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#F43F5E",
              animation: "ping 1.2s ease-out",
              opacity: 0.7,
            }}
          />
        )}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            color: "white",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            fontSize: "28px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          💬
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "500px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #ddd", background: "#F3F4F6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: "bold" }}>Live Chat</div>
                <div style={{ fontSize: "12px", color: "gray" }}>Discuss the poll in real time</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {messages.map((msg, idx) => {
              const isCurrentUser = msg.sender === currentUser;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isCurrentUser ? "flex-end" : "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "gray", marginBottom: "2px" }}>
                    {msg.sender} • {formatDate(msg.createdAt)}
                  </div>
                  <div
                    style={{
                      backgroundColor: isCurrentUser ? "#7C3AED" : "#E5E7EB",
                      color: isCurrentUser ? "white" : "black",
                      padding: "10px 14px",
                      borderRadius: "16px",
                      maxWidth: "80%",
                      wordBreak: "break-word",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <MessageInput onSendMessage={onSendMessage} />
        </div>
      )}

      {/* Ping Animation CSS */}
      <style>
        {`
          @keyframes ping {
            0% { transform: scale(0.5); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 0.4; }
            100% { transform: scale(1); opacity: 0; }
          }
        `}
      </style>
    </>
  );
};

export default ChatWidget;