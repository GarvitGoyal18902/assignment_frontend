import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants/constants';


export default function TeacherLogin() {
    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateRoomId = () => {
            return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
        };
        setRoomId(generateRoomId());
    }, []);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleContinue = async() => {
        localStorage.setItem('roomId', roomId);
         const res = await axios.post(
                `${API_BASE_URL}/api/teacher/login`,
                { roomId }
        );
        localStorage.setItem('token', res.data.token);
        navigate('/question-manager');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-6 font-sans">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-8">

                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Create Poll Room
                </h1>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Generate and share your room ID with students
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                        Room ID
                    </label>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={roomId}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-semibold tracking-widest focus:ring-2 focus:ring-purple-300 outline-none transition"
                        />

                        <button
                            onClick={handleCopy}
                            className={`p-3 rounded-xl transition-all flex items-center justify-center
                            ${copied 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleContinue}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}