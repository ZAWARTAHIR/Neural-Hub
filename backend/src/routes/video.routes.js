import { Router } from "express";
import { handleVideo } from "../controllers/video.controller.js";

const router = Router();

router.post("/", handleVideo);

export default router;
