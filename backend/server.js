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
    walletBalance: { type: Number, default: 0.00 }, // 🟢 Default 0 balance
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

// User Balance Get API (Taaki frontend directly accurate balance fetch kar sake)
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

// 🟢 User Register / Sync API (Naye user ko database mein 0 balance ke sath save karne ke liye)
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
                walletBalance: 0.00 // Naye user ka balance hamesha 0.00 rahega
            });
            await user.save();
        }

        res.json({ success: true, message: "User synced successfully", balance: user.walletBalance });
    } catch (err) {
        console.error("User registration sync error:", err);
        res.status(500).json({ success: false, message: "Server error during user sync" });
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


// ---------------- P2P WALLET TRANSFER API (Fully Fixed, 0 Default, No Duplicate Crashes) ----------------
app.post('/api/transfer', async (req, res) => {
    try {
        const { senderEmail, recipientMobile, amount } = req.body;
        const trAmount = parseFloat(amount);
        
        if (!trAmount || trAmount <= 0) {
            return res.status(400).json({ success: false, message: "Invalid transfer amount!" });
        }

        const validSenderEmail = senderEmail || "user@winarena.com";
        const cleanRecipientMobile = (recipientMobile || "").trim();

        // 1. Sender dhoondein
        let sender = await User.findOne({ email: validSenderEmail });
        if (!sender) {
            sender = new User({
                name: validSenderEmail.split('@')[0],
                email: validSenderEmail,
                mobile: "8857824607",
                walletBalance: 100.00 // Naye sender ko initial balance testing ke liye
            });
            await sender.save();
        }

        // 2. Recipient dhoondein (Default 0.00 - Never 500!)
        let recipient = await User.findOne({ mobile: cleanRecipientMobile });
        if (!recipient) {
            recipient = new User({
                name: `User_${cleanRecipientMobile.slice(-4) || "Player"}`,
                email: `${cleanRecipientMobile || Date.now()}@winarena.com`,
                mobile: cleanRecipientMobile,
                walletBalance: 0.00 // 🟢 Fixed: Naye user ko 0 balance milega!
            });
            await recipient.save();
        }

        // Khud ko transfer rokna
        if (sender.mobile && cleanRecipientMobile && sender.mobile === cleanRecipientMobile) {
            return res.status(400).json({ success: false, message: "Cannot transfer money to your own account!" });
        }

        // Balance check
        if (sender.walletBalance < trAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient wallet balance! Your balance is ₹${sender.walletBalance.toFixed(2)}` 
            });
        }

        // 3. Sender se minus aur Recipient mein exact transfer amount add
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


// ---------------- PAYMENT & WITHDRAWAL APIs ----------------

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
        res.status(500).json({ success: false, message: "Server error" });
    }
});

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
            details: details || {},
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

app.get('/api/admin/withdrawals', async (req, res) => {
    try {
        const withdrawals = await AdminEarning.find().sort({ timestamp: -1 });
        res.json({ success: true, withdrawals });
    } catch (err) {
        console.error("Fetch withdrawals error:", err);
        res.status(500).json({ success: false, message: "Server error while fetching withdrawals" });
    }
});

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