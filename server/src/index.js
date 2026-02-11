import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { resolve } from "path";
import healthRouter from "./routes/health.js";
import branchesRouter from "./routes/branches.js";
import statsRouter from "./routes/stats.js";
import servicesRouter from "./routes/services.js";
import employeesRouter from "./routes/employees.js";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", branchesRouter);
app.use("/api", statsRouter);
app.use("/api", servicesRouter);
app.use("/api", employeesRouter);

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
