const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.json({
      success: true,
      token,
    });
  }

  res.status(401).json({ error: "Invalid admin credentials" });
});

module.exports = router;
