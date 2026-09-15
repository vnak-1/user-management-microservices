// config/DBConnect.js  -->  Task 2
const mongoose = require("mongoose");

const DBConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      `[${process.env.SERVICE_NAME}] MongoDB connected -> db: ${mongoose.connection.name}`
    );
  } catch (error) {
    console.error(
      `[${process.env.SERVICE_NAME}] MongoDB connection FAILED:`,
      error.message
    );
    process.exit(1);
  }
};

module.exports = DBConnect;
