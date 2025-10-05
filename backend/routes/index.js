// backend/routes/index.js
import express from "express";
import dashboardRoutes from "./dashboard.js";
import generalSettingsRoutes from "./settings/general.js";
import uploadRoutes from "./settings/upload.js";
import godownSettingsRoutes from "./settings/godown.js";
import siloSettingsRoutes from "./settings/silo.js";

// HR Routes
import employeeRoutes from "./hr/employees.js";
import designationRoutes from "./hr/designation.js";
import attendanceRoutes from "./hr/attendance.js";
import monthlyAttendanceRoutes from "./hr/monthly-attendance.js";
import salaryRoutes from "./hr/salary.js";

// Accounts Routes
import headIncomeRoutes from "./accounts/head-income.js";
import headExpenseRoutes from "./accounts/head-expense.js";
import headBankRoutes from "./accounts/head-bank.js";
import headOthersRoutes from "./accounts/head-others.js";
import transactionsRoutes from "./accounts/transactions.js";

// Party Routes
import partiesRoutes from "./party/parties.js";

// production
import categoryRoutes from "./products/category.js";
import ProductRoutes from "./products/products.js";

// Sales Routes
import salesListRoutes from "./sales/sales-list.js";

// Purchase Routes
import paddyPurchaseRoutes from "./purchase/paddy-purchase.js";

const router = express.Router();

// General routes
router.use("/dashboard", dashboardRoutes);

// Settings routes
router.use("/settings/general", generalSettingsRoutes);
router.use("/settings/upload", uploadRoutes);
router.use("/settings/godown", godownSettingsRoutes);
router.use("/settings/silo", siloSettingsRoutes);

// HR routes
router.use("/hr/employee", employeeRoutes);
router.use("/hr/designation", designationRoutes);
router.use("/hr/attendance", attendanceRoutes);
router.use("/hr/monthly-attendance", monthlyAttendanceRoutes);
router.use("/hr/salary", salaryRoutes);

// Accounts routes
router.use("/accounts/head-income", headIncomeRoutes);
router.use("/accounts/head-expense", headExpenseRoutes);
router.use("/accounts/head-bank", headBankRoutes);
router.use("/accounts/head-others", headOthersRoutes);
router.use("/accounts/transactions", transactionsRoutes);

// Party routes
router.use("/party/parties", partiesRoutes);

// Production
router.use("/categories", categoryRoutes);
router.use("/products", ProductRoutes);

// Sales routes
router.use("/sales", salesListRoutes);

// Purchase routes
router.use("/purchase/paddy", paddyPurchaseRoutes);

export default router;
