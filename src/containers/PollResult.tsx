import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import axios from 'axios';
import type { PollPayload } from '../types/poll';

type LocationState = {
    poll?: PollPayload;
};

type PollItem = {
    option: string;
    votes: number;
};

export default function PollResult() {
    const { id: pollId } = useParams<{ id: string }>();
    const location = useLocation();
    const state = (location.state as LocationState) || {};
    const initialPoll = state.poll;

    const [poll, setPoll] = useState<PollPayload | null>(initialPoll ?? null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [votes, setVotes] = useState<number[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const loadPoll = async () => {
            if (poll || !pollId) return;
            try {
                const res = await axios.get(`/api/polls/${pollId}`);
                const data = res.data as PollPayload;
                setPoll(data);
                setVotes(new Array(data.options.length).fill(0));
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to load poll', error);
            }
        };

        loadPoll();
    }, [poll, pollId]);

    // Socket.io: join room, start poll, and handle real-time events.
    useEffect(() => {
        if (!pollId || !poll) return;

        const socket = io(); // uses Vite proxy to backend
        socketRef.current = socket;

        socket.emit('teacher:join', { pollId });
        socket.emit('teacher:start', { pollId });

        socket.on('poll:state', ({ poll: serverPoll, remaining: serverRemaining }) => {
            if (serverPoll) {
                setPoll(serverPoll);
                setVotes(new Array(serverPoll.options.length).fill(0));
            }
            if (typeof serverRemaining === 'number') setRemaining(serverRemaining);
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

        socket.on('poll:voted', ({ selectedOptionIndex }) => {
            setVotes((prev) => {
                const next = [...prev];
                if (typeof next[selectedOptionIndex] !== 'number') next[selectedOptionIndex] = 0;
                next[selectedOptionIndex] += 1;
                return next;
            });
        });

        socket.on('poll:ended', ({ poll: serverPoll }) => {
            if (serverPoll) setPoll(serverPoll);
            setRemaining(0);
        });

        socket.on('poll:error', (payload) => {
            // eslint-disable-next-line no-console
            console.error('Poll socket error', payload);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [pollId, poll]);

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

        const total = votes.reduce((sum, v) => sum + v, 0) || 1;

        return poll.options.map((opt, index) => ({
            option: opt.text,
            votes: Math.round(((votes[index] ?? 0) / total) * 100)
        }));
    }, [poll, votes]);

    return (
        <div className="min-h-screen bg-white px-6 md:px-16 py-10 md:py-16 font-sans flex justify-center">
            <div className="w-full max-w-3xl">
                {/* Top-right history button */}
                <div className="flex justify-end mb-10">
                    <button className="inline-flex items-center px-6 py-2.5 rounded-full bg-purple-500 text-white text-xs md:text-sm font-semibold shadow-md hover:bg-purple-600 transition-colors">
                        <span className="mr-2 text-base">◉</span>
                        View Poll history
                    </button>
                </div>

                {/* Question title + timer */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Question</h2>
                    {typeof remaining === 'number' && (
                        <span className="text-xs md:text-sm font-mono font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            {remaining}s
                        </span>
                    )}
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
                    {/* Question header */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-4 text-sm md:text-base font-semibold rounded-t-3xl">
                        {poll?.question ?? 'Which planet is known as the Red Planet?'}
                    </div>

                    {/* Options */}
                    <div className="bg-white px-4 py-4 space-y-3 md:space-y-4">
                        {pollData.map((item, index) => {
                            const isActive = index === 0 || index === 3;

                            return (
                                <div
                                    key={item.option}
                                    className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3">
                                    {/* Index pill */}
                                    <div className="w-8 md:w-9 h-7 flex items-center justify-center rounded-full bg-purple-500 text-white text-xs md:text-sm font-semibold shadow-sm">
                                        {index + 1}
                                    </div>

                                    {/* Option text + bar */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs md:text-sm font-medium text-gray-900">
                                                {item.option}
                                            </span>
                                            <span className="text-xs md:text-sm font-semibold text-gray-800">
                                                {item.votes}%
                                            </span>
                                        </div>
                                        <div className="w-full h-3 md:h-3.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full ${isActive ? 'bg-purple-500' : 'bg-purple-200'}`}
                                                style={{ width: `${item.votes}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom action row */}
                <div className="flex justify-right items-end mt-10">
                    <button className="px-10 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm md:text-base font-semibold shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-lg transition-transform hover:-translate-y-0.5">
                        + Ask a new question
                    </button>
                </div>
            </div>
        </div>
    );
}
