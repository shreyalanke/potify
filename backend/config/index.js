import dotenv from "dotenv";
dotenv.config();

let envConfig = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/potify",
    PORT: process.env.PORT || 5000,
    SECRET: process.env.SECRET || "defaultsecretkey"
};

export default envConfig;