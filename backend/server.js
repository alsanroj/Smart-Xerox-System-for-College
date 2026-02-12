const express = require("express");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const cors = require("cors");
require("dotenv").config();
const adminRoutes = require("./routes/adminRoutes");




const app = express(); // 👈 app FIRST

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/admin", adminRoutes);

app.use("/api/orders", orderRoutes);

// 🔥 Error handler MUST be after routes
app.use((err, req, res, next) => {
  console.log("SERVER ERROR 👉", err);
  res.status(500).json({ error: err.message });
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});
