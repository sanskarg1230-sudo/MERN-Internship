const express = require("express");
const cors = require("cors");
const errorHandler = require("./errorhandler");
const connectDB = require("./db");
const userRoute = require("./routes/userRoute");

const app = express();
const PORT = 3000;

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use((req, res, next) => {
  console.log("Request received:", req.method, req.url);
  next();
});

app.set("json spaces", 2);

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 Day 3 MongoDB Server Running Successfully!");
});

// User Routes
app.use("/users", userRoute);

// Catch-all route for undefined paths (404)
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl || req.url}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
