import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUser, logout } from "../API/auth";
import { getSongs } from "../API/song.js";
import { getRoom } from "../API/room.js";

function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);

  const roomId = searchParams.get("room");

  // UI State for the music player (Mocking currently playing song)
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userRes = await getUser();
        if (userRes && userRes.success) {
          userRes.user = { id: userRes.user._id, ...userRes.user };
          setUser(userRes.user);

          if (roomId) {
            let result = await getRoom(roomId);
            if (result && result.success) {
              setRoom(result.room);
              let ws = new WebSocket(
                `ws://localhost:5000?roomId=${roomId}&userId=${userRes.user.id}`
              );
              ws.onopen = async () => {
                let result = await getRoom(roomId);
                if(result && result.success){
                  setRoom(result.room);
                }
              };
            } else {
              setSearchParams({});
            }
          }
        } else {
          navigate("/login");
          return;
        }

        const songRes = await getSongs();
        if (songRes && songRes.success) {
          setSongs(songRes.songs || []);
          // Set the first song as default in the player if available
          if (songRes.songs && songRes.songs.length > 0) {
            setCurrentSong(songRes.songs[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, roomId]);

  async function handleLogout() {
    const res = await logout();
    if (res && res.success) {
      navigate("/login");
    }
  }

  // FULL PAGE LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col animate-pulse">
        <div className="h-16 border-b border-gray-800 flex justify-between items-center px-6">
          <div className="h-6 w-32 bg-gray-800 rounded"></div>
          <div className="h-8 w-24 bg-gray-800 rounded-lg"></div>
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 bg-gray-900 border-r border-gray-800"></div>
          <div className="w-80 bg-gray-950"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white font-sans overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-16 flex justify-between items-center px-6 border-b border-gray-800 bg-gray-950 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
            Potify 🎧
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/profile")}
            className="text-gray-300 hover:text-white transition font-medium flex items-center gap-2"
          >
            @{user?.name}
          </button>
          <button
            className="text-sm font-semibold text-gray-400 hover:text-red-400 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SECTION: Music Library & Player */}
        <div className="flex-1 flex flex-col relative bg-gray-900">
          {/* Music Dictionary / Library (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 pb-32">
            <h2 className="text-xl font-bold mb-6 text-gray-100">
              Music Library
            </h2>

            {songs.length === 0 ? (
              <p className="text-gray-500">No songs available right now.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {songs.map((song, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentSong(song);
                      setIsPlaying(true);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 cursor-pointer transition group ${
                      currentSong?.id === song.id ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-xl">
                        🎵
                      </div>
                      <div>
                        <h3
                          className={`font-medium ${
                            currentSong?.id === song.id
                              ? "text-green-400"
                              : "text-gray-200"
                          }`}
                        >
                          {song.title || "Unknown Title"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {song.artist || "Unknown Artist"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 hidden group-hover:block text-green-400">
                      Play
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Music Player */}
          <div className="absolute bottom-0 w-full h-24 bg-gray-950 border-t border-gray-800 px-6 py-4 flex items-center justify-between shadow-2xl z-20">
            {currentSong ? (
              <>
                <div className="flex items-center gap-4 w-1/3">
                  <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center text-2xl shadow-md">
                    💿
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-100">
                      {currentSong.title || "No Title"}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {currentSong.artist || "Unknown Artist"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center w-1/3 gap-2">
                  <div className="flex items-center gap-6">
                    <button className="text-gray-400 hover:text-white transition">
                      ⏮
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition"
                    >
                      {isPlaying ? "⏸" : "▶"}
                    </button>
                    <button className="text-gray-400 hover:text-white transition">
                      ⏭
                    </button>
                  </div>
                  {/* Fake Progress Bar */}
                  <div className="w-full h-1 bg-gray-700 rounded-full flex items-center group cursor-pointer">
                    <div className="h-full bg-green-500 w-1/3 rounded-full group-hover:bg-green-400 relative">
                      <div className="w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"></div>
                    </div>
                  </div>
                </div>

                <div className="w-1/3 flex justify-end text-gray-400 text-xl">
                  {/* Volume Icon Placeholder */}
                  🔉
                </div>
              </>
            ) : (
              <div className="w-full text-center text-gray-500 text-sm">
                Select a song from the library to start listening.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Collaboration (Rooms) */}
        <div className="w-80 bg-gray-950 border-l border-gray-800 p-6 flex flex-col shadow-xl z-10">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-100 mb-2">
              Collaborate
            </h2>
            <p className="text-sm text-gray-500">
              Listen together with your friends in real-time.
            </p>
          </div>

          {room ? (
            <div className="flex flex-col gap-6 flex-1 h-full">
              {/* Active Room Info */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="font-semibold text-gray-200 mb-1">
                  Current Session
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Share this code with friends to let them join.
                </p>
                <div className="flex justify-between items-center bg-gray-950 px-3 py-2.5 rounded-lg border border-gray-700">
                  <span className="font-mono text-green-400 tracking-widest font-bold text-lg">
                    {room.id}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(room.id)}
                    className="text-gray-400 hover:text-white transition text-sm"
                    title="Copy Room Code"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
                <h3 className="font-semibold text-gray-200 flex justify-between items-center mb-4">
                  <span>Listeners</span>
                  <span className="bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                    {room.members?.length || 0}
                  </span>
                </h3>

                <div className="overflow-y-auto flex-1 pr-1">
                  <ul className="flex flex-col gap-3">
                    {room.members?.map((member) => (
                      <li key={member._id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-sm font-bold text-white uppercase shadow-sm">
                          {member.name ? member.name[0] : "?"}
                        </div>
                        <div className="flex-1 truncate flex flex-col justify-center">
                          <p className="text-sm font-medium text-gray-200 truncate flex items-center gap-2">
                            {member.name}
                            {member._id === user?.id && (
                              <span className="text-[10px] text-gray-500">
                                (You)
                              </span>
                            )}
                          </p>
                          {member._id === room.hostId && (
                            <span className="text-[10px] text-green-400 uppercase tracking-wider font-semibold">
                              Host
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Leave Room Action */}
              <button
                onClick={() => {
                  setRoom(null);
                  setSearchParams({});
                }}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold py-2.5 rounded-lg transition shadow-sm mt-auto"
              >
                Leave Room
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Create Room */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="font-semibold text-gray-200 mb-2">
                  Start a Session
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Host a new room and share the code to let others join your
                  queue.
                </p>
                <button className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-2.5 rounded-lg transition shadow-md">
                  + Create Room
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <hr className="w-full border-gray-800" />
                <span className="absolute bg-gray-950 px-2 text-xs text-gray-600 font-semibold uppercase">
                  Or
                </span>
              </div>

              {/* Join Room */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="font-semibold text-gray-200 mb-2">
                  Join a Session
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Have an invite code? Enter it below to tune in.
                </p>
                <form className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-700 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm placeholder-gray-600 transition uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!roomCode.trim()}
                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
                  >
                    Join Room
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;