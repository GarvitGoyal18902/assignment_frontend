import { useState } from "react";
import MessageWrapper from './MessageWrapper/MessageWrapper';
import MessageInput from './MessageInput/MessageInput';
import { Message } from '../../types/chat';

type Props = {
  messages: Message[];
  currentUser: string;
  onSendMessage: (message: string) => void;
};

const ChatWidget = ({ messages, currentUser, onSendMessage }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "55px",
          height: "55px",
          borderRadius: "50%",
          zIndex: 1000,
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "320px",
            height: "450px",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div>Live Chat</div>
                <div style={{ fontSize: "12px", color: "gray" }}>
                  Discuss the poll in real time
                </div>
              </div>
              <button onClick={() => setOpen(false)}>X</button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <MessageWrapper messages={messages} currentUser={currentUser} />
          </div>

          {/* Input */}
          <MessageInput onSendMessage={onSendMessage} />
        </div>
      )}
    </>
  );
};

export default ChatWidget;