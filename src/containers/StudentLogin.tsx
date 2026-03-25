import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/constants';
import { useEffect, useRef, useState } from 'react';

export default function StudentLogin() {
    let navigate = useNavigate();

    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(`${API_BASE_URL}`);
        socketRef.current = socket;

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const handleLogin = async () => {
        if (!studentName || !email || !roomId || !password) return;

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/students/login`,
                { studentName, emailID: email, roomId, password }
            );

            localStorage.setItem('studentName', studentName);
            localStorage.setItem('email', email);
            localStorage.setItem('roomId', roomId);
            localStorage.setItem('token', res.data.token);

            socketRef.current?.emit('connectToRoom', roomId);
            navigate('/waiting');

        } catch (err: any) {
            const status = err.response?.status;

            if (status === 403) {
                navigate('/kicked');
                return;
            } else if (status === 401) {
                setError('Invalid credentials ');
            }else if (status === 402) {
                setError('Signup first ');
            } else if (status === 400) {
                setError(err.response?.data?.message || 'Bad request');
            } else if (status === 500) {
                setError('Server error, try again later');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!studentName || !email || !roomId || !password) return;

        setLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/students/signup`,
                { name: studentName, emailID: email, roomId, password }
            );

            localStorage.setItem('studentName', studentName);
            localStorage.setItem('email', email);
            localStorage.setItem('roomId', roomId);
            localStorage.setItem('token', res.data.token);

            socketRef.current?.emit('connectToRoom', roomId);
            navigate('/waiting');

        } catch (err: any) {
            const status = err.response?.status;

            if (status === 403) {
                navigate('/kicked');
                return;
            } else if (status === 400) {
                setError(err.response?.data?.message || 'Signup failed');
            } else if (status === 500) {
                setError('Server error, try again later');
            } else {
                setError('Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-8 font-sans">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/50 transform transition-all duration-500">

                <h1 className="text-2xl font-bold mb-6 text-center">Join Poll</h1>

                <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Name"
                    className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-300"
                />

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-300"
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-300"
                />

                <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Room ID"
                    className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-300"
                />

                {error && (
                    <div className="mb-4 text-red-500 text-sm animate-pulse">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-1/2 py-3 rounded-xl bg-blue-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>

                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-1/2 py-3 rounded-xl bg-purple-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Signup'}
                    </button>
                </div>
            </div>
        </div>
    );
}