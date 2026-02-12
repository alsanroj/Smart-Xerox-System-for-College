const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  // 1️⃣ Get token from header OR query (for window.open)
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Check admin role
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // 4️⃣ Attach admin info (optional but good)
    req.admin = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = adminAuth;
