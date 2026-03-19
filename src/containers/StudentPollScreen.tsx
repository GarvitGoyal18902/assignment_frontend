import { useEffect, useState, useRef } from 'react';
import { io, Socket } from "socket.io-client";
import { useNavigate } from 'react-router';


type LiveResult = {
  option: string;
  votes: number; // percentage
  color: string;
};

export default function StudentPollScreen() {
  const socketRef = useRef<Socket | null>(null);
  const currentPollIdRef = useRef<string>('');

  const [timeLeft, setTimeLeft] = useState(600);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [options, setOptions] = useState<any[]>([]);
  const [liveResults, setLiveResults] = useState<LiveResult[]>([]);

  const [question, setQuestion] = useState('');
  const [pollId, setPollId] = useState<string>('');

  const roomId = 'room';
    let navigate = useNavigate()
    const studentName=localStorage.getItem('studentName')

  useEffect(() => {     
    const socket = io("http://localhost:5001");
      socketRef.current = socket;
      socket.emit('connectToRoom', roomId);
    socket.emit('student:whatsgoingon', {studentName,roomId});
    socket.on('poll:state', ({role, poll, remaining ,attempted,choosen}: any) => {
      if (!poll) return;

      if (!attempted) {
        currentPollIdRef.current = poll._id;
            setSubmitted(false);
            setShowResults(false);
            setSelectedAnswer(null);
        }
        else {
          setSubmitted(true);
          setShowResults(true);
          setSelectedAnswer(choosen); 
        }
      setPollId(poll._id);
      setQuestion(poll.question || '');
      setOptions(poll.options || []);
      const totalVotes = (poll.options || []).reduce(
        (sum: number, opt: any) => sum + (opt.voteCount ?? 0),
        0
      );
      setLiveResults(
        (poll.options || []).map((opt: any) => {
          const count = opt.voteCount ?? 0;
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          return {
            option: opt.text,
            votes: percent,
            color: count > 0 ? 'bg-purple-500' : 'bg-gray-400'
          } as LiveResult;
        })
      );
      setTimeLeft(remaining ?? 0);
      if (poll.isCompleted) {
        setShowResults(true);
      }
    });
      
      
    socket.on('poll:tick', ({ pollId, remaining }: { pollId: string; remaining: number }) => {
        console.log('Poll:', pollId);
        setTimeLeft(remaining ?? 0);
    });

    socket.on('poll:error', (err: any) => {
      console.error('poll:error', err);
    });

    socket.on('connect', () => {
      socket.emit('student:whatsgoingon', {studentName,roomId});
    });
      
     socket.on('poll:voted', ({choosen}) => {
        console.log("increasing ",choosen)
  setOptions((prevOptions) => {
    if (!prevOptions || choosen == null) return prevOptions;

    // 1. Update vote count locally
    const updatedOptions = prevOptions.map((opt, idx) => {
      if (idx === choosen) {
        return {
          ...opt,
          voteCount: (opt.voteCount ?? 0) + 1
        };
      }
      return opt;
    });

    // 2. Recalculate percentages
    const totalVotes = updatedOptions.reduce(
      (sum, opt) => sum + (opt.voteCount ?? 0),
      0
    );

    const updatedResults = updatedOptions.map((opt) => {
      const count = opt.voteCount ?? 0;
      const percent =
        totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

      return {
        option: opt.text,
        votes: percent,
        color: count > 0 ? 'bg-purple-500' : 'bg-gray-400'
      };
    });

    // 3. Update UI
    setLiveResults(updatedResults);

    return updatedOptions;
  });
});

      socket.on('poll:ended', (pollId, poll) => {
        navigate('/waiting')
      });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSelect = (optionText: string) => {
    if (!submitted) setSelectedAnswer(optionText);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || submitted || !pollId) return;

    setSubmitted(true);
    setShowResults(true);

    const selectedOptionIndex = options.findIndex((opt) => opt.text === selectedAnswer);

    socketRef.current?.emit('student:vote', {
      pollId,
      studentId: "s1",
      studentName: localStorage.getItem('studentName'),
      selectedOptionIndex
    });

    // Only the voter requests the latest poll state once to get immediate updated counts
    socketRef.current?.emit('student:whatsgoingon', {studentName,roomId});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-8">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping" />
                  <button className="px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-bold">{ studentName}</button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow mb-4">
            <span className="text-lg font-bold mr-4">{question || 'Question'}</span>
            <span className="text-2xl font-bold text-purple-600">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow p-8 mb-8">
          {showResults ? (
            <>
              {liveResults.map((result, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>{result.option}</span>
                    <span>{result.votes}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded">
                    <div className={`${result.color} h-3 rounded`} style={{ width: `${result.votes}%` }} />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {options.length > 0 ? (
                options.map((opt, index) => (
                  <div
                    key={index}
                    className={`p-4 mb-3 border rounded cursor-pointer ${
                      selectedAnswer === opt.text ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleAnswerSelect(opt.text)}
                  >
                    {opt.text}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">Waiting for poll...</div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className={`w-full mt-6 py-3 rounded font-bold ${
                  selectedAnswer ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}