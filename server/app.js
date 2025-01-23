require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectToDatabase = require("./config/database");
const UserModel = require("./model/User");

const app = express();

// CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from the "dist" folder (Vite build)
app.use(express.static(path.join(__dirname, "dist")));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User registration route
app.post("/register", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json("User already exists!");
    }

    const newUser = await UserModel.create(req.body);
    res.status(201).json("User created successfully");
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json(Object.values(error.errors)[0].message);
    }
    res.status(500).json("Server error during registration");
  }
});

// User login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json("User not found!");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json("Wrong Password!");
    }

    res.json("Successfully logged in");
  } catch (error) {
    console.error(error);
    res.status(500).json("Server error during login");
  }
});

// Fallback for unmatched routes to serve the frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Error handling for unmatched API requests
app.use((_, res) => {
  res.status(404).json({
    message: "Not Found!",
  });
});

// Database connection and server startup
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectToDatabase(); // Initialize the database connection.
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1); // Exit the process on failure.
  }
};

startServer();
