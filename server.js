// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");
const txRoutes = require("./routes/transactions");
const adminRoutes = require("./routes/admin"); // admin operations
const adminAuthRoutes = require("./routes/admin_auth"); // admin login
const userRoutes = require("./routes/user"); // user endpoints

const app = express();
app.use(cors()); // allow requests from frontend (in dev)
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "public")));

// API
app.use("/api/auth", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes); // admin login
app.use("/api/tasks", tasksRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
