type Role = 'student' | 'teacher';

type RoleSelectorProps = {
    role: Role;
    onClick: (role: Role) => void;
    isSelected: boolean;
    title: string;
    description: string;
};

export default function RoleSelector({ role, onClick, isSelected, title, description }: RoleSelectorProps) {
    return (
        <button
            type="button"
            onClick={() => onClick(role)}
            aria-pressed={isSelected}
            className={`w-[320px] text-left p-8 rounded-2xl border transition-all duration-200 bg-white shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isSelected
                    ? 'border-purple-500 shadow-xl ring-4 ring-purple-100'
                    : 'border-gray-200 hover:border-purple-300'
            }`}
        >
            <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </button>
    );
}
