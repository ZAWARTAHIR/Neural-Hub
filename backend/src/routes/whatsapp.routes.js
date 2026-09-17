import { Router } from "express";
import { handleWhatsapp } from "../controllers/whatsapp.controller.js";

const router = Router();

router.post("/", handleWhatsapp);

export default router;
