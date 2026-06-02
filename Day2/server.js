const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*"
}));

app.use((req, res, next) => {
  console.log("Request received:", req.method, req.url);
  next();
});
const PORT = 3000;

app.set("json spaces", 2);

app.get("/", (req, res) => {
  res.send("🚀 Day 2 Express Server Running Successfully!");
});

app.get("/users", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "users.json");

    const data = await fs.readFile(filePath, "utf8");

    const users = JSON.parse(data);

    const filteredUsers = users.filter(
      (user) => user.age >= 18 && user.isActive
    );

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Eligible users retrieved successfully",
      summary: {
        totalUsers: users.length,
        validUsers: filteredUsers.length,
      },
      data: filteredUsers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reading users file",
      error: error.message,
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});