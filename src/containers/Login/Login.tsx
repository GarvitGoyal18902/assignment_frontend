import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../../components/Button';
import RoleSelector from './RoleSelector/RoleSelector';

type Role = 'student' | 'teacher';

export default function Login() {
    let navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
    };

    const handleContinue = ()=> {
        switch (selectedRole) {
            case 'teacher':
                navigate('/teacher');
                return;
            case 'student':
                navigate('/student');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 px-6 space-y-20">
            {/* Badge */}
                
         <div className="flex items-center justify-center gap-4">
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

            {/* Title & Description */}
            <div className="text-center mb-12">
                <h1 className="text-4xl text-gray-900 mb-4">
                    Welcome to the <span className="font-extrabold">Live Polling System</span>
                </h1>
                <p className="text-gray-500 text-base max-w-xl mx-auto">
                    Please select the role that best describes you to begin using the live polling system.
                </p>
            </div>

            {/* Role Cards */}
            <div className="flex flex-wrap justify-center gap-8 mb-16">
                <RoleSelector
                    role="student"
                    onClick={handleRoleSelect}
                    isSelected={selectedRole === 'student'}
                    title="I'm a Student"
                    description="Join live sessions, submit responses, and participate in real-time polls."
                />

                <RoleSelector
                    role="teacher"
                    onClick={handleRoleSelect}
                    isSelected={selectedRole === 'teacher'}
                    title="I'm a Teacher"
                    description="Create sessions, conduct polls, and monitor responses in real time."
                />
            </div>

            {/* Continue Button */}
            <Button text="Continue" onClick={handleContinue} disabled={!selectedRole} />
        </div>
    );
}
