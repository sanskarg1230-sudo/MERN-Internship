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

mongoose
  .connect("mongodb://127.0.0.1:27017/MERNdb")
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Day 4 Server Running");
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
  next(new Error("Day 4 Test Error"));
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );
});