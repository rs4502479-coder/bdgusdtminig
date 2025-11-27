// const express = require("express");
// const { v4: uuidv4 } = require("uuid");
// const jwt = require("jsonwebtoken");
// const db = require("../config/db");
// require("dotenv").config();

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET;

// /* ============================
//    AUTH MIDDLEWARE
//    ============================ */
// function auth(req, res, next) {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ error: "No token" });

//   const token = header.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "No token" });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch (e) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }

// /* ============================
//    GET REAL BALANCE
//    ============================ */
// router.get("/balance", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [rows] = await db.query("SELECT balance FROM users WHERE id = ?", [
//       userId,
//     ]);

//     if (!rows.length) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     return res.json({
//       success: true,
//       balance: rows[0].balance,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// /* ============================
//    BUY TASK PLAN (ENERGY)
//    ============================ */
// router.post("/buy", auth, async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.userId;

//     if (!amount) {
//       return res.status(400).json({ error: "Amount required" });
//     }

//     // check balance
//     const [u] = await db.query("SELECT balance FROM users WHERE id = ?", [
//       userId,
//     ]);
//     if (!u.length) return res.status(404).json({ error: "User not found" });

//     const balance = u[0].balance;

//     if (balance < amount) {
//       return res.status(400).json({ error: "Insufficient balance" });
//     }

//     // deduct money
//     await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [
//       amount,
//       userId,
//     ]);

//     // store purchased plan
//     await db.query(
//       "INSERT INTO user_tasks (user_id, amount, last_claim) VALUES (?, ?, NULL)",
//       [userId, amount]
//     );

//     res.json({ success: true, message: "Plan purchased successfully" });
//   } catch (e) {
//     console.error("BUY TASK ERROR:", e);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /* ============================
//    CLAIM DAILY REWARD
//    ============================ */
// router.post("/claim", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [task] = await db.query(
//       "SELECT * FROM user_tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1",
//       [userId]
//     );

//     if (!task.length) {
//       return res.status(400).json({ error: "No purchased plan found" });
//     }

//     const t = task[0];
//     const reward = t.amount; // 10% reward

//     const today = new Date().toISOString().split("T")[0];
//     const lastClaim = t.last_claim
//       ? t.last_claim.toISOString().split("T")[0]
//       : null;

//     if (today === lastClaim) {
//       return res.status(400).json({ error: "Already claimed today" });
//     }

//     // update last claim time
//     await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id = ?", [
//       t.id,
//     ]);

//     // add reward to balance
//     await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
//       reward,
//       userId,
//     ]);

//     // record transaction
//     await db.query(
//       "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
//       [
//         "TX-" + uuidv4(),
//         userId,
//         "bonus",
//         reward,
//         "confirmed",
//         JSON.stringify({ source: "daily_claim" }),
//       ]
//     );

//     res.json({ success: true, reward, message: "Reward claimed" });
//   } catch (e) {
//     console.error("CLAIM ERROR:", e);
//     res.status(500).json({ error: "Server error" });
//   }
// });


// router.get("/status", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [t] = await db.query(
//       "SELECT * FROM user_tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1",
//       [userId]
//     );

//     if (!t.length) return res.json({ success: true, activePlan: null });

//     return res.json({
//       success: true,
//       activePlan: t[0],
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// module.exports = router;
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

/* ============================
   AUTH MIDDLEWARE
============================ */
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ============================
   GET REAL BALANCE
============================ */
router.get("/balance", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await db.query("SELECT balance FROM users WHERE id = ?", [
      userId,
    ]);

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      balance: rows[0].balance,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ============================
   BUY PLAN
============================ */
router.post("/buy", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (!amount) return res.status(400).json({ error: "Amount required" });

    // check balance
    const [u] = await db.query("SELECT balance FROM users WHERE id = ?", [
      userId,
    ]);
    if (!u.length) return res.status(404).json({ error: "User not found" });

    if (u[0].balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });

    // deduct
    await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [
      amount,
      userId,
    ]);

    // add plan
    await db.query(
      "INSERT INTO user_tasks (user_id, amount, last_claim) VALUES (?, ?, NULL)",
      [userId, amount]
    );

    res.json({ success: true, message: "Plan purchased successfully" });
  } catch (e) {
    console.error("BUY TASK ERROR:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   CLAIM DAILY REWARD
============================ */
router.post("/claim", auth, async (req, res) => {
  try {
    const userId = req.userId;

    // join with plans table to get daily_reward
    const [task] = await db.query(
      `SELECT ut.*, p.daily_reward 
       FROM user_tasks ut 
       LEFT JOIN plans p ON p.amount = ut.amount
       WHERE ut.user_id = ?
       ORDER BY ut.id DESC LIMIT 1`,
      [userId]
    );

    if (!task.length)
      return res.status(400).json({ error: "No purchased plan found" });

    const t = task[0];

    const reward = Number(t.daily_reward || 0);

    if (reward <= 0)
      return res.status(400).json({ error: "Invalid plan reward" });

    const today = new Date().toISOString().split("T")[0];
    const lastClaim = t.last_claim
      ? t.last_claim.toISOString().split("T")[0]
      : null;

    if (today === lastClaim) {
      return res.status(400).json({ error: "Already claimed today" });
    }

    // update last claim
    await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id = ?", [
      t.id,
    ]);

    // add reward
    await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
      reward,
      userId,
    ]);

    // record transaction
    await db.query(
      `INSERT INTO transactions 
       (transaction_id, user_id, type, amount, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "TX-" + uuidv4(),
        userId,
        "daily_reward",
        reward,
        "confirmed",
        JSON.stringify({ source: "daily_claim" }),
      ]
    );

    res.json({ success: true, reward, message: "Reward claimed" });
  } catch (e) {
    console.error("CLAIM ERROR:", e);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================
   TASK STATUS (FIXED)
============================ */
router.get("/status", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [rows] = await db.query(
      `SELECT 
         ut.id,
         ut.user_id,
         ut.amount,
         ut.last_claim,
         ut.created_at,
         p.daily_reward
       FROM user_tasks ut
       LEFT JOIN plans p ON p.amount = ut.amount
       WHERE ut.user_id = ?
       ORDER BY ut.id DESC
       LIMIT 1`,
      [userId]
    );

    if (!rows.length) return res.json({ success: true, activePlan: null });

    const t = rows[0];

    return res.json({
      success: true,
      activePlan: {
        id: t.id,
        user_id: t.user_id,
        amount: Number(t.amount),
        daily_reward: Number(t.daily_reward) || 0,
        last_claim: t.last_claim,
        created_at: t.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
