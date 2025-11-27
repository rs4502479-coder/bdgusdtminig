// routes/user.js
const express = require("express");
const db = require("../config/db");
const { auth } = require("../middleware/auth");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// ================= USER PROFILE ==================
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, invite_code, inviter_id, level, 
       recharge_count, balance, created_at, is_admin 
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (!result.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    const u = result.rows[0];

    res.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        invite_code: u.invite_code,
        inviter_id: u.inviter_id,
        level: u.level,
        recharge_count: u.recharge_count,
        balance: Number(u.balance),
        is_admin: !!u.is_admin,
        created_at: u.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ============== BALANCE =================
router.get("/balance", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT balance FROM users WHERE id=$1",
      [req.userId]
    );

    return res.json({
      success: true,
      balance: Number(result.rows[0].balance),
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ============= LAST TRANSACTIONS ====================
router.get("/transactions/last", auth, async (req, res) => {
  try {
    const user = req.userId;

    const lastRe = await db.query(
      "SELECT amount, created_at FROM transactions WHERE user_id=$1 AND type='recharge' ORDER BY id DESC LIMIT 1",
      [user]
    );

    const lastW = await db.query(
      "SELECT amount, created_at FROM transactions WHERE user_id=$1 AND type='withdrawal' ORDER BY id DESC LIMIT 1",
      [user]
    );

    res.json({
      success: true,
      lastDeposit: lastRe.rows.length
        ? { amount: Number(lastRe.rows[0].amount), date: lastRe.rows[0].created_at }
        : { amount: 0, date: null },
      lastWithdraw: lastW.rows.length
        ? { amount: Number(lastW.rows[0].amount), date: lastW.rows[0].created_at }
        : { amount: 0, date: null },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ============= TRANSACTION HISTORY ====================
router.get("/transactions/history", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const page = Math.max(1, parseInt(req.query.page || 1));
    const limit = Math.min(100, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT transaction_id, type, amount, status, metadata, created_at
       FROM transactions 
       WHERE user_id = $1
       ORDER BY id DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ success: true, page, limit, data: result.rows });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// =============== UPDATE USER ==================
router.post("/update", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.json({ success: false, message: "Name required" });

    await db.query("UPDATE users SET name=$1 WHERE id=$2", [
      name,
      req.userId,
    ]);

    res.json({ success: true, message: "Profile updated" });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// =============== BUY TASK ==================
router.post("/buy-task", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0)
      return res.json({ success: false, message: "Invalid amount" });

    const result = await db.query("SELECT balance FROM users WHERE id=$1", [
      userId,
    ]);

    if (result.rows[0].balance < amount)
      return res.json({ success: false, message: "Insufficient balance" });

    await db.query("UPDATE users SET balance = balance - $1 WHERE id=$2", [
      amount,
      userId,
    ]);

    await db.query(
      "INSERT INTO user_tasks (user_id, amount, last_claim) VALUES ($1,$2,NULL)",
      [userId, amount]
    );

    await db.query(
      `INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) 
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        "TX-" + uuidv4(),
        userId,
        "withdrawal",
        amount,
        "confirmed",
        JSON.stringify({ reason: "task_purchase" }),
      ]
    );

    res.json({ success: true, message: "Task purchased successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
});

// ================== GET TASK STATUS ==================
router.get("/tasks/status", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ut.id, ut.user_id, ut.amount, ut.last_claim, ut.created_at,
              p.daily_reward
       FROM user_tasks ut
       LEFT JOIN plans p ON p.amount = ut.amount
       WHERE ut.user_id = $1
       ORDER BY ut.id DESC
       LIMIT 1`,
      [req.userId]
    );

    if (!result.rows.length)
      return res.json({ success: true, activePlan: null });

    const t = result.rows[0];

    res.json({
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
    res.json({ success: false });
  }
});

// ================== CLAIM TASK ==================
router.post("/tasks/claim", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT ut.id, ut.last_claim, p.daily_reward
       FROM user_tasks ut
       LEFT JOIN plans p ON p.amount = ut.amount
       WHERE ut.user_id = $1
       ORDER BY ut.id DESC
       LIMIT 1`,
      [req.userId]
    );

    if (!result.rows.length)
      return res.json({ success: false, message: "No active task found" });

    const task = result.rows[0];
    const reward = Number(task.daily_reward);

    const today = new Date().toISOString().split("T")[0];
    const last = task.last_claim
      ? new Date(task.last_claim).toISOString().split("T")[0]
      : null;

    if (last === today)
      return res.json({ success: false, message: "Already claimed today" });

    await db.query(
      "UPDATE user_tasks SET last_claim = NOW() WHERE id=$1",
      [task.id]
    );

    await db.query(
      "UPDATE users SET balance = balance + $1 WHERE id=$2",
      [reward, req.userId]
    );

    res.json({ success: true, reward });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
