const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");
dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb");
    console.log("Connected to MongoDB...");

    // Update Customer -> customer
    const updateCustomers = await User.updateMany(
      { role: "Customer" },
      { $set: { role: "customer" } }
    );
    console.log(`Updated Customer roles: ${updateCustomers.modifiedCount} modified.`);

    // Update Admin -> admin
    const updateAdmins = await User.updateMany(
      { role: "Admin" },
      { $set: { role: "admin" } }
    );
    console.log(`Updated Admin roles: ${updateAdmins.modifiedCount} modified.`);

    // Check all users
    const users = await User.find({});
    console.log("Current database users:", JSON.stringify(users, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error updating user roles:", error);
    process.exit(1);
  }
};

run();
