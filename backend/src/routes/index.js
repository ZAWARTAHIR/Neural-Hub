import { Router } from "express";

import chatRoutes from "./chat.routes.js";
import blogRoutes from "./blog.routes.js";
import imageRoutes from "./image.routes.js";
import videoRoutes from "./video.routes.js";
import whatsappRoutes from "./whatsapp.routes.js";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/blog", blogRoutes);
router.use("/image", imageRoutes);
router.use("/video", videoRoutes);
router.use("/whatsapp", whatsappRoutes);

export default router;
