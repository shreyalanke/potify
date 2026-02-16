import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../API/auth";
import { getSongs } from "../API/song.js";


function HomePage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState([]);



    useEffect(() => {
        (async() => {
            let res =await  getUser();
           if(res && res.success) {
            setUsername(res.user.name);
            setLoading(false);
            const songsRes = await getSongs();
            if(songsRes && songsRes.success){
              setSongs(songsRes.songs);
            }
           
           } else {
            navigate("/login");
           }
        })();
    }, []);

  // FULL PAGE LOADING UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 animate-pulse">

        {/* Navbar skeleton */}
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

  // REAL PAGE AFTER LOADING
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

        <button className="bg-red-500 px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
      <div className="text-center text-3xl font-bold mt-20">
        Welcome to Potify, {username}!
      </div>    
         <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Your Songs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <div key={song._id} className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{song.title}</h3>
              <audio controls className="w-full">
                <source src={"http://localhost:5000/"+song.url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ))}
        </div>
      </div>


    
     

    </div>
  );
}

export default HomePage;
