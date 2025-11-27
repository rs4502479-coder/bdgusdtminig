const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const NEW_USER_BONUS = parseFloat(process.env.NEW_USER_BONUS || "120");
const REFERRAL_BONUS = parseFloat(process.env.REFERRAL_BONUS || "10");

function genInvite() {
  return "INV-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ------------------- SIGNUP -----------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, invite_code } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email+password required" });

    const [ex] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (ex.length) return res.status(400).json({ error: "Email exists" });

    const hash = await bcrypt.hash(password, 10);

    let inviter_id = null;
    if (invite_code) {
      const [r] = await db.query("SELECT id FROM users WHERE invite_code = ?", [
        invite_code,
      ]);
      if (r.length) inviter_id = r[0].id;
    }

    let code = genInvite();
    let [c] = await db.query("SELECT id FROM users WHERE invite_code = ?", [
      code,
    ]);
    while (c.length) {
      code = genInvite();
      [c] = await db.query("SELECT id FROM users WHERE invite_code = ?", [
        code,
      ]);
    }

    const [ins] = await db.query(
      "INSERT INTO users (name,email,password_hash,invite_code,inviter_id,balance) VALUES (?,?,?,?,?,?)",
      [name, email, hash, code, inviter_id, NEW_USER_BONUS]
    );

    const userId = ins.insertId;

    await db.query(
      "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
      [
        "TX-" + uuidv4(),
        userId,
        "bonus",
        NEW_USER_BONUS,
        "confirmed",
        JSON.stringify({ reason: "signup" }),
      ]
    );

    if (inviter_id) {
      await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
        REFERRAL_BONUS,
        inviter_id,
      ]);

      await db.query(
        "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
        [
          "TX-" + uuidv4(),
          inviter_id,
          "bonus",
          REFERRAL_BONUS,
          "confirmed",
          JSON.stringify({ reason: "referral", invitee: userId }),
        ]
      );

      await db.query(
        "INSERT INTO invites (inviter_id, invitee_id) VALUES (?,?)",
        [inviter_id, userId]
      );
    }

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, invite_code: code });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- LOGIN (FULLY FIXED) -----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email & password required" });

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    // FIXED: use correct DB column
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // FIXED: JWT_SECRET correctly used
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
