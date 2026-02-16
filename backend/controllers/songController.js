import Song from "../models/Song.js";


async function getSongs(req,res) 
{
    try {
        const songs = await Song.find();
        res.status(200).json({ songs, success :true });
    } catch (error) {
        res.status(500).json({ message: "Error fetching songs", error, success :false });
    }
    
}
export { getSongs };