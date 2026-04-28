import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/constants';
import { useEffect, useRef, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export default function StudentLogin() {
    let navigate = useNavigate();

    const [studentName, setStudentName] = useState('');
    const [email, setEmail] = useState('');
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('defaultPassword');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleGoogleSuccess = async (tokenResponse: any) => {
        try {
            const res = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                }
            );
            setStudentName(res.data.name || '');
            setEmail(res.data.email || '');

        } catch (err) {
            setError('Failed to fetch Google user info');
        }
    };


    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google login failed')
    });


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

            navigate('/waiting');

        } catch (err: any) {
            if (!err.response) {
                setError('Server is starting, please wait a few seconds and try again');
                return;
            }

            const status = err.response?.status;

            if (status === 403) {
                navigate('/kicked');
                return;
            } else if (status === 401) {
                setError('Invalid credentials ');
            } else if (status === 402) {
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

    return (
            <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-indigo-300 flex items-center justify-center p-8 font-sans">            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/50 transform transition-all duration-500 ">
                 <div className="flex items-center justify-center gap-4 mb-8 -translate-x-3">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="6" cy="7" r="1.5" fill="white"/>
                    <circle cx="6" cy="12" r="1.5" fill="white"/>
                    <circle cx="6" cy="17" r="1.5" fill="white"/>
                    <line x1="10" y1="7" x2="20" y2="7" stroke="white"/>
                    <line x1="10" y1="12" x2="20" y2="12" stroke="white"/>
                    <line x1="10" y1="17" x2="20" y2="17" stroke="white"/>
                </svg>
                </div>
                

            <span className="text-2xl font-semibold text-gray-900">
                Snap<span className="text-purple-600 font-bold">Poll</span>
            </span>
            </div>      
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

                {/* <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full mb-4 px-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-300"
                /> */}

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

                <div className="flex flex-col items-center justify-center mt-3 mb-6">
                    <button
                        onClick={() => login()}
                        className="flex items-center gap-3 px-6 py-3 
                                bg-gradient-to-r from-purple-500 to-purple-700 
                                text-white font-medium rounded-xl 
                                shadow-lg hover:shadow-xl 
                                hover:from-purple-600 hover:to-purple-800 
                                transition-all duration-200"
                    >
                        <img 
                            src="https://www.svgrepo.com/show/475656/google-color.svg" 
                            alt="google" 
                            className="w-5 h-5 bg-white rounded-full p-0.5"
                        />
                        Autofill with Google
                    </button>
                </div>

                
                <div className="flex gap-3">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-1/2 py-3 rounded-xl 
                                bg-gradient-to-r from-purple-400 via-purple-600 to-purple-900 
                                text-white font-semibold 
                                shadow-md hover:shadow-lg
                                transition-all duration-300 
                                hover:from-purple-500 hover:via-purple-700 hover:to-purple-950
                                hover:scale-105 active:scale-95 
                                disabled:opacity-50"                >
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                   

                    <button
                        onClick={handleSignup}
                        disabled={loading}
                        className="w-1/2 py-3 rounded-xl 
                                bg-gradient-to-l from-purple-400 via-purple-600 to-purple-900 
                                text-white font-semibold 
                                shadow-md hover:shadow-lg
                                transition-all duration-300 
                                hover:from-purple-500 hover:via-purple-700 hover:to-purple-950
                                hover:scale-105 active:scale-95 
                                disabled:opacity-50"                       >
                        {loading ? 'Loading...' : 'Signup'}
                    </button>
                </div>
            </div>
        </div>
    );
}