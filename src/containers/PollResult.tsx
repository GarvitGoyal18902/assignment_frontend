import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import axios from 'axios';
import type { PollPayload } from '../types/poll';
import { useNavigate } from 'react-router';

import StudentWidget from '../components/StudentWidget/StudentWidget';
import type { Student } from '../types/student';

import ChatWidget from "../components/ChatWidget/ChatWidget";
import { Message } from "../types/chat";
import { API_BASE_URL } from '../constants/constants';



let roomId:string="room"

type LocationState = {
    poll?: PollPayload;
};

type PollItem = {
    option: string;
    votes: number;
};

const initialStudents: Student[] = [
  { name: 'Alice', roomId: 'room1', status: 'active' },
  { name: 'Bob', roomId: 'room1', status: 'active' },
];

export default function PollResult() {
    const { id: pollId } = useParams<{ id: string }>();
    const location = useLocation();
    const state = (location.state as LocationState) || {};
    const initialPoll = state.poll;
    let navigate=useNavigate()

    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [messages, setMessages] = useState<Message[]>([]);
    const [poll, setPoll] = useState<PollPayload | null>(initialPoll ?? null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [votes, setVotes] = useState<number[]>([]);
    const socketRef = useRef<Socket | null>(null);
    let currentPerson='teacher'
    

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
        const fetchStudents = async () => {
            try {
                const res = await axios.post(`http://localhost:5001/api/students/${roomId}`);
                console.log('res',res.data.students)
                setStudents(res.data.students);
            } catch (err) {
                console.log(err);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        
        if (socketRef.current) return; 
        const socket = io('http://localhost:5001');
        socketRef.current = socket;

        socket.emit('connectToRoom', roomId);
        socket.emit('teacher:whatsGoingOn', roomId);
        
        socket.on('poll:noActive', () => {
            console.log('no poll active')
            socket.emit('teacher:join',{pollId});
            socket.emit('teacher:start',{pollId});
        });

        socket.on('poll:stateForTeacher', ({ poll: serverPoll, remaining: serverRemaining }) => {
            if (serverPoll) {
                // console.log("FULL POLL:", serverPoll);

                let optionsArray = [];

                if (Array.isArray(serverPoll.option)) {
                    optionsArray = serverPoll.option;
                } else if (Array.isArray(serverPoll.options)) {
                    optionsArray = serverPoll.options;
                }

                console.log("OPTIONS ARRAY:", optionsArray);

                setPoll(serverPoll);

                const votes = [];

                for (let i = 0; i < optionsArray.length; i++) {
                    const opt = optionsArray[i];

                    if (opt && typeof opt === 'object' && 'voteCount' in opt) {
                        votes.push(opt.voteCount);
                    } else {
                        votes.push(0);
                    }
                }

                setVotes(votes);
            }

            if (typeof serverRemaining === 'number') {
                setRemaining(serverRemaining);
            }
        });

        socket.on('poll:started', ({ poll: serverPoll }) => {
            if (serverPoll) {
                setPoll(serverPoll);
                setVotes(new Array(serverPoll.options.length).fill(0));
            }
        });

        socket.on('poll:tick', ({ remaining: r }) => {
            setRemaining(r);
        });

        socket.on('poll:voted', ({choosen}) => {
            console.log("increasing index ",choosen)
            setVotes((prev) => {
                const next = [...prev];
                if (typeof next[choosen] !== 'number') next[choosen] = 0;
                next[choosen] += 1;
                return next;
            });
        });

        socket.on('poll:ended', ({pollId, poll: serverPoll }) => {
            if (serverPoll) setPoll(serverPoll);
            setRemaining(0);
        });

        socket.on('poll:error', (payload) => {
            console.error('Poll socket error', payload);
        });

        socket.on('chat:updateChat', ({roomId,sender,text,createdAt}) => {
                setMessages((prev) => [...prev, { sender, message: text, createdAt: createdAt }]);
                // console.log('update')
        });

        socket.on('student:updateStudents', ({ studentName, roomId, status }) => {
         setStudents((prev) => {
            const exists = prev.some(s => s.name === studentName && s.roomId === roomId);

            if (exists) {
                return prev.filter(s => !(s.name === studentName && s.roomId === roomId));
            } else {
                addStudent(studentName, roomId, status);
                return prev; 
        }
    });
});
   

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    let handleAskNewQuestion = () => {
            socketRef.current?.emit('teacher:askNewQuestion', { pollId });
            setTimeout(() => {
            navigate('/question-manager');
        }, 100); 
    }

    const pollData: PollItem[] = useMemo(() => {
        if (!poll) {
            return [
                { option: 'Mars', votes: 75 },
                { option: 'Venus', votes: 5 },
                { option: 'Jupiter', votes: 5 },
                { option: 'Saturn', votes: 15 }
            ];
        }

        if (!votes.length) {
            return poll.options.map((opt) => ({ option: opt.text, votes: 0 }));
        }

        return poll.options.map((opt, index) => ({
            option: opt.text,
            votes: votes[index] ?? 0
        }));
    },[]);

    function handleViewAllPolls(): void {
       console.log("all polls................")
        navigate('/poll/all')
    }

    const handleSendMessage = (text: string) => {
        if (!socketRef.current) return;
        const sender ='teacher';
        const createdAt = new Date().toISOString();
        const message = {
            roomId,
            sender,
            text,
            createdAt
        };
        socketRef.current.emit('chat:newMessage', message);
        setMessages((prev) => [...prev, { sender, message: text, createdAt }]);
    };
    
    const toggleStudent = (studentName: string, roomId: string) => {
    setStudents((prev) =>
        prev.map((s) =>
            s.name === studentName && s.roomId === roomId
                ? {
                      ...s,
                      status: s.status === "active" ? "kicked" : "active",
                  }
                : s
        )
    );
};
    const handleKick = (roomId: string, studentName: string) => {
        socketRef.current?.emit('student:kicked',{studentName,roomId});
        toggleStudent(studentName, roomId);
    };

    const addStudent = (name: string, roomId: string, status: string) => {
        const safeStatus: "active" | "kicked" =
            status === "kicked" ? "kicked" : "active";

        setStudents((prev) => {
            const exists = prev.some(
                (s) => s.name === name && s.roomId === roomId
            );
            if (exists) return prev;

            return [...prev, { name, roomId, status: safeStatus }];
        });
    };

    const handleAllow = (roomId: string, studentName: string) => {
        console.log('allowing student ', studentName,roomId);
        socketRef.current?.emit('teacher:allowStudent', { studentName,roomId });

        toggleStudent(studentName, roomId);

    }



    return (
        <div className="min-h-screen bg-white px-6 md:px-16 py-10 md:py-16 font-sans flex justify-center">
            <div className="w-full max-w-3xl">
                <div className="flex justify-end mb-10">
                    <button onClick={handleViewAllPolls} className="inline-flex items-center px-6 py-2.5 rounded-full bg-purple-500 text-white text-xs md:text-sm font-semibold shadow-md hover:bg-purple-600 transition-colors">
                        <span className="mr-2 text-base">◉</span>
                        View Poll history
                    </button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Question</h2>
                    {typeof remaining === 'number' && (
                        <span className="text-xs md:text-sm font-mono font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            {remaining}s
                        </span>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-4 text-sm md:text-base font-semibold rounded-t-3xl">
                        {poll?.question ?? 'Which planet is known as the Red Planet?'}
                    </div>

                    <div className="bg-white px-4 py-4 space-y-3 md:space-y-4">
                        {pollData.map((item, index) => {
                            const isActive = index === 0 || index === 3;
                            const total = votes.reduce((sum, v) => sum + v, 0);
                            const percentage = total === 0 ? 0 : ((votes[index] ?? 0) / total) * 100;

                            return (
                                <div
                                key={item.option}
                                className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3">
                                    <div className="w-8 md:w-9 h-7 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs md:text-sm font-semibold shadow-sm">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs md:text-sm font-medium text-gray-900">{item.option}</span>
                                            <span className="text-xs md:text-sm font-semibold text-gray-800">{item.votes} votes</span>
                                        </div>
                                        <div className="w-full h-3 md:h-3.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full ${isActive ? 'bg-purple-500' : 'bg-purple-200'}`}
                                                style={{ width: `${percentage}%` }}
                                                />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-right items-end mt-10">
                    <button  onClick={handleAskNewQuestion} className="px-10 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm md:text-base font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-lg transition-transform hover:-translate-y-0.5">
                        + Ask a new question
                    </button>
                </div>
            </div>
            <StudentWidget students={students} onKick={handleKick} onAllow={handleAllow } />
            <ChatWidget
            messages={messages}
            currentUser={currentPerson}
            onSendMessage={handleSendMessage}
            />            
            
        </div>
        
    );
    }
    

