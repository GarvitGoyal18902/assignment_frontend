import { useState } from "react";

type Props = {
  onSendMessage: (message: string) => void;
};

const MessageInput = ({ onSendMessage }: Props) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <div style={{ display: "flex", padding: "10px", borderTop: "1px solid #ddd" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1 }}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;