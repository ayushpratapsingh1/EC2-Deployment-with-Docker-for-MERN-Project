const mongoose = require("mongoose")
const secretsManager = require("../utils/secretsManager")

async function connectToDatabase() {
  try {
    const mongoDbUrl = await secretsManager.getMongoDBUrl()
    console.log(mongoDbUrl)
    if (!mongoDbUrl) {
      throw new Error("MongoDB URL is not defined")
    }

    console.log("Attempting to connect to MongoDB...")
    await mongoose.connect(mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("Connected to MongoDB successfully")
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}

module.exports = connectToDatabase

