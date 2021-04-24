import express from "express";
import { searchVideosByQuery } from "../controllers/videos.js";

const router = express.Router();

router.post("/search", searchVideosByQuery);

export default router;
