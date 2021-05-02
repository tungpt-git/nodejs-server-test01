import express from "express";
import { getVideo, searchVideosByQuery } from "../controllers/videos.js";

const router = express.Router();

router.post("/search", searchVideosByQuery);
router.get("/:id", getVideo);

export default router;
