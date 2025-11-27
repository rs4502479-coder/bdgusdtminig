

// // // routes/admin.js
// // const express = require("express");
// // const db = require("../config/db");
// // const { auth, adminOnly } = require("../middleware/auth");
// // const adminAuth = require("../middleware/adminAuth");

// // const router = express.Router();

// // // list users (admin)
// // router.get("/users", auth, adminOnly, async (req, res) => {
// //   try {
// //     const [r] = await db.query(
// //       "SELECT id, name, email, invite_code, inviter_id, level, recharge_count, balance, is_admin, created_at FROM users ORDER BY id DESC"
// //     );
// //     res.json({ success: true, users: r });
// //   } catch (e) {
// //     console.error(e);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // });

// // // confirm or fail transaction
// // router.post("/transaction/confirm", auth, adminOnly, async (req, res) => {
// //   try {
// //     const { transaction_id, status } = req.body;
// //     if (!transaction_id || !status)
// //       return res
// //         .status(400)
// //         .json({ success: false, message: "Missing fields" });

// //     const [trows] = await db.query(
// //       "SELECT * FROM transactions WHERE transaction_id = ?",
// //       [transaction_id]
// //     );
// //     if (!trows.length)
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Transaction not found" });

// //     const tx = trows[0];
// //     if (tx.status === status)
// //       return res.json({ success: true, message: "No change" });

// //     // perform balance changes only if confirming
// //     if (status === "confirmed") {
// //       if (tx.type === "recharge") {
// //         await db.query(
// //           "UPDATE users SET balance = balance + ?, recharge_count = recharge_count + 1 WHERE id = ?",
// //           [tx.amount, tx.user_id]
// //         );

// //         // update level thresholds
// //         const [urows] = await db.query(
// //           "SELECT recharge_count FROM users WHERE id = ?",
// //           [tx.user_id]
// //         );
// //         const rc = urows[0].recharge_count;
// //         let newLevel = 1;
// //         if (rc >= 50) newLevel = 5;
// //         else if (rc >= 30) newLevel = 4;
// //         else if (rc >= 20) newLevel = 3;
// //         else if (rc >= 10) newLevel = 2;
// //         await db.query("UPDATE users SET level = ? WHERE id = ?", [
// //           newLevel,
// //           tx.user_id,
// //         ]);
// //       } else if (tx.type === "withdrawal") {
// //         // ensure user still has balance (simple check)
// //         const [urows] = await db.query(
// //           "SELECT balance FROM users WHERE id = ?",
// //           [tx.user_id]
// //         );
// //         const bal = parseFloat(urows[0].balance);
// //         if (bal < parseFloat(tx.amount)) {
// //           return res
// //             .status(400)
// //             .json({
// //               success: false,
// //               message: "Insufficient balance to confirm withdraw",
// //             });
// //         }
// //         await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [
// //           tx.amount,
// //           tx.user_id,
// //         ]);
// //       }
// //     }

// //     await db.query(
// //       "UPDATE transactions SET status = ? WHERE transaction_id = ?",
// //       [status, transaction_id]
// //     );
// //     res.json({ success: true, message: "Transaction updated" });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // });

// // // promote/demote user admin (for management)
// // router.post("/user/:id/promote", auth, adminOnly, async (req, res) => {
// //   try {
// //     const uid = parseInt(req.params.id);
// //     const { isAdmin } = req.body; // boolean
// //     await db.query("UPDATE users SET is_admin = ? WHERE id = ?", [
// //       isAdmin ? 1 : 0,
// //       uid,
// //     ]);
// //     res.json({ success: true, message: "Updated" });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // });













// // // ===============================
// // // GET ALL PENDING WITHDRAW REQUESTS
// // // ===============================
// // router.get("/withdraw/pending", adminAuth, async (req, res) => {
// //   try {
// //     const [rows] = await db.query(
// //       "SELECT * FROM transactions WHERE type='withdrawal' AND status='pending'"
// //     );
// //     return res.json({ success: true, data: rows });
// //   } catch (err) {
// //     return res.json({ success: false, message: "Server error" });
// //   }
// // });

// // // ===============================
// // // APPROVE WITHDRAW REQUEST
// // // ===============================
// // router.post("/withdraw/approve", adminAuth, async (req, res) => {
// //   const { id } = req.body;

// //   try {
// //     await db.query("UPDATE transactions SET status='confirmed' WHERE id=?", [
// //       id,
// //     ]);
// //     return res.json({ success: true, message: "Withdrawal Approved" });
// //   } catch (err) {
// //     return res.json({ success: false, message: "Server error" });
// //   }
// // });

// // // ===============================
// // // REJECT WITHDRAW REQUEST
// // // ===============================
// // router.post("/withdraw/reject", adminAuth, async (req, res) => {
// //   const { id } = req.body;

// //   try {
// //     // Refund balance
// //     const [[txn]] = await db.query("SELECT * FROM transactions WHERE id=?", [
// //       id,
// //     ]);

// //     if (txn) {
// //       await db.query("UPDATE users SET balance = balance + ? WHERE id=?", [
// //         txn.amount,
// //         txn.user_id,
// //       ]);
// //     }

// //     await db.query("UPDATE transactions SET status='failed' WHERE id=?", [id]);

// //     return res.json({ success: true, message: "Withdrawal Rejected" });
// //   } catch (err) {
// //     return res.json({ success: false, message: "Server error" });
// //   }
// // });

// // module.exports = router;


// // module.exports = router;
// // routes/admin.js
// const express = require("express");
// const db = require("../config/db");
// const adminAuth = require("../middleware/adminAuth");

// const router = express.Router();

// /* =====================================================
//    GET ALL USERS (ADMIN PANEL)
// ===================================================== */
// router.get("/users", adminAuth, async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT id, name, email, invite_code, inviter_id, level, recharge_count,
//       balance, is_admin, created_at 
//       FROM users ORDER BY id DESC
//     `);

//     res.json({ success: true, users: rows });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* =====================================================
//    CONFIRM / FAIL A TRANSACTION
// ===================================================== */
// router.post("/transaction/confirm", adminAuth, async (req, res) => {
//   try {
//     const { transaction_id, status } = req.body;

//     if (!transaction_id || !status)
//       return res.status(400).json({ success: false, message: "Missing fields" });

//     const [[tx]] = await db.query(
//       "SELECT * FROM transactions WHERE transaction_id=?",
//       [transaction_id]
//     );

//     if (!tx)
//       return res.status(404).json({ success: false, message: "Transaction not found" });

//     // If confirming recharge
//     if (status === "confirmed" && tx.type === "recharge") {
//       await db.query(
//         "UPDATE users SET balance = balance + ?, recharge_count = recharge_count + 1 WHERE id=?",
//         [tx.amount, tx.user_id]
//       );

//       // Auto level update
//       const [[usr]] = await db.query(
//         "SELECT recharge_count FROM users WHERE id=?",
//         [tx.user_id]
//       );

//       const rc = usr.recharge_count;
//       let newLevel = 1;

//       if (rc >= 50) newLevel = 5;
//       else if (rc >= 30) newLevel = 4;
//       else if (rc >= 20) newLevel = 3;
//       else if (rc >= 10) newLevel = 2;

//       await db.query("UPDATE users SET level=? WHERE id=?", [newLevel, tx.user_id]);
//     }

//     // Confirm withdraw
//     if (status === "confirmed" && tx.type === "withdrawal") {
//       const [[u]] = await db.query(
//         "SELECT balance FROM users WHERE id=?", [tx.user_id]
//       );

//       if (u.balance < tx.amount)
//         return res.json({ success: false, message: "Insufficient balance" });

//       await db.query(
//         "UPDATE users SET balance = balance - ? WHERE id=?",
//         [tx.amount, tx.user_id]
//       );
//     }

//     // Update transaction status
//     await db.query(
//       "UPDATE transactions SET status=? WHERE transaction_id=?",
//       [status, transaction_id]
//     );

//     res.json({ success: true, message: "Transaction updated" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* =====================================================
//    PROMOTE / DEMOTE ADMIN
// ===================================================== */
// router.post("/user/:id/promote", adminAuth, async (req, res) => {
//   try {
//     await db.query(
//       "UPDATE users SET is_admin=? WHERE id=?",
//       [req.body.isAdmin ? 1 : 0, req.params.id]
//     );
//     res.json({ success: true, message: "Updated" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// /* =====================================================
//    GET PENDING WITHDRAW REQUESTS
// ===================================================== */
// router.get("/withdraw/pending", adminAuth, async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM transactions WHERE type='withdrawal' AND status='pending'"
//     );
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.json({ success: false, message: "Server error" });
//   }
// });

// /* =====================================================
//    APPROVE WITHDRAW
// ===================================================== */
// router.post("/withdraw/approve", adminAuth, async (req, res) => {
//   try {
//     const { id } = req.body;

//     const [[tx]] = await db.query("SELECT * FROM transactions WHERE id=?", [id]);

//     if (!tx)
//       return res.json({ success: false, message: "Request not found" });

//     // Deduct balance
//     await db.query(
//       "UPDATE users SET balance = balance - ? WHERE id=?",
//       [tx.amount, tx.user_id]
//     );

//     await db.query(
//       "UPDATE transactions SET status='confirmed' WHERE id=?",
//       [id]
//     );

//     res.json({ success: true, message: "Withdrawal Approved" });

//   } catch (err) {
//     res.json({ success: false, message: "Server error" });
//   }
// });

// /* =====================================================
//    REJECT WITHDRAW
// ===================================================== */
// router.post("/withdraw/reject", adminAuth, async (req, res) => {
//   try {
//     const { id } = req.body;

//     const [[tx]] = await db.query("SELECT * FROM transactions WHERE id=?", [id]);

//     if (!tx)
//       return res.json({ success: false, message: "Request not found" });

//     // Refund
//     await db.query(
//       "UPDATE users SET balance = balance + ? WHERE id=?",
//       [tx.amount, tx.user_id]
//     );

//     await db.query(
//       "UPDATE transactions SET status='failed' WHERE id=?",
//       [id]
//     );

//     res.json({ success: true, message: "Withdrawal Rejected" });

//   } catch (err) {
//     res.json({ success: false, message: "Server error" });
//   }
// });

// module.exports = router;
// routes/admin.js
const express = require("express");
const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

/* =====================================================
   GET ALL USERS (ADMIN PANEL)
===================================================== */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, email, invite_code, inviter_id, level, 
      recharge_count, balance, is_admin, created_at 
      FROM users ORDER BY id DESC
    `);

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   CONFIRM / FAIL TRANSACTION (RECHARGE + WITHDRAW)
===================================================== */
router.post("/transaction/confirm", adminAuth, async (req, res) => {
  try {
    const { transaction_id, status } = req.body;

    if (!transaction_id || !status)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const [[tx]] = await db.query(
      "SELECT * FROM transactions WHERE transaction_id=?",
      [transaction_id]
    );

    if (!tx)
      return res.status(404).json({ success: false, message: "Transaction not found" });

    /* ============================
       CONFIRM RECHARGE
    ============================ */
    if (status === "confirmed" && tx.type === "recharge") {
      // Add balance
      await db.query(
        "UPDATE users SET balance = balance + ?, recharge_count = recharge_count + 1 WHERE id=?",
        [tx.amount, tx.user_id]
      );

      // Update level from recharge_count
      const [[user]] = await db.query(
        "SELECT recharge_count FROM users WHERE id=?",
        [tx.user_id]
      );

      const rc = user.recharge_count;
      let newLevel = 1;

      if (rc >= 50) newLevel = 5;
      else if (rc >= 30) newLevel = 4;
      else if (rc >= 20) newLevel = 3;
      else if (rc >= 10) newLevel = 2;

      await db.query("UPDATE users SET level=? WHERE id=?", [
        newLevel,
        tx.user_id,
      ]);
    }

    /* ============================
       CONFIRM WITHDRAW
    ============================ */
    if (status === "confirmed" && tx.type === "withdrawal") {
      const [[u]] = await db.query("SELECT balance FROM users WHERE id=?", [
        tx.user_id,
      ]);

      if (u.balance < tx.amount)
        return res.json({
          success: false,
          message: "User does not have enough balance",
        });

      await db.query(
        "UPDATE users SET balance = balance - ? WHERE id=?",
        [tx.amount, tx.user_id]
      );
    }

    // Update transaction status
    await db.query(
      "UPDATE transactions SET status=? WHERE transaction_id=?",
      [status, transaction_id]
    );

    res.json({ success: true, message: "Transaction updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   PROMOTE / DEMOTE ADMIN
===================================================== */
router.post("/user/:id/promote", adminAuth, async (req, res) => {
  try {
    const isAdmin = req.body.isAdmin ? 1 : 0;

    await db.query(
      "UPDATE users SET is_admin=? WHERE id=?",
      [isAdmin, req.params.id]
    );

    res.json({ success: true, message: "Role updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   GET PENDING WITHDRAW REQUESTS
===================================================== */
router.get("/withdraw/pending", adminAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE type='withdrawal' AND status='pending'"
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   APPROVE WITHDRAW
===================================================== */
router.post("/withdraw/approve", adminAuth, async (req, res) => {
  try {
    const { id } = req.body;

    const [[tx]] = await db.query("SELECT * FROM transactions WHERE id=?", [id]);

    if (!tx)
      return res.json({ success: false, message: "Request not found" });

    await db.query(
      "UPDATE users SET balance = balance - ? WHERE id=?",
      [tx.amount, tx.user_id]
    );

    await db.query(
      "UPDATE transactions SET status='confirmed' WHERE id=?",
      [id]
    );

    res.json({ success: true, message: "Withdrawal Approved" });

  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});

/* =====================================================
   REJECT WITHDRAW (Refund)
===================================================== */
router.post("/withdraw/reject", adminAuth, async (req, res) => {
  try {
    const { id } = req.body;

    const [[tx]] = await db.query("SELECT * FROM transactions WHERE id=?", [id]);

    if (!tx)
      return res.json({ success: false, message: "Request not found" });

    await db.query(
      "UPDATE users SET balance = balance + ? WHERE id=?",
      [tx.amount, tx.user_id]
    );

    await db.query(
      "UPDATE transactions SET status='failed' WHERE id=?",
      [id]
    );

    res.json({ success: true, message: "Withdrawal Rejected" });

  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;
