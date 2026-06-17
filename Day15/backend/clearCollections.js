const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/inventorydb");
    console.log("Connected to MongoDB for cleaning...");

    const collections = mongoose.connection.collections;
    
    if (collections["carts"]) {
      await collections["carts"].deleteMany({});
      console.log("Cleared Carts");
    }
    if (collections["wishlists"]) {
      await collections["wishlists"].deleteMany({});
      console.log("Cleared Wishlists");
    }
    if (collections["orders"]) {
      await collections["orders"].deleteMany({});
      console.log("Cleared Orders");
    }
    if (collections["users"]) {
      await collections["users"].deleteMany({});
      console.log("Cleared Users");
    }

    console.log("Database clean completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Clean error:", error);
    process.exit(1);
  }
};

clearDB();
