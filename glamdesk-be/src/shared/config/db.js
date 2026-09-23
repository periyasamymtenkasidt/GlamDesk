const mongoose = require("mongoose");
const dns = require("dns");

// Set reliable public DNS servers for resolving MongoDB Atlas SRV records on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (dnsErr) {
  // Use default system DNS if custom servers cannot be set
}

const connectDB = async () => {
  try {
    let mongoUri = (process.env.MONGO_URI || "").trim().replace(/^=+/, "").trim();
    if (!mongoUri) {
      mongoUri = "mongodb://127.0.0.1:27017/glamdesk";
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[GlamDesk-DB] Connected successfully to MongoDB: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[GlamDesk-DB] MongoDB Connection Error: ${error.message}`);
    console.warn(`[GlamDesk-DB] Please verify your network connection and MongoDB Atlas IP access list.`);
  }
};

module.exports = connectDB;
