const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb");
    const users = await User.find({});
    console.log("Seeded/Registered Users in MongoDB:");
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error reading users:", error);
    process.exit(1);
  }
};
run();
