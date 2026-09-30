import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaUserEdit, FaHeadset, FaSignOutAlt, FaWallet, FaBell, FaGift, FaCopy, FaUser } from 'react-icons/fa';

export default function AdvancedProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Tanmay D",
        email: "tanmay@gmail.com", // Aapke screenshot wala email
        mobile: "+91 9876543210",
        walletBalance: 332.00, // Aapke screenshot wala balance
        referralCode: "WA-TANMAY8563",
    });
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [notifications, setNotifications] = useState(3);

    useEffect(() => {
        // fetchUserProfile(); // Real backend se fetch karne ke liye uncomment karein
    }, []);

    const fetchUserProfile = async () => {
        try {
            const storedEmail = localStorage.getItem('userEmail') || "tanmay@gmail.com";
            const response = await axios.get(`https://winarena-backend-1.onrender.com/api/user/profile?email=${storedEmail}`);
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (err) {
            console.error("Error fetching profile details:", err);
        }
    };

    const handleCopyReferral = () => {
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={{ background: '#080b12', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}
                >
                    ← Back
                </button>
                <h2 style={{ flex: 1, textAlign: 'center', margin: 0, color: '#38bdf8', fontWeight: 'bold', fontSize: '24px' }}>My Profile</h2>
                <div style={{ position: 'absolute', right: 0, cursor: 'pointer', color: '#94a3b8' }}>
                    <FaBell size={24} />
                    {notifications > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{notifications}</span>}
                </div>
            </div>

            {/* Profile Card */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '30px', maxWidth: '500px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: '#fff', boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ margin: '10px 0 5px 0', color: '#f9fafb', fontSize: '28px', fontWeight: '700' }}>{user.name}</h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>{user.email}</p>
                <p style={{ margin: '8px 0 0 0', color: '#d1d5db', fontSize: '16px', fontWeight: '500' }}>{user.mobile}</p>
            
                {/* Wallet Card Inside Profile */}
                <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '15px', padding: '20px', marginTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaWallet size={24} color="#38bdf8" />
                        <div>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>Wallet Balance</p>
                            <p style={{ margin: '5px 0 0 0', color: '#22c55e', fontSize: '24px', fontWeight: 'bold' }}>₹{user.walletBalance.toFixed(2)}</p>
                        </div>
                    </div>
                    <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Add Cash</button>
                </div>
            </div>

            {/* Action Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/edit-profile" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <FaUserEdit size={24} color="#38bdf8" />
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>Edit Profile</span>
                </Link>
                <Link to="/history" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <FaHistory size={24} color="#eab308" />
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>Transaction History</span>
                </Link>
                <Link to="/ai-support" style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <FaHeadset size={24} color="#22c55e" />
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>AI Game Support</span>
                </Link>
                <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '15px', padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <FaGift size={24} color="#ec4899" />
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '16px', color: '#94a3b8' }}>Referral Code</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f9fafb' }}>{user.referralCode}</span>
                            <button onClick={handleCopyReferral} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                <FaCopy size={18} />
                            </button>
                        </div>
                        {copied && <span style={{ color: '#22c55e', fontSize: '12px' }}>Copied!</span>}
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                style={{ width: '100%', maxWidth: '300px', margin: '40px auto 0 auto', display: 'block', background: '#ef4444', color: '#fff', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)' }}
            >
                <FaSignOutAlt style={{ marginRight: '10px' }} />
                Logout
            </button>
        </div>
    );
}