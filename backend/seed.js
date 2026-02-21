import connectDB from "./config/db.js";
await connectDB();
import Song from "./models/Song.js";

let songs = [
    {
        title: "Perfect",
        url: "Perfect.mp3"
    },{
        title: "Aao Naa",
        url: "Aao Naa.mp3"
    },{
        title: "Dj Wale Babu",
        url: "Dj Wale Babu.mp3"
    },
    {
        title: "Samjhawan",
        url: "Samjhawan.mp3"
    },
     {
        title: "O Rangrez",
        url: "O Rangrez.mp3"
    }
];  
async function seed() {
    await Song.deleteMany({});
    await Song.insertMany(songs);
    console.log("Database seeded!");
}

seed();