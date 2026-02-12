const nodemailer = require("nodemailer");

const sendReadyMail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Smart Xerox" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: `Your Xerox is Ready – Bill #${order.billNumber}`,
    html: `
      <h2>✅ Xerox Ready</h2>
      <p>Hello <b>${order.name.first}</b>,</p>

      <p>Your xerox order is ready for pickup.</p>

      <hr/>

      <p><b>Bill Number:</b> ${order.billNumber}</p>
      <p><b>Pages:</b> ${order.selectedPages}</p>
      <p><b>Copies:</b> ${order.copies}</p>
      <p><b>Amount Paid:</b> ₹${order.amount}</p>

      <br/>
      <p>Thank you for using <b>Smart Xerox</b> 🖨️</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendReadyMail;
