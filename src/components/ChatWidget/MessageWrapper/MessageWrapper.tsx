import { useEffect, useRef } from "react";
import { Message } from '../../../types/chat';

type Props = {
  messages: Message[];
  currentUser: string;
};

const MessageWrapper = ({ messages, currentUser }: Props) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: "10px" }}>
      {messages.map((msg, i) => (
        <div
          key={i}
          style={{
            textAlign: msg.sender === currentUser ? "right" : "left",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "10px",
              background:
                msg.sender === currentUser ? "#DCF8C6" : "#eee",
            }}
          >
            <div>{msg.message}</div>

            <div style={{ fontSize: "10px", color: "gray" }}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      {/* Auto-scroll target */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageWrapper;