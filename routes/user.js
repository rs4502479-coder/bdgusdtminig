// // routes/user.js
// const express = require("express");
// const db = require("../config/db");
// const { auth } = require("../middleware/auth");
// const router = express.Router();


// /**
//  * GET /api/user/profile
//  * Returns basic user info
//  */
// router.get("/profile", auth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT id, name, email, invite_code, inviter_id, level, recharge_count, balance, created_at, is_admin FROM users WHERE id = ?",
//       [req.userId]
//     );
//     if (!rows.length)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     const u = rows[0];
//     res.json({
//       success: true,
//       user: {
//         id: u.id,
//         name: u.name,
//         email: u.email,
//         invite_code: u.invite_code,
//         inviter_id: u.inviter_id,
//         level: u.level,
//         recharge_count: u.recharge_count,
//         balance: parseFloat(u.balance),
//         is_admin: !!u.is_admin,
//         created_at: u.created_at,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * GET /api/user/balance
//  * Returns only balance (lightweight)
//  */
// router.get("/balance", auth, async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT balance FROM users WHERE id = ?", [
//       req.userId,
//     ]);
//     if (!rows.length)
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     res.json({ success: true, balance: parseFloat(rows[0].balance) });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * GET /api/user/transactions/last
//  * returns last recharge and last withdrawal
//  */
// router.get("/transactions/last", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     // last recharge
//     const [lastRe] = await db.query(
//       "SELECT amount, created_at FROM transactions WHERE user_id = ? AND type = 'recharge' ORDER BY id DESC LIMIT 1",
//       [userId]
//     );
//     // last withdrawal
//     const [lastW] = await db.query(
//       "SELECT amount, created_at FROM transactions WHERE user_id = ? AND type = 'withdrawal' ORDER BY id DESC LIMIT 1",
//       [userId]
//     );

//     res.json({
//       success: true,
//       lastDeposit: lastRe.length
//         ? { amount: parseFloat(lastRe[0].amount), date: lastRe[0].created_at }
//         : { amount: 0, date: null },
//       lastWithdraw: lastW.length
//         ? { amount: parseFloat(lastW[0].amount), date: lastW[0].created_at }
//         : { amount: 0, date: null },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * GET /api/user/transactions/history?page=1&limit=20
//  * returns paginated transaction history for user
//  */
// router.get("/transactions/history", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const page = Math.max(1, parseInt(req.query.page || "1"));
//     const limit = Math.min(100, parseInt(req.query.limit || "20"));
//     const offset = (page - 1) * limit;

//     const [rows] = await db.query(
//       "SELECT transaction_id, type, amount, status, metadata, created_at FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?",
//       [userId, limit, offset]
//     );

//     res.json({ success: true, page, limit, data: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// // FIXED /api/user/me
// router.get("/me", auth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT id, username, email, balance, level FROM users WHERE id=?",
//       [req.userId]
//     );

//     if (!rows.length) return res.json({ success: false });

//     res.json({ success: true, user: rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });



// /**
//  * POST /api/user/update
//  * update basic allowed fields (name)
//  */
// router.post("/update", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { name } = req.body;
//     if (!name)
//       return res.status(400).json({ success: false, message: "Name required" });
//     await db.query("UPDATE users SET name = ? WHERE id = ?", [name, userId]);
//     res.json({ success: true, message: "Profile updated" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


// // ======================= TEAM API (5 LEVEL SYSTEM) ===========================
// router.get("/team", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     // ---- LEVEL 1
//     const [L1] = await db.query(
//       "SELECT id FROM users WHERE inviter_id = ?",
//       [userId]
//     );

//     // ---- LEVEL 2
//     const [L2] = await db.query(
//       `SELECT u2.id FROM users u1 
//        JOIN users u2 ON u2.inviter_id = u1.id
//        WHERE u1.inviter_id = ?`,
//       [userId]
//     );

//     // ---- LEVEL 3
//     const [L3] = await db.query(
//       `SELECT u3.id FROM users u1
//        JOIN users u2 ON u2.inviter_id = u1.id
//        JOIN users u3 ON u3.inviter_id = u2.id
//        WHERE u1.inviter_id = ?`,
//       [userId]
//     );

//     // ---- LEVEL 4
//     const [L4] = await db.query(
//       `SELECT u4.id FROM users u1
//        JOIN users u2 ON u2.inviter_id = u1.id
//        JOIN users u3 ON u3.inviter_id = u2.id
//        JOIN users u4 ON u4.inviter_id = u3.id
//        WHERE u1.inviter_id = ?`,
//       [userId]
//     );

//     // ---- LEVEL 5
//     const [L5] = await db.query(
//       `SELECT u5.id FROM users u1
//        JOIN users u2 ON u2.inviter_id = u1.id
//        JOIN users u3 ON u3.inviter_id = u2.id
//        JOIN users u4 ON u4.inviter_id = u3.id
//        JOIN users u5 ON u5.inviter_id = u4.id
//        WHERE u1.inviter_id = ?`,
//       [userId]
//     );


//     // ------------- LEVEL DETAILS CONFIG ---------------
//     const levels = [
//       { level: 1, commission: 10, users: L1 },
//       { level: 2, commission: 5, users: L2 },
//       { level: 3, commission: 3, users: L3 },
//       { level: 4, commission: 2, users: L4 },
//       { level: 5, commission: 1, users: L5 },
//     ];

//     let levelOutput = [];

//     // ========== LOOP 5 LEVELS AND CALCULATE DATA ==========
//     for (const L of levels) {
//       const userList = L.users.map(u => u.id);
//       const register = userList.length;

//       if (register === 0) {
//         levelOutput.push({
//           level: L.level,
//           commission: L.commission,
//           register: 0,
//           valid: 0,
//           income: 0
//         });
//         continue;
//       }

//       // Valid users (those who recharged once)
//       const [validUsers] = await db.query(
//         `SELECT user_id FROM transactions
//          WHERE user_id IN (?) 
//          AND type='recharge' 
//          AND status='confirmed'
//          GROUP BY user_id`,
//         [userList]
//       );

//       const valid = validUsers.length;

//       // Commission Income
//       const [incomeRow] = await db.query(
//         `SELECT SUM(amount * ${L.commission} / 100) AS income
//          FROM transactions
//          WHERE user_id IN (?) 
//          AND type='recharge' 
//          AND status='confirmed'`,
//         [userList]
//       );

//       const income = incomeRow[0].income ? parseFloat(incomeRow[0].income) : 0;

//       levelOutput.push({
//         level: L.level,
//         commission: L.commission,
//         register,
//         valid,
//         income
//       });
//     }

//     // ---------------- SUMMARY ------------------
//     const allUsers = [
//       ...L1.map(u => u.id),
//       ...L2.map(u => u.id),
//       ...L3.map(u => u.id),
//       ...L4.map(u => u.id),
//       ...L5.map(u => u.id)
//     ];

//     const team_size = allUsers.length;

//     let summary = {
//       team_size,
//       team_recharge: 0,
//       team_withdraw: 0,
//       new_team: 0,
//       first_recharge: 0,
//       first_withdraw: 0
//     };

//     if (team_size > 0) {
//       // Total Recharge
//       const [rechargeSum] = await db.query(
//         `SELECT SUM(amount) AS total FROM transactions 
//          WHERE user_id IN (?) AND type='recharge' AND status='confirmed'`,
//         [allUsers]
//       );

//       // Total Withdraw
//       const [withdrawSum] = await db.query(
//         `SELECT SUM(amount) AS total FROM transactions 
//          WHERE user_id IN (?) AND type='withdrawal' AND status='confirmed'`,
//         [allUsers]
//       );

//       // New Today
//       const [newTeam] = await db.query(
//         `SELECT COUNT(*) AS total FROM users 
//          WHERE inviter_id IN (?) AND DATE(created_at)=CURDATE()`,
//         [allUsers]
//       );

//       // First Recharge
//       const [firstRe] = await db.query(
//         `SELECT COUNT(*) AS total FROM (
//            SELECT user_id FROM transactions 
//            WHERE user_id IN (?) AND type='recharge' AND status='confirmed'
//            GROUP BY user_id HAVING COUNT(id)=1
//          ) AS t`,
//         [allUsers]
//       );

//       // First Withdraw
//       const [firstWd] = await db.query(
//         `SELECT COUNT(*) AS total FROM (
//            SELECT user_id FROM transactions 
//            WHERE user_id IN (?) AND type='withdrawal' AND status='confirmed'
//            GROUP BY user_id HAVING COUNT(id)=1
//          ) AS t`,
//         [allUsers]
//       );

//       summary.team_recharge = rechargeSum[0].total || 0;
//       summary.team_withdraw = withdrawSum[0].total || 0;
//       summary.new_team = newTeam[0].total || 0;
//       summary.first_recharge = firstRe[0].total || 0;
//       summary.first_withdraw = firstWd[0].total || 0;
//     }

//     return res.json({
//       success: true,
//       levels: levelOutput,
//       summary
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// });


// router.post("/buy-recharge", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const { amount } = req.body;

//     // check balance
//     const [[user]] = await db.query("SELECT balance FROM users WHERE id=?", [userId]);
//     if (user.balance < amount)
//       return res.json({ success: false, message: "Insufficient balance" });

//     // deduct balance
//     await db.query("UPDATE users SET balance = balance - ? WHERE id=?", [amount, userId]);

//     // save recharge order
//     await db.query("INSERT INTO recharge_orders (user_id, amount) VALUES (?,?)", [userId, amount]);

//     return res.json({ success: true, message: "Recharge Plan Purchased!" });

//   } catch (err) {
//     console.log(err);
//     return res.json({ success: false, message: "Server error" });
//   }
// });
// // ----------------- TASK / TEAM endpoints -----------------
// const { v4: uuidv4 } = require("uuid");

// /**
//  * POST /api/user/buy-task
//  * buy a daily team task (deduct from wallet and create user_tasks entry)
//  * body: { amount }
//  */
// router.post("/buy-task", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const amount = parseFloat(req.body.amount || 0);
//     if (!amount || amount <= 0) return res.json({ success: false, message: "Invalid amount" });

//     // fetch balance
//     const [uRows] = await db.query("SELECT balance FROM users WHERE id = ?", [userId]);
//     if (!uRows.length) return res.json({ success: false, message: "User not found" });

//     const balance = parseFloat(uRows[0].balance || 0);
//     if (balance < amount) return res.json({ success: false, message: "Insufficient balance" });

//     // deduct from user balance
//     await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [amount, userId]);

//     // insert into user_tasks (user can have multiple tasks, we keep latest)
//     await db.query("INSERT INTO user_tasks (user_id, amount, last_claim) VALUES (?,?,NULL)", [userId, amount]);

//     // insert transaction for purchase (optional type 'recharge' or custom 'task_purchase')
//     await db.query(
//       "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
//       [
//         "TX-" + uuidv4(),
//         userId,
//         "withdrawal", // or 'task_purchase' if you prefer a custom type
//         amount,
//         "confirmed",
//         JSON.stringify({ reason: "task_purchase" })
//       ]
//     );

//     return res.json({ success: true, message: "Task purchased successfully" });
//   } catch (err) {
//     console.error("BUY-TASK ERROR:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /**
//  * POST /api/user/claim-task
//  * Claim the daily team task reward ($10 fixed) — once per day per purchased task (checks last_claim)
//  */




// router.post("/claim-task", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     // 1️⃣ Get user with active plan
//     const [[user]] = await db.query("SELECT level FROM users WHERE id = ?", [
//       userId,
//     ]);

//     if (!user || !user.level) {
//       return res.json({
//         success: false,
//         message: "No active VIP plan found",
//       });
//     }

//     // 2️⃣ Get daily reward from plan
//     const [[plan]] = await db.query(
//       "SELECT daily_reward FROM plans WHERE id = ?",
//       [user.level]
//     );

//     if (!plan) {
//       return res.json({
//         success: false,
//         message: "Invalid Plan / No Reward Found",
//       });
//     }

//     const reward = parseFloat(plan.daily_reward); // ⭐ Correct reward

//     // 3️⃣ Get last claim info from user_tasks
//     const [tRows] = await db.query(
//       "SELECT id, last_claim FROM user_tasks WHERE user_id = ? ORDER BY id DESC LIMIT 1",
//       [userId]
//     );

//     if (!tRows.length) {
//       return res.json({
//         success: false,
//         message: "No purchased task found",
//       });
//     }

//     const task = tRows[0];

//     // 4️⃣ Check daily claim
//     const today = new Date().toISOString().split("T")[0];
//     let lastClaimDate = task.last_claim
//       ? new Date(task.last_claim).toISOString().split("T")[0]
//       : null;

//     if (lastClaimDate === today) {
//       return res.json({
//         success: false,
//         message: "Already claimed today",
//       });
//     }

//     // 5️⃣ Update claim time
//     await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id = ?", [
//       task.id,
//     ]);

//     // 6️⃣ Add reward to wallet
//     await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
//       reward,
//       userId,
//     ]);

//     // 7️⃣ Log transaction
//     await db.query(
//       "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
//       [
//         "TX-" + uuidv4(),
//         userId,
//         "bonus",
//         reward,
//         "confirmed",
//         JSON.stringify({ source: "daily_task_reward" }),
//       ]
//     );

//     return res.json({
//       success: true,
//       message: `Claim successful: $${reward}`,
//       reward,
//     });
//   } catch (err) {
//     console.error("CLAIM-TASK ERROR:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// router.get("/tasks/status", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [rows] = await db.query(
//       `SELECT ut.*, p.daily_reward 
//        FROM user_tasks ut
//        LEFT JOIN plans p ON ut.amount = p.amount
//        WHERE ut.user_id = ?
//        ORDER BY ut.id DESC
//        LIMIT 1`,
//       [userId]
//     );

//     if (!rows.length) return res.json({ success: true, activePlan: null });

//     return res.json({ success: true, activePlan: rows[0] });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false });
//   }
// });


// router.post("/tasks/claim", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [[plan]] = await db.query(
//       `SELECT ut.id AS task_id, ut.last_claim, p.daily_reward 
//        FROM user_tasks ut
//        LEFT JOIN plans p ON ut.amount = p.amount
//        WHERE ut.user_id = ?
//        ORDER BY ut.id DESC
//        LIMIT 1`,
//       [userId]
//     );

//     if (!plan)
//       return res.json({ success: false, message: "No active task found" });

//     const reward = parseFloat(plan.daily_reward);

//     const today = new Date().toISOString().split("T")[0];
//     const last = plan.last_claim
//       ? new Date(plan.last_claim).toISOString().split("T")[0]
//       : null;

//     if (last === today)
//       return res.json({ success: false, message: "Already claimed today" });

//     // update last claim
//     await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id = ?", [
//       plan.task_id,
//     ]);

//     // add money
//     await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
//       reward,
//       userId,
//     ]);

//     return res.json({ success: true, reward });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });


// router.get("/tasks/status", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [rows] = await db.query(
//       `
//       SELECT 
//         ut.id,
//         ut.amount,
//         ut.last_claim,
//         p.daily_reward
//       FROM user_tasks ut
//       LEFT JOIN plans p 
//         ON p.amount = CAST(ut.amount AS UNSIGNED)
//       WHERE ut.user_id = ?
//       ORDER BY ut.id DESC
//       LIMIT 1
//     `,
//       [userId]
//     );

//     if (!rows.length) return res.json({ success: true, activePlan: null });

//     const t = rows[0];

//     return res.json({
//       success: true,
//       activePlan: {
//         id: t.id,
//         amount: Number(t.amount),
//         last_claim: t.last_claim,
//         daily_reward: Number(t.daily_reward) || 0,
//       },
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ success: false });
//   }
// });
// router.post("/tasks/claim", auth, async (req, res) => {
//   try {
//     const userId = req.userId;

//     const [[task]] = await db.query(
//       `
//       SELECT 
//         ut.id,
//         ut.last_claim,
//         p.daily_reward
//       FROM user_tasks ut
//       LEFT JOIN plans p 
//         ON p.amount = CAST(ut.amount AS UNSIGNED)
//       WHERE ut.user_id = ?
//       ORDER BY ut.id DESC
//       LIMIT 1
//     `,
//       [userId]
//     );

//     if (!task)
//       return res.json({ success: false, message: "No active task found" });

//     const reward = Number(task.daily_reward) || 0;

//     const today = new Date().toISOString().split("T")[0];
//     const last = task.last_claim
//       ? new Date(task.last_claim).toISOString().split("T")[0]
//       : null;

//     if (last === today)
//       return res.json({ success: false, message: "Already claimed today" });

//     // Update claim time
//     await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id=?", [
//       task.id,
//     ]);

//     // Add reward to balance
//     await db.query("UPDATE users SET balance = balance + ? WHERE id=?", [
//       reward,
//       userId,
//     ]);

//     return res.json({ success: true, reward });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// module.exports = router;

// routes/user.js
const express = require("express");
const db = require("../config/db");
const { auth } = require("../middleware/auth");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");


// ================= USER PROFILE ==================
router.get("/profile", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, invite_code, inviter_id, level, recharge_count, balance, created_at, is_admin FROM users WHERE id = ?",
      [req.userId]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    const u = rows[0];

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
        balance: parseFloat(u.balance),
        is_admin: !!u.is_admin,
        created_at: u.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});


// ============== BALANCE =================
router.get("/balance", auth, async (req, res) => {
  try {
    const [[user]] = await db.query("SELECT balance FROM users WHERE id=?", [
      req.userId,
    ]);

    return res.json({
      success: true,
      balance: parseFloat(user.balance),
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});


// ============= LAST TRANSACTIONS ====================
router.get("/transactions/last", auth, async (req, res) => {
  try {
    const user = req.userId;

    const [lastRe] = await db.query(
      "SELECT amount, created_at FROM transactions WHERE user_id=? AND type='recharge' ORDER BY id DESC LIMIT 1",
      [user]
    );

    const [lastW] = await db.query(
      "SELECT amount, created_at FROM transactions WHERE user_id=? AND type='withdrawal' ORDER BY id DESC LIMIT 1",
      [user]
    );

    res.json({
      success: true,
      lastDeposit: lastRe.length
        ? { amount: parseFloat(lastRe[0].amount), date: lastRe[0].created_at }
        : { amount: 0, date: null },
      lastWithdraw: lastW.length
        ? { amount: parseFloat(lastW[0].amount), date: lastW[0].created_at }
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

    const [rows] = await db.query(
      `SELECT transaction_id, type, amount, status, metadata, created_at 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY id DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.json({ success: true, page, limit, data: rows });
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

    await db.query("UPDATE users SET name=? WHERE id=?", [name, req.userId]);

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
    const amount = parseFloat(req.body.amount);

    if (!amount || amount <= 0)
      return res.json({ success: false, message: "Invalid amount" });

    const [[user]] = await db.query("SELECT balance FROM users WHERE id=?", [
      userId,
    ]);

    if (user.balance < amount)
      return res.json({ success: false, message: "Insufficient balance" });

    await db.query("UPDATE users SET balance = balance - ? WHERE id=?", [
      amount,
      userId,
    ]);

    await db.query(
      "INSERT INTO user_tasks (user_id, amount, last_claim) VALUES (?,?,NULL)",
      [userId, amount]
    );

    await db.query(
      `INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) 
       VALUES (?,?,?,?,?,?)`,
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



// =====================================================================
// ⭐ FINAL FIXED — GET TASK STATUS (NO DUPLICATE, 100% CLEAN)
// =====================================================================
router.get("/tasks/status", auth, async (req, res) => {
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
    res.json({ success: false });
  }
});


// =====================================================================
// ⭐ FINAL FIXED — CLAIM TASK (NO DUPLICATE, 100% CORRECT)
// =====================================================================
router.post("/tasks/claim", auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [[task]] = await db.query(
      `SELECT 
         ut.id,
         ut.last_claim,
         p.daily_reward
       FROM user_tasks ut
       LEFT JOIN plans p ON p.amount = ut.amount
       WHERE ut.user_id = ?
       ORDER BY ut.id DESC
       LIMIT 1`,
      [userId]
    );

    if (!task)
      return res.json({ success: false, message: "No active task found" });

    const reward = Number(task.daily_reward) || 0;

    const today = new Date().toISOString().split("T")[0];
    const last = task.last_claim
      ? new Date(task.last_claim).toISOString().split("T")[0]
      : null;

    if (last === today)
      return res.json({ success: false, message: "Already claimed today" });

    await db.query("UPDATE user_tasks SET last_claim = NOW() WHERE id=?", [
      task.id,
    ]);

    await db.query("UPDATE users SET balance = balance + ? WHERE id=?", [
      reward,
      userId,
    ]);

    res.json({ success: true, reward });
  } catch (err) {
    console.error("CLAIM ERR:", err);
    res.json({ success: false });
  }
});



module.exports = router;
