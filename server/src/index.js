import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
import healthRouter from "./routes/health.js";

// Load .env from project root
dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", healthRouter);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
