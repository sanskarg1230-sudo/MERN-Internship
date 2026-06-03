const express = require("express");
const User = require("../Users");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find();
    const filteredUsers = users.filter(
      (user) => user.age >= 18 && user.isActive,
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
  next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json(user);

  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {

    const { name, age } = req.body;

    if (!name || !age) {
      const error = new Error("Name and Age are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create(req.body);

    res.status(201).json(user);

  } catch (err) {
    next(err);
  }
}); 

module.exports = router;
