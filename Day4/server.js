const express = require("express");
const User = require("../Users");

const router = express.Router();

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: "Users retrieved successfully",
      summary: {
        totalUsers: users.length,
        activeUsers: users.filter((user) => user.isActive).length,
        inactiveUsers: users.filter((user) => !user.isActive).length,
      },
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    err.statusCode = 400;
    next(err);
  }
});

// Create user
router.post("/", async (req, res, next) => {
  try {
    const { name, age } = req.body;

    if (!name || !age) {
      const error = new Error("Name and Age are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;