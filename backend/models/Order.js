const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    name: {
      first: String,
      last: String,
    },

    email: {
      type: String,
      required: true,
    },

    filePath: String,

    pageRange: String,

    selectedPages: {
      type: Number,
      required: true,
    },

    copies: Number,

    xeroxType: String,

    fullPrint: Boolean,

    amount: Number,

    paymentStatus: {
      type: String,
      default: "Paid",
    },

    billNumber: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      default: "Pending",
    },
    mailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

/* =========================
   🧾 Auto Bill Number
========================= */
orderSchema.pre("save", function () {
  if (!this.billNumber) {
    this.billNumber = `BILL-${Date.now()}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
