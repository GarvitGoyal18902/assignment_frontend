import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../constants/constants';

interface Option {
  text: string;
  voteCount: number;
  isCorrect?: boolean;
}

interface Poll {
  _id: string;
  question: string;
  options: Option[];
  status: string;
  roomId: string;
  startTime?: string;
  endTime?: string;
}

interface ApiResponse {
  polls: Poll[];
}

export default function AllPolls() {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const roomId = localStorage.getItem('roomId');
  console.log("romId",roomId)

  useEffect(() => {
    async function fetchPolls() {
      try {
        const token=localStorage.getItem('token')
        const response = await axios.get(
          `${API_BASE_URL}/api/polls/all/${roomId}`,{headers:{authorization:`Bearer ${token}`}}
        );

        setAllPolls(response.data.polls || []);
        console.log('Fetched polls:', response.data.polls);
      } catch (err) {
        console.error('Error fetching polls:', err);
      }
    }

    fetchPolls();
  }, [roomId]);

  return (
    <div className="space-y-6 p-6">
      {allPolls.length === 0 ? (
        <div className="text-gray-600">No completed polls found for this room.</div>
      ) : (
        allPolls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);

          return (
            <div key={poll._id} className="bg-white shadow-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-800">{poll.question}</h3>
                {poll.endTime && (
                  <span className="text-sm text-gray-500">
                    {new Date(poll.endTime).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {poll.options.map((opt, idx) => {
                  const pct = totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0;

                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>{opt.text}</span>
                        <span>
                          {opt.voteCount} vote{opt.voteCount !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2 bg-gray-100 rounded mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="text-xs text-gray-500 mt-1">Total votes: {totalVotes}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}