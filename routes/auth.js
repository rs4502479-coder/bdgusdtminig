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

// =============================================================
// 🔥 SIGNUP — FULL PostgreSQL FIX
// =============================================================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, invite_code } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email+password required" });

    // CHECK EMAIL
    const { rows: exist } = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (exist.length)
      return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    // CHECK INVITER
    let inviter_id = null;
    if (invite_code) {
      const { rows: inv } = await db.query(
        "SELECT id FROM users WHERE invite_code = $1",
        [invite_code]
      );
      if (inv.length) inviter_id = inv[0].id;
    }

    // UNIQUE INVITE CODE
    let code = genInvite();
    let check = await db.query(
      "SELECT id FROM users WHERE invite_code = $1",
      [code]
    );

    while (check.rows.length) {
      code = genInvite();
      check = await db.query(
        "SELECT id FROM users WHERE invite_code = $1",
        [code]
      );
    }

    // INSERT USER
    const insertUser = await db.query(
      `INSERT INTO users (name, email, password_hash, invite_code, inviter_id, balance)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, email, hash, code, inviter_id, NEW_USER_BONUS]
    );

    const userId = insertUser.rows[0].id;

    // SIGNUP BONUS
    await db.query(
      `INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        "TX-" + uuidv4(),
        userId,
        "bonus",
        NEW_USER_BONUS,
        "confirmed",
        JSON.stringify({ reason: "signup" }),
      ]
    );

    // REFERRAL BONUS
    if (inviter_id) {
      await db.query(
        "UPDATE users SET balance = balance + $1 WHERE id = $2",
        [REFERRAL_BONUS, inviter_id]
      );

      await db.query(
        `INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata)
         VALUES ($1,$2,$3,$4,$5,$6)`,
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
        `INSERT INTO invites (inviter_id, invitee_id) VALUES ($1,$2)`,
        [inviter_id, userId]
      );
    }

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ success: true, token, invite_code: code });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================================================
// 🔥 LOGIN — FULL PostgreSQL FIX
// =============================================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (!rows.length)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
