const path = require("path");
const express = require("express");
const cors = require("cors");
const errorHandler = require("./errorhandler");
const mongoose = require("mongoose");
const User = require("./Users");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.static(path.join(__dirname, "../dist")));

mongoose
  .connect("mongodb://127.0.0.1:27017/MERNdb")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Day 5 Server Running");
});

app.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();

    const totalUsers = users.length;
    const activeUsers = users.filter(
      (user) => user.isActive
    ).length;
    const inactiveUsers = users.filter(
      (user) => !user.isActive
    ).length;

    res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        activeUsers,
        inactiveUsers,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
});
app.get("/test-error", (req, res, next) => {
  next(new Error("Day 5 Test Error"));
});
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );
});