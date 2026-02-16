import connectDB from "./config/db.js";
await connectDB();
import Song from "./models/Song.js";

let songs = [
    {
        title: "Perfect",
        url: "Perfect.mp3"
    },{
        title: "Dj Wale Babu",
        url: "DjWaleBabu.mp3"
    }
];  
async function seed() {
    await Song.deleteMany({});
    await Song.insertMany(songs);
    console.log("Database seeded!");
}

seed();