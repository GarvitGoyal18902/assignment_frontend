import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router';
import ChatWidget from "../components/ChatWidget/ChatWidget";
import { Message } from "../types/chat";
import { API_BASE_URL } from '../constants/constants';



export default function WaitingScreen() {

    const [messages, setMessages] = useState<Message[]>([]);
    const socketRef = useRef<Socket | null>(null);
    const navigate = useNavigate();
    const roomId = localStorage.getItem('roomId');
    let navigated = false;

    useEffect(() => {
      const fetchChats = async () => {
          try {
          const res = await axios.post(`${API_BASE_URL}/api/chats`, {
              roomId
          });

          setMessages(res.data.chats); 
          } catch (err) {
          console.error('Failed to fetch chats', err);
          }
      };

    fetchChats();
    }, []);

    useEffect(() => {
        const socket = io('http://localhost:5001');
        socketRef.current = socket;
        console.log("student socket connected...........")

        socket.emit('connectToRoom', roomId);
        
    socket.on('poll:tick', () => {
        console.log("navigating to StudentPoll............")
        if(!navigated){
            navigated = true;
            navigate('/student/poll');
        }
    });

    socket.on('chat:updateChat', ({roomId,sender,text,createdAt}) => {
        setMessages((prev) => [...prev, { sender, message: text, createdAt: createdAt }]);
    });

    return () => {
    console.log('student socket disconnected #####')
    socket.disconnect();
    socketRef.current = null;
    };
    }, []);
    
     const person = localStorage.getItem('studentName')
    console.log('name got from localstorage ',person)
      let currentPerson='teacher'
    if (person) {
          currentPerson = person;
    }
  
  
  const handleSendMessage = (text: string) => {
    if (!socketRef.current) return;

    const sender = localStorage.getItem('studentName') || 'Anonymous';
    const createdAt = new Date().toISOString();

    const message = {
        roomId,
        sender,
        text,
        createdAt
    };

    // Emit to backend
    socketRef.current.emit('chat:newMessage', message);

    // Update local messages
    setMessages((prev) => [...prev, { sender, message: text, createdAt }]);
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex flex-col items-center justify-center p-8 font-sans">
            <div className="text-center max-w-md">
                <div className="flex items-center justify-center mb-12">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-ping"></div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                </div>

                <div className="relative mb-12">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full shadow-2xl flex items-center justify-center mx-auto border-8 border-white/50 animate-pulse">
                        <div className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">C</div>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400/30 to-purple-600/30 rounded-full blur-xl animate-ping"></div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        Wait for the teacher
                        <br />
                        <span className="text-purple-600">to ask questions...</span>
                    </h1>

                    <div className="flex items-center justify-center space-x-2">
                        <div
                            className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0s' }}
                        />
                        <div
                            className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                        />
                        <div
                            className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                        />
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 w-4 h-4 bg-purple-500 rounded-full animate-ping shadow-lg"></div>
            </div>
             <ChatWidget
            messages={messages}
            currentUser={currentPerson}
            onSendMessage={handleSendMessage}
            />
        </div>
    );
}
