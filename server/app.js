require("dotenv").config()
const express = require("express")
const cors = require("cors")
const connectToDatabase = require("./config/database")
const UserModel = require("./model/User")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.post("/register", async (req, res) => {
  try {
    const { email } = req.body
    const existingUser = await UserModel.findOne({ email })

    if (existingUser) {
      return res.status(400).json("User already exists!")
    }

    const newUser = await UserModel.create(req.body)
    res.status(201).json("User created successfully")
  } catch (error) {
    console.error("Registration error:", error)
    if (error.name === "ValidationError") {
      return res.status(400).json(Object.values(error.errors)[0].message)
    }
    res.status(500).json("Server error during registration")
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json("User not found!")
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json("Wrong Password!")
    }

    res.json("Successfully logged in")
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json("Server error during login")
  }
})

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectToDatabase()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

