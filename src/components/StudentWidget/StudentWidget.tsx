import { useState } from 'react';
import type { Student } from '../../types/student';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { FiX } from 'react-icons/fi';

type Props = {
  students: Student[];
  onKick: (roomId: string, name: string) => void;
};

const StudentWidget = ({ students, onKick }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating modern icon button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed marginBottom-6 right-7 w-15 h-15 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all"
          title="View Students"
        >
          <HiOutlineUserGroup size={28} />
        </button>
      )}

      {/* Widget panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white shadow-2xl rounded-lg flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center font-bold">
            <div className="flex items-center gap-2">
              <HiOutlineUserGroup size={20} />
              Students
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white">
              ✖
            </button>
          </div>

          {/* Scrollable student list */}
          <div className="flex-1 overflow-y-auto max-h-96 p-2 flex flex-col gap-2">
            {students.map((student) => (
              <div
                key={`${student.roomId}-${student.name}`}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-100"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{student.name}</span>
                  <span className="text-sm flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        student.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    />
                    {student.status}
                  </span>
                </div>

                {student.status === 'active' && (
                  <button
                    onClick={() => onKick(student.roomId, student.name)}
                    className="bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-red-600"
                  >
                    <FiX size={16} /> Kick
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentWidget;