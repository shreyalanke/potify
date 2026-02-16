import dotenv from "dotenv";
dotenv.config();

let envConfig = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    SECRET: process.env.SECRET
};

export default envConfig;