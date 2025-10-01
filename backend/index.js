import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dashboardRoutes from "./routes/dashboard.js";
import employeesRouter from "./routes/employees.js";
import siloRoutes from "./routes/silos.js";
import Settings from "./routes/settings.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeesRouter);
app.use("/api/silos", siloRoutes);
app.use("/api/general", Settings);

app.use("/api", routes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
