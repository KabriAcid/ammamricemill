import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";

// auth
import authRoutes from "./routes/auth.js";
// dashboard
import dashboardRoutes from "./routes/dashboard.js";
/*
import backupRoutes from "./routes/backup.js";

// settings
import generalRoutes from "./routes/settings/general.js";
import siloRoutes from "./routes/settings/silo.js";
import godownRoutes from "./routes/settings/godown.js";

// hr
import designationRoutes from "./routes/hr/designation.js";
import employeeRoutes from "./routes/hr/employee.js";
import attendanceRoutes from "./routes/hr/attendance.js";
import monthlyAttendanceRoutes from "./routes/hr/monthly-attendance.js";
import salaryRoutes from "./routes/hr/salary.js";

// accounts
import headIncomeRoutes from "./routes/accounts/head-income.js";
import headExpenseRoutes from "./routes/accounts/head-expense.js";
import headBankRoutes from "./routes/accounts/head-bank.js";
import headOthersRoutes from "./routes/accounts/head-others.js";
import transactionsRoutes from "./routes/accounts/transactions.js";

// party
import partyTypesRoutes from "./routes/party/party-types.js";
import partiesRoutes from "./routes/party/parties.js";
import paymentsRoutes from "./routes/party/payments.js";
import dueRoutes from "./routes/party/due.js";
import debtsRoutes from "./routes/party/debts.js";

// products
import categoryRoutes from "./routes/products/category.js";
import productsRoutes from "./routes/products/products.js";

// emptybags
import emptyPurchaseRoutes from "./routes/emptybags/purchase.js";
import emptySalesRoutes from "./routes/emptybags/sales.js";
import emptyReceiveRoutes from "./routes/emptybags/receive.js";
import emptyPaymentRoutes from "./routes/emptybags/payment.js";
import emptyStocksRoutes from "./routes/emptybags/stocks.js";

// purchase
import paddyPurchaseRoutes from "./routes/purchase/paddy-purchase.js";
import paddyLedgerRoutes from "./routes/purchase/paddy-ledger.js";
import ricePurchaseRoutes from "./routes/purchase/rice-purchase.js";
import riceLedgerRoutes from "./routes/purchase/rice-ledger.js";

// sales
import salesListRoutes from "./routes/sales/sales-list.js";
import salesLedgerRoutes from "./routes/sales/sales-ledger.js";

// production
import productionOrderRoutes from "./routes/production/production-order.js";
import productionDetailsRoutes from "./routes/production/production-details.js";

// stocks
import mainStocksRoutes from "./routes/stocks/main-stocks.js";
import godownStocksRoutes from "./routes/stocks/godown-stocks.js";
import stockRegisterRoutes from "./routes/stocks/stock-register.js";
import addStocksRoutes from "./routes/stocks/add-stocks.js";
import productionStocksListRoutes from "./routes/stocks/production-stocks-list.js";
import productionStocksDetailsRoutes from "./routes/stocks/production-stocks-details.js";
import emptybagStocksRoutes from "./routes/stocks/emptybag-stocks.js";

// reporting
import dailyReportRoutes from "./routes/reporting/daily-report.js";
import financialStatementRoutes from "./routes/reporting/financial-statement.js";

// sms
import smsTemplatesRoutes from "./routes/sms/templates.js";
import smsSendRoutes from "./routes/sms/send.js";

*/

// global index
import routes from "./routes/index.js";

dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
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

// Routes
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handler should be after all routes
app.use(errorHandler);
/*
app.use("/api/backup", backupRoutes);

// settings
app.use("/api/general", generalRoutes);
app.use("/api/silos", siloRoutes);
app.use("/api/godowns", godownRoutes);

// hr
app.use("/api/designations", designationRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/monthly-attendance", monthlyAttendanceRoutes);
app.use("/api/salary", salaryRoutes);

/*
// accounts
app.use("/api/head-income", headIncomeRoutes);
app.use("/api/head-expense", headExpenseRoutes);
app.use("/api/head-bank", headBankRoutes);
app.use("/api/head-others", headOthersRoutes);
app.use("/api/transactions", transactionsRoutes);

// party
app.use("/api/party-types", partyTypesRoutes);
app.use("/api/parties", partiesRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/due", dueRoutes);
app.use("/api/debts", debtsRoutes);

// products
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productsRoutes);

// emptybags
app.use("/api/emptybags/purchase", emptyPurchaseRoutes);
app.use("/api/emptybags/sales", emptySalesRoutes);
app.use("/api/emptybags/receive", emptyReceiveRoutes);
app.use("/api/emptybags/payment", emptyPaymentRoutes);
app.use("/api/emptybags/stocks", emptyStocksRoutes);

// purchase
app.use("/api/paddy-purchase", paddyPurchaseRoutes);
app.use("/api/paddy-ledger", paddyLedgerRoutes);
app.use("/api/rice-purchase", ricePurchaseRoutes);
app.use("/api/rice-ledger", riceLedgerRoutes);

// sales
app.use("/api/sales-list", salesListRoutes);
app.use("/api/sales-ledger", salesLedgerRoutes);

// production
app.use("/api/production-order", productionOrderRoutes);
app.use("/api/production-details", productionDetailsRoutes);

// stocks
app.use("/api/stocks/main", mainStocksRoutes);
app.use("/api/stocks/godown", godownStocksRoutes);
app.use("/api/stocks/register", stockRegisterRoutes);
app.use("/api/stocks/add", addStocksRoutes);
app.use("/api/stocks/production-list", productionStocksListRoutes);
app.use("/api/stocks/production-details", productionStocksDetailsRoutes);
app.use("/api/stocks/emptybag", emptybagStocksRoutes);

// reporting
app.use("/api/daily-report", dailyReportRoutes);
app.use("/api/financial-statement", financialStatementRoutes);

// sms
app.use("/api/sms/templates", smsTemplatesRoutes);
app.use("/api/sms/send", smsSendRoutes);

*/

// global index
app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
