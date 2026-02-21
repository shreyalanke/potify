import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../API/auth";
import { getSongs } from "../API/song.js";
import { logout } from "../API/auth.js";

function HomePage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let res = await getUser();
      if (res && res.success) {
        setUsername(res.user.name);
        setLoading(false);
      } else {
        navigate("/login");
      }
    })();
  }, []);

  // FULL PAGE LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 animate-pulse">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="h-7 w-32 bg-gray-700 rounded"></div>
            <div className="h-5 w-24 bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    const res = await logout();
    if (res && res.success) {
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      
      {/* Navbar */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Potify 🎧</h1>

          <button
            onClick={() => navigate("/profile")}
            className="text-gray-300 hover:text-white transition font-medium"
          >
            @{username}
          </button>
        </div>

        <button className="bg-red-500 px-4 py-2 rounded-lg" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Main Section → Create Room Button */}
      <div className="flex items-center justify-center mt-32">
        <button
          onClick={() => navigate("/room/new")}
          className="bg-green-500 hover:bg-green-600 transition px-8 py-4 text-xl font-semibold rounded-xl shadow-lg"
        >
          Create Room
        </button>
      </div>

    </div>
  );
}

export default HomePage;