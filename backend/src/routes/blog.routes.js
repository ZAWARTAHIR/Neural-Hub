import { Router } from "express";
import { handleBlog } from "../controllers/blog.controller.js";

const router = Router();

router.post("/", handleBlog);

export default router;
