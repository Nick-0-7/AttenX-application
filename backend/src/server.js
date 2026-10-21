require("dotenv").config();
const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error.middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const departmentRoutes = require("./routes/department.routes");
const teacherRoutes = require("./routes/teacher.routes");
const subjectRoutes = require("./routes/subject.routes");
const coRoutes = require("./routes/co.routes");
const poRoutes = require("./routes/po.routes");
const psoRoutes = require("./routes/pso.routes");
const mappingRoutes = require("./routes/mapping.routes");
const studentMarkRoutes = require("./routes/studentMark.routes");
const cesRoutes = require("./routes/ces.routes");
const attainmentRoutes = require("./routes/attainment.routes");
const excelRoutes = require("./routes/excel.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition", "X-Calculation-Summary"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "CO-PO Attainment Workbench API",
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/course-outcomes", coRoutes);
app.use("/api/program-outcomes", poRoutes);
app.use("/api/program-specific-outcomes", psoRoutes);
app.use("/api/co-po-mappings", mappingRoutes);
app.use("/api/student-marks", studentMarkRoutes);
app.use("/api/ces", cesRoutes);
app.use("/api/attainment", attainmentRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` AttenX CO-PO Backend Server running on port ${PORT}`);
  console.log(` Base API URL: http://localhost:${PORT}/api`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = app;
