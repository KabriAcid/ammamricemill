export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Database connection error
  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(503).json({
      success: false,
      error: "database_auth_error",
      message:
        "Unable to connect to database. Please check database credentials.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  if (err.code === "ECONNREFUSED" || err.code === "ER_CON_COUNT_ERROR") {
    return res.status(503).json({
      success: false,
      error: "database_error",
      message:
        "Database connection failed. Please check if MySQL server is running.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Authentication errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "auth_error",
      message: "Authentication failed. Please login again.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Query errors
  if (err.code === "ER_BAD_FIELD_ERROR" || err.code === "ER_NO_SUCH_TABLE") {
    return res.status(500).json({
      success: false,
      error: "query_error",
      message: "Database query failed. Please check your database schema.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: "server_error",
    message: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
