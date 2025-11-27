const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db");

// ===============================
// USER MAKES A WITHDRAW REQUEST
// ===============================
router.post("/request", auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { amount, wallet } = req.body;

    if (!amount || !wallet)
      return res.json({ success: false, message: "All fields required" });

    if (amount < 2)
      return res.json({
        success: false,
        message: "Minimum withdrawal is 2 USDT",
      });

    // USER BALANCE CHECK
    const [user] = await db.query("SELECT balance FROM users WHERE id=?", [
      user_id,
    ]);

    if (!user || user.balance < amount) {
      return res.json({ success: false, message: "Insufficient balance" });
    }

    // Deduct balance
    await db.query("UPDATE users SET balance = balance - ? WHERE id=?", [
      amount,
      user_id,
    ]);

    // Save transaction with status PENDING
    await db.query(
      `INSERT INTO transactions (transaction_id, user_id, type, amount, status, metadata)
       VALUES (UUID(), ?, 'withdrawal', ?, 'pending', ?)`,
      [user_id, amount, wallet]
    );

    return res.json({ success: true, message: "Withdrawal request submitted" });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
