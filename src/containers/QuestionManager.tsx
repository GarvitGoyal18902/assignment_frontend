import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PollPayload } from '../types/poll';
import { API_BASE_URL } from '../constants/constants';

type YesNo = 'yes' | 'no' | null;

export default function QuestionManager() {
    let navigate = useNavigate();
    const [timeLimit, setTimeLimit] = useState('60');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<string[]>(['', '']);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [yesNoStates, setYesNoStates] = useState<Record<number, YesNo>>({ 0: null, 1: null });
    const [submitting, setSubmitting] = useState(false);
    const [generatingOptions, setGeneratingOptions] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const addOption = () => {
        const newIndex = options.length;
        setOptions([...options, '']);
        setYesNoStates((prev) => ({ ...prev, [newIndex]: null }));
        setSelectedOption(null);
    };

    const updateOption = (index: number, value: string) => {
        const limited = value.slice(0, 200);
        const newOptions = [...options];
        newOptions[index] = limited;
        setOptions(newOptions);
    };

    const toggleCorrect = (index: number) => {
        setSelectedOption(selectedOption === index ? null : index);
    };

    const toggleYesNo = (index: number, value: Exclude<YesNo, null>) => {
        setYesNoStates((prev) => ({
            ...prev,
            [index]: prev[index] === value ? null : value
        }));
    };

    const isOptionValid = (text: string) => {
        const len = text.trim().length;
        if (len === 0) return false;
        if (len < 3) return false;
        if (len > 200) return false;
        return true;
    };

    const hasMinNonEmptyOptions = options.filter((opt) => isOptionValid(opt)).length >= 2;
    const hasAtLeastOneCorrect = options.some((_, index) => yesNoStates[index] === 'yes');
    const canAskQuestion = question.trim().length > 0 && hasMinNonEmptyOptions && hasAtLeastOneCorrect && !submitting;
    const roomId = localStorage.getItem('roomId');

    const handleGenerateOptions = async () => {
        if (!question.trim()) return;

        try {
            setGeneratingOptions(true);

            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_BASE_URL}/api/ai/generate-options`,
                { question: question.trim() },
                {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                }
            );

            const generatedOptions: string[] = response.data.options || [];
            const normalized = generatedOptions.map((opt) => opt.trim()).filter(Boolean);

            if (normalized.length < 2) {
                throw new Error('Not enough options generated');
            }

            setOptions(normalized);
            const nextStates: Record<number, YesNo> = {};
            normalized.forEach((_, index) => {
                nextStates[index] = null;
            });
            setYesNoStates(nextStates);
            setSelectedOption(null);
        } catch (error) {
            console.error('Failed to generate options', error);
        } finally {
            setGeneratingOptions(false);
        }
    };

    const handleAskQuestion = async () => {
        if (!canAskQuestion) return;

        try {
            const token = localStorage.getItem('token');
            setSubmitting(true);

            const formData = new FormData();

            formData.append('question', question.trim());
            formData.append('timeLimit', timeLimit);
            formData.append('roomId', roomId || '');

            const formattedOptions = options
                .map((opt, index) => ({
                    text: opt.trim(),
                    isCorrect: yesNoStates[index] === 'yes'
                }))
                .filter((opt) => opt.text.length > 0);

            formData.append('options', JSON.stringify(formattedOptions));

            files.forEach((file) => {
                formData.append('images', file);
            });

            const response = await axios.post(`${API_BASE_URL}/api/polls`, formData, {
                headers: {
                    authorization: `Bearer ${token}`
                }
            });

            const { pollId } = response.data;
            navigate(`/poll/${pollId}`);
        } catch (error) {
            console.error('Failed to create poll', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setFiles(Array.from(e.target.files));
    };

    return (
        <div className="min-h-screen bg-white px-8 py-10 md:px-20 md:py-14 font-sans flex justify-center">
            <div className="w-full max-w-5xl">
                <div className="mb-8">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold tracking-wide text-purple-600 shadow-sm">
                        ✦ snap Poll
                    </span>
                </div>

                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl text-gray-900 mb-3">
                        Let&apos;s <span className="font-extrabold">Get Started</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl">
                        you&apos;ll have the ability to create and manage polls, ask questions, and monitor your
                        students&apos; responses in real-time.
                    </p>
                </div>

                <div className="mb-10">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-gray-800">Enter your question</label>
                        <select
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs md:text-sm font-semibold text-gray-800 shadow-sm hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200">
                            <option value="60">60 seconds ▼</option>
                            <option value="30">30 seconds ▼</option>
                            <option value="90">90 seconds ▼</option>
                        </select>
                    </div>

                    <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-4 md:p-6 min-h-[180px] flex">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter your question here"
                            className="w-full h-full resize-none bg-transparent border-none outline-none text-base md:text-lg text-gray-900 placeholder-gray-400"
                        />
                        <span className="absolute bottom-4 right-6 text-xs text-gray-400">0/100</span>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleGenerateOptions}
                            disabled={!question.trim() || generatingOptions}
                            className={`px-6 py-3 rounded-full text-sm font-semibold shadow-md transition-transform ${
                                !question.trim() || generatingOptions
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-0.5'
                            }`}>
                            {generatingOptions ? 'Generating...' : 'Generate Options'}
                        </button>
                    </div>

                    <div className="mb-10 mt-6">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Attach Images (optional)
                        </label>

                        <div className="flex items-center justify-center w-full">
                            <label className="w-full flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-sm text-gray-600 font-medium">
                                        Click to upload images
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        PNG, JPG (multiple allowed)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {files.length > 0 && (
                            <div className="mt-4 text-xs text-gray-500">
                                {files.length} file(s) selected
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-gray-800">Edit Options</div>
                    <div className="text-sm font-semibold text-gray-800 mr-4">Is it Correct?</div>
                </div>

                <div className="space-y-4 mb-8">
                    {options.map((option, index) => {
                        const len = option.trim().length;
                        const invalid = (len > 0 && len < 3) || len > 200;

                        return (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-50 text-xs font-semibold text-purple-600 border border-purple-200">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        placeholder="Please enter a poll option"
                                        minLength={3}
                                        maxLength={200}
                                        className={`w-full px-4 py-3 border rounded-xl text-sm md:text-base text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 ${
                                            invalid
                                                ? 'border-red-500 focus:ring-red-200'
                                                : 'border-gray-200 focus:ring-purple-200 focus:border-purple-300'
                                        }`}
                                    />
                                    {invalid && (
                                        <p className="mt-1 text-xs text-red-500">
                                            Option must be between 3 and 200 characters.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 pr-2">
                                    <button
                                        type="button"
                                        onClick={() => toggleYesNo(index, 'yes')}
                                        className={`flex items-center gap-2 text-xs md:text-sm ${
                                            yesNoStates[index] === 'yes' ? 'text-purple-600' : 'text-gray-500'
                                        }`}>
                                        <span
                                            className={`w-4 h-4 rounded-full border ${
                                                yesNoStates[index] === 'yes'
                                                    ? 'border-purple-500 bg-purple-500'
                                                    : 'border-gray-300 bg-white'
                                            } flex items-center justify-center`}>
                                            {yesNoStates[index] === 'yes' && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </span>
                                        Yes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => toggleYesNo(index, 'no')}
                                        className={`flex items-center gap-2 text-xs md:text-sm ${
                                            yesNoStates[index] === 'no' ? 'text-purple-600' : 'text-gray-500'
                                        }`}>
                                        <span
                                            className={`w-4 h-4 rounded-full border ${
                                                yesNoStates[index] === 'no'
                                                    ? 'border-purple-500 bg-purple-500'
                                                    : 'border-gray-300 bg-white'
                                            } flex items-center justify-center`}>
                                            {yesNoStates[index] === 'no' && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
                                        </span>
                                        No
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={addOption}
                        className="inline-flex items-center px-4 py-2 border border-purple-300 text-xs md:text-sm font-semibold text-purple-600 rounded-full hover:bg-purple-50 hover:border-purple-400 transition-colors">
                        + Add More option
                    </button>

                    <button
                        type="button"
                        onClick={handleAskQuestion}
                        disabled={!canAskQuestion}
                        className={`px-8 md:px-10 py-3 md:py-3.5 font-semibold text-sm md:text-base rounded-full shadow-md transition-transform ${
                            canAskQuestion
                                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:from-purple-600 hover:to-purple-700 hover:-translate-y-0.5'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}>
                        Ask Question
                    </button>
                </div>
            </div>
        </div>
    );
}