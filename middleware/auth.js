// middleware/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Express middleware that verifies token and sets req.userId and req.isAdmin
function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ success: false, message: "No token" });
    const token = header.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded should contain at least { id, isAdmin? }
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin || false;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

// Admin-only guard
function adminOnly(req, res, next) {
  if (!req.isAdmin)
    return res.status(403).json({ success: false, message: "Admins only" });
  next();
}

module.exports = { auth, adminOnly };
