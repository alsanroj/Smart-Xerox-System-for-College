import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Smart Xerox</h1>

        <p className="text-gray-600 mb-6">
          Upload files, avoid rush, and collect your printouts easily.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/upload")}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            📤 Upload File for Xerox
          </button>

          <button
            onClick={() => navigate("/history")}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            📜 View My Orders
          </button>

          <button
            onClick={() => navigate("/admin-login")}
            className="w-full text-sm text-gray-500 underline mt-2"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
