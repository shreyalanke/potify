import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
    title: String,
    url: String,
});


export default mongoose.model("Song", SongSchema);