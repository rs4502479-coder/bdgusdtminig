// routes/admin_auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Admin login (checks is_admin flag)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email & password required" });

    const [rows] = await db.query(
      "SELECT id, password_hash, is_admin FROM users WHERE email = ?",
      [email]
    );
    if (!rows.length)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const u = rows[0];
    if (!u.is_admin)
      return res.status(403).json({ success: false, message: "Not an admin" });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // token includes isAdmin = true
    const token = jwt.sign({ id: u.id, isAdmin: true }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
