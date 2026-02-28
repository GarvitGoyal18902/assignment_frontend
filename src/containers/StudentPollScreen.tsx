import { useEffect, useState } from 'react';

type LiveResult = {
    option: string;
    votes: number;
    color: string;
};

export default function StudentPollScreen() {
    const [timeLeft, setTimeLeft] = useState(600); // 10:00
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [liveResults] = useState<LiveResult[]>([
        { option: 'Mars', votes: 50, color: 'bg-purple-500' },
        { option: 'Venus', votes: 0, color: 'bg-gray-400' },
        { option: 'Jupiter', votes: 20, color: 'bg-purple-500' },
        { option: 'Saturn', votes: 10, color: 'bg-purple-500' }
    ]);

    const options = ['Mars', 'Venus', 'Jupiter', 'Saturn'];

    useEffect(() => {
        if (!submitted && timeLeft > 0) {
            const timer = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
            return () => window.clearTimeout(timer);
        }
    }, [timeLeft, submitted]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (option: string) => {
        if (!submitted) setSelectedAnswer(option);
    };

    const handleSubmit = () => {
        if (selectedAnswer && !submitted) {
            setSubmitted(true);
            window.setTimeout(() => setShowResults(true), 1500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-lg">
                <div className="flex justify-between items-center mb-8">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-bold shadow-lg">
                        Exit Poll
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-xl mb-4 border border-purple-200">
                        <span className="text-lg font-bold text-gray-800 mr-3">Question 1</span>
                        <span className="text-2xl font-bold text-purple-600 font-mono">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <div className="bg-gray-100 rounded-2xl p-6 border-l-8 border-purple-500 mb-6">
                        <p className="text-xl font-semibold text-gray-800">Which planet is known as Red Planet?</p>
                    </div>

                    {showResults ? (
                        <>
                            {liveResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center bg-white">
                                        <div className={`w-3 h-3 rounded-full ${result.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-900">{result.option}</span>
                                            <span className="font-bold text-gray-700">{result.votes}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                            <div
                                                className={`h-full rounded-full ${result.color}`}
                                                style={{ width: `${result.votes}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <p className="text-center text-gray-600 text-sm mt-6 py-4 bg-gray-50 rounded-2xl">
                                Wait for the teacher to ask new question.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {options.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all group border-2 ${
                                            selectedAnswer === option
                                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50'
                                        }`}
                                        onClick={() => handleAnswerSelect(option)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') handleAnswerSelect(option);
                                        }}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                selectedAnswer === option
                                                    ? 'bg-purple-500 border-purple-500 shadow-sm'
                                                    : 'border-gray-300 group-hover:border-gray-400'
                                            }`}
                                        >
                                            {selectedAnswer === option && (
                                                <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                            )}
                                        </div>
                                        <span className="flex-1 font-medium text-gray-900 py-1">{option}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={!selectedAnswer}
                                className={`w-full mt-8 py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all duration-200 flex items-center justify-center ${
                                    selectedAnswer
                                        ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-2xl hover:-translate-y-0.5'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Submit
                            </button>
                        </>
                    )}
                </div>

                <div className="absolute bottom-6 right-6 w-4 h-4 bg-purple-500 rounded-full animate-ping shadow-lg"></div>
            </div>
        </div>
    );
}
