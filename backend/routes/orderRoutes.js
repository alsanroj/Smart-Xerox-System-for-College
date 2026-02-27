const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const pdf = require("pdf-parse");
const path = require("path");
const Order = require("../models/Order");
const generateReceipt = require("../utils/generateReceipt");
const adminAuth = require("../middleware/adminAuth");
const sendReadyMail = require("../utils/sendReadyMail");

/* ======================
   Multer config
====================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ======================
   📤 UPLOAD ORDER
====================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    /* 📄 Detect total pages */
    let totalPages = 0;
    const fileType = req.file.mimetype;

    if (fileType === "application/pdf") {
      const buffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(buffer);
      totalPages = pdfData.numpages;
    } else if (fileType.startsWith("image/")) {
      totalPages = 1;
    } else {
      return res.status(400).json({
        error: "Only PDF or Image files allowed",
      });
    }

    /* 📑 Selected pages logic */
    let selectedPages = Number(req.body.selectedPages);

    if (req.body.fullPrint === "true") {
      selectedPages = totalPages;
    }

    if (!selectedPages || selectedPages <= 0) {
      return res.status(400).json({ error: "Invalid page selection" });
    }

    if (selectedPages > totalPages) {
      return res.status(400).json({
        error: `Selected pages (${selectedPages}) exceed total pages (${totalPages})`,
      });
    }

    /* 💰 Amount calculation (SERVER TRUTH) */
    const copies = Number(req.body.copies);
    const pricePerPage = req.body.xeroxType === "colour" ? 5 : 1;

    if (!copies || copies <= 0) {
      return res.status(400).json({ error: "Invalid copies count" });
    }

    const finalAmount = selectedPages * copies * pricePerPage;

    /* 🧾 Create order */
    const order = await Order.create({
      name: {
        first: req.body.first,
        last: req.body.last,
      },
      email: req.body.email,
      filePath: req.file.path,
      pageRange:
        req.body.fullPrint === "true" ? "Full Document" : req.body.pageRange,
      selectedPages,
      copies,
      xeroxType: req.body.xeroxType,
      fullPrint: req.body.fullPrint === "true",
      amount: finalAmount,
      paymentStatus: "Paid",
      status: "Pending",
    });

    return res.status(201).json({
      message: "Upload successful",
      totalPages,
      order,
    });
  } catch (error) {
    console.error("UPLOAD ERROR 👉", error);
    return res.status(500).json({ error: error.message });
  }
});

/* ======================
   📜 ORDER HISTORY
====================== */
router.get("/history", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔁 UPDATE STATUS (ADMIN)
====================== */
router.put("/status/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = req.body.status;

    // ✅ SEND MAIL ONLY ON READY (ONCE)
    if (req.body.status === "Ready" && !order.mailSent) {
      await sendReadyMail(order);
      order.mailSent = true;
    }

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/student-history/:email", async (req, res) => {
  try {
    const orders = await Order.find({ email: req.params.email }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔍 DETECT PAGES ONLY
====================== */
router.post("/detect-pages", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let totalPages = 0;

    if (req.file.mimetype === "application/pdf") {
      const buffer = fs.readFileSync(req.file.path);
      const pdfData = await pdf(buffer);
      totalPages = pdfData.numpages;
    } else if (req.file.mimetype.startsWith("image/")) {
      totalPages = 1;
    }

    res.json({ totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🧾 DOWNLOAD RECEIPT
====================== */
router.get("/receipt/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    generateReceipt(order, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   🔐 DOWNLOAD ORIGINAL FILE (ADMIN ONLY)
====================== */
router.get("/file/:id", adminAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.sendFile(path.resolve(order.filePath));
});


module.exports = router;
