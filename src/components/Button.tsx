import type { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
    text: ReactNode;
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
};

export default function Button({ text, onClick, disabled = false }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-16 py-4 rounded-full font-semibold text-base shadow-lg transition-all duration-300 ${
                !disabled
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
            {text}
        </button>
    );
}
