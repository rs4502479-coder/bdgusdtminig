// routes/transactions.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");
const { auth } = require("../middleware/auth");

const router = express.Router();

// create recharge -> pending
router.post("/recharge", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const amount = parseFloat(req.body.amount);
    if (!amount || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });

    const txid = "TX-R-" + uuidv4();
    await db.query(
      "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
      [
        txid,
        userId,
        "recharge",
        amount,
        "pending",
        JSON.stringify(req.body.metadata || {}),
      ]
    );
    res.json({ success: true, transaction_id: txid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// create withdrawal request -> pending
router.post("/withdraw", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const amount = parseFloat(req.body.amount);
    const account_info = req.body.account_info || {};
    if (!amount || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });

    const [urows] = await db.query("SELECT balance FROM users WHERE id = ?", [
      userId,
    ]);
    if (!urows.length)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (parseFloat(urows[0].balance) < amount)
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance" });

    const txid = "TX-W-" + uuidv4();
    await db.query(
      "INSERT INTO transactions (transaction_id,user_id,type,amount,status,metadata) VALUES (?,?,?,?,?,?)",
      [
        txid,
        userId,
        "withdrawal",
        amount,
        "pending",
        JSON.stringify({ account_info }),
      ]
    );
    res.json({ success: true, transaction_id: txid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
