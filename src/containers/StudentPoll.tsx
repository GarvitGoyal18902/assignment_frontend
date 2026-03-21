import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useEffect, useMemo, useRef, useState } from 'react';


export default function StudentPoll() {
    let navigate = useNavigate();
    const [studentName, setStudentName] = useState('');
    const socketRef = useRef<Socket | null>(null);
    let roomId = 'room'
    
    useEffect(() => {
        const socket = io('http://localhost:5001');
        socketRef.current = socket;
        
        socket.emit('connectToRoom', 'room');
        
        return() => {
            socket.disconnect();
            socketRef.current = null;
        }
    }, []);
    
    const handleContinue = () => {
        if (studentName.trim()) {
            localStorage.setItem('studentName', studentName);
            localStorage.setItem('roomId', 'room');
                console.log('Continue with student:', studentName);
                socketRef.current?.emit('student:come', { studentName, roomId });
                navigate(`/waiting`);
                
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-8 font-sans">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/50">
                <div className="flex items-center mb-8">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Let's Get Started
                    </h1>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-10 max-w-sm">
                    If your students participate in polls, enter how your responses compare with classmates live
                </p>

                <div className="mb-10">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                        Enter your name
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Enter name"
                            className="w-full px-6 py-5 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all shadow-sm hover:shadow-md"
                        />
                    </div>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!studentName.trim()}
                    className={`w-full py-5 px-8 rounded-2xl font-bold text-lg shadow-xl transform transition-all duration-200 ${
                        studentName.trim()
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-2xl hover:-translate-y-0.5 hover:scale-[1.02]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
