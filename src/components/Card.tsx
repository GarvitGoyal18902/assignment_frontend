type CardProps = {
    heading: string;
    text: string;
};

export default function Card({ heading, text }: CardProps) {
    return (
        <div className="relative group inline-block">
            <div className="absolute inset-0 border-10 border-black border-dashed rounded-lg"></div>

            <div
                className="relative bg-white border-4 border-black rounded-lg
                      p-6 transition
                      group-hover:-translate-x-2 group-hover:-translate-y-2"
            >
                <p className="text-lg font-semibold">{heading}</p>
                <p className="text-sm mt-2">{text}</p>
            </div>
        </div>
    );
}
