// backend/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

// auth
import authRoutes from "./routes/auth.js";
// dashboard
import dashboardRoutes from "./routes/dashboard.js";
// production
import productionOrderRoutes from "./routes/production/production-order.js";
import productionDetailsRoutes from "./routes/production/production-details.js";

// party
import partyTypesRoutes from "./routes/party/party-types.js";

// settings
import generalRoutes from "./routes/settings/general.js";
import siloRoutes from "./routes/settings/silo.js";
import godownRoutes from "./routes/settings/godown.js";

// hr
import designationRoutes from "./routes/hr/designation.js";
import employeeRoutes from "./routes/hr/employees.js";
import attendanceRoutes from "./routes/hr/attendance.js";
import monthlyAttendanceRoutes from "./routes/hr/monthly-attendance.js";
import salaryRoutes from "./routes/hr/salary.js";

// global index (handles remaining routes)
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  if (req.method === "DELETE" && req.url.includes("/hr/employee")) {
    console.log("DELETE /hr/employee - Body:", JSON.stringify(req.body));
  }
  // console.log("Headers:", req.headers);
  next();
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    optionsSuccessStatus: 200,
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// Core Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Core Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Production Routes
app.use("/api/production/production-order", productionOrderRoutes);
app.use("/api/production/production-details", productionDetailsRoutes);

// Settings Routes
app.use("/api/general", generalRoutes);
app.use("/api/silos", siloRoutes);
app.use("/api/godowns", godownRoutes);

// HR Routes
app.use("/api/designations", designationRoutes);
app.use("/api/hr/employee", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/monthly-attendance", monthlyAttendanceRoutes);
app.use("/api/salary", salaryRoutes);

// Party Routes
app.use("/api/party/types", partyTypesRoutes);

// Global Router (handles all other feature routes)
app.use("/api", routes);

// Error handler should be after all routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
