const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Razorpay Instance Initialize
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// ==========================================
// 1. SCHEMAS & MODELS
// ==========================================

// Admin Earnings Schema & Model
const adminEarningsSchema = new mongoose.Schema({
    userId: String,
    userEmail: String,
    withdrawalAmount: Number,
    commissionAmount: Number,
    finalPayout: Number,
    method: String,
    details: Object, // User ki UPI / Bank details store karne ke liye
    status: { type: String, default: "Pending" },
    timestamp: { type: Date, default: Date.now }
});
const AdminEarning = mongoose.model('AdminEarning', adminEarningsSchema);

// Tournament Schema & Model (Tournament Create & Live karne ke liye)
const tournamentSchema = new mongoose.Schema({
    game: { type: String, required: true },
    mode: { type: String, required: true },
    entry: { type: Number, required: true },
    prize: { type: Number, required: true },
    slots: { type: Number, required: true },
    startTime: { type: String, required: true },
    roomId: { type: String, default: "" },      // Jab tak live na ho, empty rahega
    roomPass: { type: String, default: "" },   // Jab tak live na ho, empty rahega
    registeredUsers: { type: Array, default: [] },
    timestamp: { type: Date, default: Date.now }
});
const Tournament = mongoose.model('Tournament', tournamentSchema);


// ==========================================
// 2. ROUTES
// ==========================================

app.get('/', (req, res) => {
  res.send('Win Arena Backend API is active!');
});


// ---------------- TOURNAMENT APIs ----------------

// Get All Tournaments
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ timestamp: -1 });
        res.json({ success: true, tournaments });
    } catch (err) {
        console.error("Fetch tournaments error:", err);
        res.status(500).json({ success: false, message: "Server error while fetching tournaments" });
    }
});

// Create Tournament API (Admin panel ke totalSlots aur baaki fields ke sath match kiya gaya)
app.post('/api/tournaments', async (req, res) => {
    try {
        const { game, mode, entry, prize, totalSlots, slots, startTime } = req.body;
        
        const newTournament = new Tournament({
            game,
            mode,
            entry,
            prize,
            slots: totalSlots || slots || 10,
            startTime,
            roomId: "",
            roomPass: ""
        });

        await newTournament.save();
        res.status(201).json({ success: true, message: "Tournament created successfully!", tournament: newTournament });
    } catch (err) {
        console.error("Error creating tournament:", err);
        res.status(500).json({ success: false, message: "Server error while creating tournament" });
    }
});

// Update / Publish Room Credentials API (Admin panel ke /api/tournaments/room route ke sath match kiya gaya)
app.post('/api/tournaments/room', async (req, res) => {
    try {
        const { tournamentId, roomId, roomPass } = req.body;
        const updated = await Tournament.findByIdAndUpdate(
            tournamentId,
            { roomId, roomPass },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Tournament not found" });
        }

        res.json({ success: true, message: "Room details published successfully!", updated });
    } catch (err) {
        console.error("Publish room error:", err);
        res.status(500).json({ success: false, message: "Server error while publishing room details" });
    }
});

// Delete Tournament API
app.delete('/api/tournaments/:id', async (req, res) => {
    try {
        const deleted = await Tournament.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Tournament not found" });
        }
        res.json({ success: true, message: "Tournament deleted successfully!" });
    } catch (err) {
        console.error("Delete tournament error:", err);
        res.status(500).json({ success: false, message: "Server error during deletion" });
    }
});


// ---------------- PAYMENT & WITHDRAWAL APIs ----------------

// 1. Create Razorpay Order API
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: "receipt_order_" + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (err) {
        console.error("Razorpay Order Error:", err);
        res.status(500).json({ success: false, message: "Something went wrong while creating order" });
    }
});

// 2. Verify Payment API
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (expectedSign === razorpay_signature) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature!" });
        }
    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 3. Withdrawal API with 2.5% Commission and User Details
app.post('/api/withdraw', async (req, res) => {
    try {
        const { userId, userEmail, amount, method, details } = req.body;
        if (!amount || amount < 10) {
            return res.status(400).json({ success: false, message: "Minimum withdrawal is ₹10" });
        }

        const commission = amount * 0.025;
        const finalPayout = amount - commission;

        const earningRecord = new AdminEarning({
            userId,
            userEmail,
            withdrawalAmount: amount,
            commissionAmount: commission,
            finalPayout,
            method,
            details: details || {}, // User ki bank/UPI details yahan save hongi
            status: "Pending"
        });
        await earningRecord.save();

        res.json({
            success: true,
            message: "Withdrawal processed successfully",
            requestedAmount: amount,
            commissionDeducted: commission,
            payoutToUser: finalPayout
        });
    } catch (err) {
        console.error("Withdrawal error:", err);
        res.status(500).json({ success: false, message: "Server error during withdrawal" });
    }
});

// 4. Admin API to Get All Withdrawal Requests
app.get('/api/admin/withdrawals', async (req, res) => {
    try {
        const withdrawals = await AdminEarning.find().sort({ timestamp: -1 });
        res.json({ success: true, withdrawals });
    } catch (err) {
        console.error("Fetch withdrawals error:", err);
        res.status(500).json({ success: false, message: "Server error while fetching withdrawals" });
    }
});

// 5. Admin API to Approve Withdrawal Request
app.post('/api/admin/approve-withdrawal', async (req, res) => {
    try {
        const { id } = req.body;
        const updated = await AdminEarning.findByIdAndUpdate(
            id, 
            { status: "Approved" }, 
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }
        res.json({ success: true, message: "Withdrawal approved successfully", updated });
    } catch (err) {
        console.error("Approval error:", err);
        res.status(500).json({ success: false, message: "Server error during approval" });
    }
});