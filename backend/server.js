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

const userSchema = new mongoose.Schema({
    name: { type: String, default: "Arena Player" },
    email: { type: String, unique: true },
    mobile: { type: String, default: "" },
    walletBalance: { type: Number, default: 0.00 },
    timestamp: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const adminEarningsSchema = new mongoose.Schema({
    userId: String,
    userEmail: String,
    withdrawalAmount: Number,
    commissionAmount: Number,
    finalPayout: Number,
    method: String,
    details: Object,
    status: { type: String, default: "Pending" },
    timestamp: { type: Date, default: Date.now }
});
const AdminEarning = mongoose.model('AdminEarning', adminEarningsSchema);

const tournamentSchema = new mongoose.Schema({
    game: { type: String, required: true },
    mode: { type: String, required: true },
    entry: { type: Number, required: true },
    prize: { type: Number, required: true },
    slots: { type: Number, required: true },
    startTime: { type: String, required: true },
    roomId: { type: String, default: "" },
    roomPass: { type: String, default: "" },
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

// User Balance Get API
app.get('/api/user/balance', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: "Email required" });
        
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email, walletBalance: 0.00 });
            await user.save();
        }
        res.json({ success: true, balance: user.walletBalance });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching balance" });
    }
});

// User Search / Verify API
app.get('/api/user/search', async (req, res) => {
    try {
        const { mobile } = req.query;
        if (!mobile) return res.status(400).json({ success: false, message: "Mobile number required" });

        const user = await User.findOne({ mobile: mobile.trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found with this mobile number!" });
        }

        res.json({
            success: true,
            user: {
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                balance: user.walletBalance
            }
        });
    } catch (err) {
        console.error("Search user error:", err);
        res.status(500).json({ success: false, message: "Server error during user search" });
    }
});

// User Register / Sync API
app.post('/api/user/register', async (req, res) => {
    try {
        const { name, email, mobile } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: name || "Arena Player",
                email: email,
                mobile: mobile || "",
                walletBalance: 0.00
            });
            await user.save();
        } else {
            if (name) user.name = name;
            if (mobile) user.mobile = mobile;
            await user.save();
        }

        res.json({ success: true, message: "User synced successfully", balance: user.walletBalance });
    } catch (err) {
        console.error("User registration sync error:", err);
        res.status(500).json({ success: false, message: "Server error during user sync" });
    }
});

// Dedicated Add Money / Deposit API Route
app.post('/api/wallet/add', async (req, res) => {
    try {
        const { email, amount } = req.body;
        const addAmount = parseFloat(amount);

        if (!addAmount || addAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount!" });
        }

        let user = await User.findOne({ email: email || "user@winarena.com" });
        if (!user) {
            user = new User({
                email: email || "user@winarena.com",
                walletBalance: 0.00
            });
        }

        user.walletBalance = parseFloat((user.walletBalance + addAmount).toFixed(2));
        await user.save();

        res.json({ 
            success: true, 
            message: "Money added successfully!", 
            newBalance: user.walletBalance 
        });
    } catch (err) {
        console.error("Add money error:", err);
        res.status(500).json({ success: false, message: "Server error during deposit" });
    }
});

// Dedicated Deduct / Spend Money API
app.post('/api/wallet/deduct', async (req, res) => {
    try {
        const { email, amount } = req.body;
        const deductAmount = parseFloat(amount);

        if (!deductAmount || deductAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid amount!" });
        }

        let user = await User.findOne({ email: email || "user@winarena.com" });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        if (user.walletBalance < deductAmount) {
            return res.status(400).json({ success: false, message: "Insufficient balance!" });
        }

        user.walletBalance = parseFloat((user.walletBalance - deductAmount).toFixed(2));
        await user.save();

        res.json({ 
            success: true, 
            message: "Amount deducted successfully!", 
            newBalance: user.walletBalance 
        });
    } catch (err) {
        console.error("Deduct money error:", err);
        res.status(500).json({ success: false, message: "Server error during deduction" });
    }
});


// ---------------- TOURNAMENT APIs ----------------

app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ timestamp: -1 });
        res.json({ success: true, tournaments });
    } catch (err) {
        console.error("Fetch tournaments error:", err);
        res.status(500).json({ success: false, message: "Server error while fetching tournaments" });
    }
});

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

// 🟢 Tournament Join API (Game ID aur Username ke sath)
app.post('/api/tournaments/join', async (req, res) => {
    try {
        const { tournamentId, userEmail, userName, gameId, gameUsername } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: "Tournament not found!" });
        }

        const alreadyJoined = tournament.registeredUsers.some(u => u.email === userEmail);
        if (alreadyJoined) {
            return res.status(400).json({ success: false, message: "You have already joined this tournament!" });
        }

        if (tournament.registeredUsers.length >= tournament.slots) {
            return res.status(400).json({ success: false, message: "Tournament is full!" });
        }

        tournament.registeredUsers.push({
            email: userEmail,
            name: userName || "Player",
            gameId: gameId || "",
            gameUsername: gameUsername || "",
            timestamp: new Date()
        });

        await tournament.save();
        res.json({ success: true, message: "Tournament joined successfully!", tournament });
    } catch (err) {
        console.error("Join tournament error:", err);
        res.status(500).json({ success: false, message: "Server error while joining tournament" });
    }
});

// 🟢 Admin Pay Winner API (Admin panel se winner ke wallet me prize add karne ke liye)
app.post('/api/admin/pay-winner', async (req, res) => {
    try {
        const { userEmail, prizeAmount } = req.body;
        const winAmount = parseFloat(prizeAmount);

        if (!winAmount || winAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid prize amount!" });
        }

        let user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        user.walletBalance = parseFloat((user.walletBalance + winAmount).toFixed(2));
        await user.save();

        res.json({
            success: true,
            message: `Successfully added ₹${winAmount} to ${user.name}'s wallet!`,
            newBalance: user.walletBalance
        });
    } catch (err) {
        console.error("Pay winner error:", err);
        res.status(500).json({ success: false, message: "Server error while paying winner" });
    }
});


// P2P Wallet Transfer API
app.post('/api/transfer', async (req, res) => {
    try {
        const { senderEmail, recipientMobile, amount } = req.body;
        const trAmount = parseFloat(amount);
        
        if (!trAmount || trAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid transfer amount!" });
        }

        const validSenderEmail = senderEmail || "user@winarena.com";
        const cleanRecipientMobile = (recipientMobile || "").trim();

        let sender = await User.findOne({ email: validSenderEmail });
        if (!sender) {
            sender = new User({
                name: validSenderEmail.split('@')[0],
                email: validSenderEmail,
                mobile: "8857824607",
                walletBalance: 100.00
            });
            await sender.save();
        }

        let recipient = await User.findOne({ mobile: cleanRecipientMobile });
        if (!recipient) {
            recipient = new User({
                name: `User_${cleanRecipientMobile.slice(-4) || "Player"}`,
                email: `${cleanRecipientMobile || Date.now()}@winarena.com`,
                mobile: cleanRecipientMobile,
                walletBalance: 0.00
            });
            await recipient.save();
        }

        if (sender.mobile && cleanRecipientMobile && sender.mobile === cleanRecipientMobile) {
            return res.status(400).json({ success: false, message: "Cannot transfer money to your own account!" });
        }

        if (sender.walletBalance < trAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient wallet balance! Your balance is ₹${sender.walletBalance.toFixed(2)}` 
            });
        }

        sender.walletBalance = parseFloat((sender.walletBalance - trAmount).toFixed(2));
        recipient.walletBalance = parseFloat((recipient.walletBalance + trAmount).toFixed(2));

        await sender.save();
        await recipient.save();

        res.json({ 
            success: true, 
            message: "Transfer successful!", 
            senderNewBalance: sender.walletBalance,
            recipientNewBalance: recipient.walletBalance 
        });
    } catch (err) {
        console.error("P2P Transfer error:", err);
        res.status(500).json({ success: false, message: "Server error during P2P transfer: " + err.message });
    }
});

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
        res.status(500).json({ status: false, message: "Server error" });
    }
});