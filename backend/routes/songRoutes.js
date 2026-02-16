import express from "express";
import { getSongs } from "../controllers/songController.js";
import { authMiddleware } from "../tokeniser.js";

const router = express.Router();

router.get("/", authMiddleware, getSongs);

export default router;