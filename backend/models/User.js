// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  balance: { type: Number, default: 371.00 },
  history: [
    {
      type: { type: String }, // e.g., "Deposit via Razorpay", "Withdrawal via UPI"
      amount: Number,
      txnId: String,
      gatewayId: String,
      status: { type: String, default: "Success" },
      time: { type: String, default: () => new Date().toLocaleString() }
    }
  ]
});

module.exports = mongoose.model('User', userSchema);