import { Router } from "express";
import { handleImage } from "../controllers/image.controller.js";

const router = Router();

router.post("/", handleImage);

export default router;
