const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    mobile: { type: String, default: "" }, // 🟢 Mobile field add kiya gaya P2P ke liye
    walletBalance: { type: Number, default: 371.00 }, // 🟢 balance ki jagah walletBalance taaki server.js match kare
    history: [
        {
            type: { type: String },
            amount: Number,
            txnId: String,
            gatewayId: String,
            status: { type: String, default: "Success" },
            time: { type: String, default: () => new Date().toLocaleString() }
        }
    ]
});

module.exports = mongoose.model('User', userSchema);