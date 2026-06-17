const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb");
    console.log("Connected to MongoDB for seeding...");

    const email = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin account already exists in MongoDB:", email);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: "Admin Manager",
      email: email,
      password: "admin123",
      role: "admin", // Explicitly seed as lowercase admin
    });

    if (adminUser) {
      console.log("Admin account successfully created!");
      console.log("Email: admin@gmail.com");
      console.log("Password: admin123");
      console.log("Role: admin");
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding admin error:", error);
    process.exit(1);
  }
};

seedAdmin();
