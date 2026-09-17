import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Onefeed backend running on port ${env.port}`);
});
