const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports = async function adminAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // check user is admin
    db.query(
      `SELECT * FROM users WHERE id = ?`,
      [decoded.id],
      (err, result) => {
        if (err || result.length === 0) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid Admin" });
        }

        if (result[0].is_admin !== 1) {
          return res
            .status(403)
            .json({ success: false, message: "Access Denied" });
        }

        req.admin = result[0];
        next();
      }
    );
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
