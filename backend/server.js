import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import envConfig from "./config/index.js";
import songRoutes from "./routes/songRoutes.js";

const PORT = envConfig.PORT || 5000;
const app = express();

const corsOptions = {
    origin: 'http://localhost:5173', // Explicitly allow your frontend origin
    credentials: true, // Enable the Access-Control-Allow-Credentials header
    // Include all necessary methods your frontend uses (GET, POST, OPTIONS, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    // Include all necessary headers your frontend uses (Content-Type, Authorization, etc.)
    allowedHeaders: ['Content-Type', 'Authorization'], 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  res.cookie('name', 'express');
  console.log("Cookie"  , req.cookies);
  console.log("Request Body:", req.body);
  let originalSend = res.send;

  let send = function (body) {
    console.log("Response Body:", body);
    originalSend.call(this, body);
  };

  res.send = send;

  next();
});

connectDB();

app.use("/auth", authRoutes);
app.use("/songs", songRoutes);

app.use(express.static("music"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
