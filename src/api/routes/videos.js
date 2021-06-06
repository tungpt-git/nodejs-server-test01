import express from "express";
import {
  getVideo,
  searchVideoMultipleConditions,
  searchVideosByQuery,
} from "../controllers/videos.js";

const router = express.Router();

router.post("/search", searchVideosByQuery);
router.post("/complex-search", searchVideoMultipleConditions);
router.get("/:id", getVideo);

export default router;
