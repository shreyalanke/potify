import { useEffect, useState } from "react";

function SongQueue({ socket, user, availableSongs, onRemoveFromQueue, isHostOrAdmin }) {
  const [queue, setQueue] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdated = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "queue_updated") {
        setQueue(message.queue || []);
      }
    };

    const handleQueueEmpty = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "queue_empty") {
        setQueue([]);
      }
    };

    socket.addEventListener("message", handleQueueUpdated);
    socket.addEventListener("message", handleQueueEmpty);

    return () => {
      socket.removeEventListener("message", handleQueueUpdated);
      socket.removeEventListener("message", handleQueueEmpty);
    };
  }, [socket]);

  async function handleAddSong(e) {
    e.preventDefault();

    if (!selectedSongId) {
      return;
    }

    const selectedSong = availableSongs.find((s) => s._id === selectedSongId);
    if (!selectedSong) {
      return;
    }

    setLoading(true);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "add_to_queue",
          songId: selectedSongId,
        })
      );
    }

    setSelectedSongId("");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      {/* Add Song Form */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm">
        <h3 className="font-semibold text-gray-200 mb-2 text-sm">Add to Queue</h3>
        <form onSubmit={handleAddSong} className="flex flex-col gap-2">
          <select
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
            disabled={loading || availableSongs.length === 0}
            className="w-full bg-gray-950 border border-gray-700 text-white px-2.5 py-2 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-xs placeholder-gray-600 transition disabled:opacity-50"
          >
            <option value="">
              {availableSongs.length === 0 ? "No songs available" : "Select a song..."}
            </option>
            {availableSongs.map((song) => (
              <option key={song._id} value={song._id}>
                {song.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !selectedSongId || availableSongs.length === 0}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-2 rounded-lg transition text-sm"
          >
            + Add
          </button>
        </form>
      </div>

      {/* Queue List */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
        <h3 className="font-semibold text-gray-200 flex justify-between items-center mb-3 text-sm">
          <span>Queue</span>
          <span className="bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded-full">
            {queue.length}
          </span>
        </h3>

        {queue.length === 0 ? (
          <p className="text-gray-500 text-xs">Queue empty</p>
        ) : (
          <div className="overflow-y-auto flex-1 pr-1">
            <ul className="flex flex-col gap-2">
              {queue.map((song, idx) => (
                <li key={idx} className="bg-gray-950 p-2.5 rounded-lg border border-gray-800 text-xs flex items-start justify-between gap-2">
                  <div className="flex-1 truncate">
                    <p className="font-medium text-gray-200 truncate">
                      {song.title}
                    </p>
                    <p className="text-gray-600 truncate text-xs">
                      {song.artist}
                    </p>
                    <p className="text-gray-700 text-xs mt-1">
                      by {song.addedBy}
                    </p>
                  </div>
                  {isHostOrAdmin && isHostOrAdmin() && onRemoveFromQueue && (
                    <button
                      onClick={() => onRemoveFromQueue(song.id)}
                      className="text-xs bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded transition flex-shrink-0 mt-1"
                      title="Remove from Queue"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default SongQueue;
