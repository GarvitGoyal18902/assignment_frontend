import { useNavigate } from "react-router";

const KickWindow = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[300px] text-center animate-scaleIn">
        
        <div className="text-5xl mb-3">⚠️</div>

        <h2 className="text-xl font-semibold mb-2">Alert</h2>

        <p className="text-gray-600 mb-6">
          You have been kicked out
        </p>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default KickWindow;