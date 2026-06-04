const express = require("express");
const cors = require("cors");
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

app.get("/users", async (req, res) => {
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server running at http://localhost:${PORT}`
  );
});