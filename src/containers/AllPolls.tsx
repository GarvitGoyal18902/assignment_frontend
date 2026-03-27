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

export default function AllPolls() {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [pollImages, setPollImages] = useState<Record<string, string[]>>({});
  const roomId = localStorage.getItem('roomId');

  useEffect(() => {
    async function fetchPolls() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/polls/all/${roomId}`,
          { headers: { authorization: `Bearer ${token}` } }
        );

        setAllPolls(response.data.polls || []);
      } catch (err) {
        console.error('Error fetching polls:', err);
      }
    }

    fetchPolls();
  }, [roomId]);

  useEffect(() => {
    const fetchAllImages = async () => {
      if (!allPolls.length) return;

      try {
        const token = localStorage.getItem('token');

        const results = await Promise.all(
          allPolls.map(async (poll) => {
            try {
              const res = await axios.get(
                `${API_BASE_URL}/api/attachments/${poll._id}`,
                { headers: { authorization: `Bearer ${token}` } }
              );

              return { pollId: poll._id, images: res.data.images || [] };
            } catch (err) {
              console.error(`Failed to fetch images for poll ${poll._id}`, err);
              return { pollId: poll._id, images: [] };
            }
          })
        );

        const nextImages: Record<string, string[]> = {};
        results.forEach(({ pollId, images }) => {
          nextImages[pollId] = images;
        });

        setPollImages(nextImages);
      } catch (err) {
        console.error('Error fetching poll images:', err);
      }
    };

    fetchAllImages();
  }, [allPolls]);

  return (
    <div className="space-y-6 p-6 bg-white">
      {allPolls.length === 0 ? (
        <div className="text-gray-600">No completed polls found for this room.</div>
      ) : (
        allPolls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
          const images = pollImages[poll._id] || [];

          return (
            <div
              key={poll._id}
              className="border border-purple-200 bg-purple-50 rounded-2xl shadow-sm p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {poll.question}
                </h3>

                {poll.endTime && (
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(poll.endTime).toLocaleString()}
                  </span>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="bg-purple-100 rounded-xl p-2 border border-purple-200 flex justify-center items-center"
                    >
                      <img
                        src={url}
                        alt={`Poll image ${index + 1}`}
                        className="w-full max-h-40 object-contain rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {poll.options.map((opt, idx) => {
                  const pct =
                    totalVotes > 0
                      ? Math.round((opt.voteCount / totalVotes) * 100)
                      : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>{opt.text}</span>
                        <span>
                          {opt.voteCount} vote{opt.voteCount !== 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full h-2 bg-purple-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="text-xs text-gray-500 mt-1">
                  Total votes: {totalVotes}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}