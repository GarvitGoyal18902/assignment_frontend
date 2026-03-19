import { useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '../../components/Button';
import RoleSelector from './RoleSelector/RoleSelector';

type Role = 'student' | 'teacher';

export default function Login() {
    localStorage.setItem('roomId','room');
    let navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role);
    };

    const handleContinue = ()=> {
        // routing based on selectedRole
        switch (selectedRole) {
            case 'teacher':
                navigate('/question-manager');
                return;
            case 'student':
                navigate('/student');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-24 px-6">
            {/* Badge */}
            <div className="mb-10">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold tracking-wide text-purple-600 shadow-sm">
                    ✦ Intervue Poll
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
                    description="Lorem Ipsum is simply dummy text of the printing and typesetting industry."
                />

                <RoleSelector
                    role="teacher"
                    onClick={handleRoleSelect}
                    isSelected={selectedRole === 'teacher'}
                    title="I'm a Teacher"
                    description="Submit answers and view live poll results in real-time."
                />
            </div>

            {/* Continue Button */}
            <Button text="Continue" onClick={handleContinue} disabled={!selectedRole} />
        </div>
    );
}
