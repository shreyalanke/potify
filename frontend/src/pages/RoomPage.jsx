import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { getUser } from "../API/auth";
import { useNavigate } from "react-router-dom";
import { getRoom } from "../API/room";

export default function RoomPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const { roomId } = useParams();
  let navigate = useNavigate();

  const members = [
    { id: 1, name: "Aarav" },
    { id: 2, name: "Maya" },
    { id: 3, name: "Rohan" },
    { id: 4, name: "Sneha" },
  ];

  useEffect(() => {
    (async ()=>{
      let res = await getUser();

      if(res && res.success){
        res.user = { id: res.user._id };
        setUser(res.user);
        if(roomId == "new"){
            // Create new room logic here
            let result = await getRoom();

            if(result && result.success){
              navigate(`/room/${result.roomId}`);
            }
        }else{
           let result = await getRoom(roomId);
            if(result && result.success){
              let ws = new WebSocket(`ws://localhost:5000?roomId=${roomId}&userId=${res.user.id}`);
              ws.onmessage = (event) => {
                let parsedMessage;
                try {
                  parsedMessage = JSON.parse(event.data);
                  if(parsedMessage.type === "progress_update"){
                    setProgress(parsedMessage.progress);
                  }
                } catch (error) {
                  console.error("Invalid message format:", event.data);
                  return;
                }
              }
              setSocket(ws);
            }else{
              navigate("/home");
            }
        }
      } else {
       navigate("/login");
      }
    })();
    return () => {
      if (socket){
        socket.close();
      }
    }
  }, [roomId]);

  function handleProgressChange(e) {
    const value = parseInt(e.target.value);
    setProgress(value);
    socket.send(JSON.stringify({ type: "progress_update", progress: value }));
  }

  // Loading UI
  if (loading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-zinc-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - Search Section */}
        <div className="w-1/4 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Search Music</h2>
          <div className="flex items-center gap-2 bg-zinc-800 rounded-2xl px-3 py-2 shadow-inner">
            <Search size={18} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search songs or artists..."
              className="outline-none w-full bg-transparent text-sm placeholder-zinc-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <p className="text-sm text-zinc-500">Results will appear here</p>
          </div>
        </div>

        {/* Center - Room Details */}
        <div className="flex-1 p-6 overflow-y-auto bg-zinc-950">
          <div className="bg-zinc-900 rounded-2xl shadow-lg shadow-black/30 p-6 border border-zinc-800">
            <h1 className="text-2xl font-bold">Room Id {roomId}</h1>
            <p className="text-zinc-400 mt-2">Room description and activity info.</p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded-2xl">
                <p className="text-sm text-zinc-400">Now Playing</p>
                <p className="font-semibold mt-1">Song Name</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-2xl">
                <p className="text-sm text-zinc-400">Genre</p>
                <p className="font-semibold mt-1">Pop</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-2xl">
                <p className="text-sm text-zinc-400">Members</p>
                <p className="font-semibold mt-1">4 Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Members */}
        <div className="w-1/4 bg-zinc-900 border-l border-zinc-800 p-4">
          <h2 className="text-xl font-semibold mb-4">Members in Room</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-2xl bg-zinc-800 flex items-center justify-between hover:bg-zinc-700 transition"
              >
                <span>{member.name}</span>
                <span className="text-xs text-green-500">Online</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom - Music Player */}
      <div className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between px-6">
        <div>
          <p className="font-semibold">Song Name</p>
          <p className="text-sm text-zinc-400">Artist Name</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition">
            Prev
          </button>
          <button className="px-6 py-2 bg-white text-black rounded-2xl font-medium hover:scale-105 transition">
            Play
          </button>
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition">
            Next
          </button>
        </div>

        <div className="w-1/3">
          <input type="range" min="0" max="100" className="w-full accent-white" value={progress} onChange={handleProgressChange} />
        </div>
      </div>
    </div>
  );
}