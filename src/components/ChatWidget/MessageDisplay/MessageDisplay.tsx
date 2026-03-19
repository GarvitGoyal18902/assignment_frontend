import React from 'react';
import { Message } from '../../../types/chat';

type Props = Message & {
  currentUser: string;
};

const MessageDisplay = ({ message, sender, createdAt, currentUser }: Props) => {
  const isMe = sender === currentUser;

  const timeLabel =
    typeof createdAt === 'string'
      ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-row ${isMe ? 'message-row-right' : 'message-row-left'}`}>
      <div className={`message-bubble ${isMe ? 'message-bubble-me' : 'message-bubble-other'}`}>
        <div className="message-sender">{isMe ? 'You' : sender}</div>
        <div className="message-text">{message}</div>
        <div className="message-time">{timeLabel}</div>
      </div>
    </div>
  );
};

export default MessageDisplay;