import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaGamepad, FaPercent, FaWallet, FaUserEdit, FaTelegramPlane, FaShieldAlt, FaGift, FaHistory, FaHeadset, FaInfoCircle, FaSignOutAlt, FaTimes } from 'react-icons/fa';

export default function Profile() {
    const navigate = useNavigate();
    
    // User data state (localStorage ya default values)
    const [user, setUser] = useState({
        name: localStorage.getItem('userName') || "Paras",
        email: localStorage.getItem('userEmail') || "paras@gmail.com",
        mobile: localStorage.getItem('userMobile') || "+91 9876543210",
        playerId: "WA912815",
        telegramLinked: false,
        telegramUsername: "",
        level: 0,
        xpCurrent: 0,
        xpMax: 50,
        totalWins: 0,
        totalGames: 0,
        winRate: "0%",
        walletBalance: parseFloat(localStorage.getItem('walletBalance')) || 0.00
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [tempName, setTempName] = useState(user.name);
    const [tempEmail, setTempEmail] = useState(user.email);
    const [tempMobile, setTempMobile] = useState(user.mobile);
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.playerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setUser(prev => ({ ...prev, name: tempName, email: tempEmail, mobile: tempMobile }));
        localStorage.setItem('userName', tempName);
        localStorage.setItem('userEmail', tempEmail);
        localStorage.setItem('userMobile', tempMobile);
        setIsEditModalOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '15px 15px 90px 15px', fontFamily: 'sans-serif', position: 'relative' }}>
            
            {/* Top Header Balance & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '20px', fontWeight: 'bold' }}>
                    <span>👤</span> My Profile
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', padding: '8px 15px', borderRadius: '20px', color: '#facc15', fontWeight: 'bold', fontSize: '15px' }}>
                    ₹{user.walletBalance.toFixed(2)}
                </div>
            </div>

            {/* Profile User Info Card */}
            <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '18px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ width: '65px', height: '65px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', border: '2px solid #facc15' }}>
                        👦
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {user.name} <span style={{ fontSize: '14px', cursor: 'pointer' }} onClick={() => setIsEditModalOpen(true)}>✏️</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Player ID: {user.playerId} 
                            <span onClick={handleCopyId} style={{ cursor: 'pointer', color: '#38bdf8' }}>📋</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', cursor: 'pointer' }} onClick={() => alert("Telegram link feature coming soon!")}>
                            {user.telegramLinked ? `Telegram: ${user.telegramUsername}` : "Telegram: Not Linked (Click to link)"}
                        </div>
                    </div>
                </div>

                {copied && <div style={{ fontSize: '11px', color: '#22c55e', marginBottom: '8px' }}>Player ID copied!</div>}

                {/* Level Progress Bar */}
                <div style={{ background: '#1a233a', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>👑 Level {user.level}</span>
                    <div style={{ flex: 1, margin: '0 15px', background: '#334155', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(user.xpCurrent / user.xpMax) * 100}%`, background: '#facc15', height: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.xpCurrent} / {user.xpMax}</span>
                </div>
            </div>

            {/* Top 4 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaTrophy color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Wins</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{user.totalWins}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaGamepad color="#38bdf8" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Games</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{user.totalGames}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaPercent color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Win Rate</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{user.winRate}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaWallet color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Balance</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>₹{user.walletBalance.toFixed(2)}</div>
                </div>
            </div>

            {/* Menu Options List with Real Functions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Edit Profile Button */}
                <div onClick={() => setIsEditModalOpen(true)} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaUserEdit color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Edit Profile</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Update your name, email, mobile number</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => alert("Telegram linking feature")} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaTelegramPlane color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Telegram Account</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Link your Telegram for updates & room IDs</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => alert("Security settings modal")} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaShieldAlt color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Account Security</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Change password, 2FA, linked accounts</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => alert("No rewards available yet!")} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaGift color="#ef4444" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>My Rewards</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>View your bonuses & cashback</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => navigate('/history')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaHistory color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Transaction History</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>View deposits, withdrawals & game history</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => navigate('/ai-support')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaHeadset color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Help & Support</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>FAQs, contact us, raise a ticket</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => alert("WinArena v1.0.0 - All rights reserved.")} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaInfoCircle color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>About WinArena</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Terms, Privacy, Responsible Gaming</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={handleLogout} style={{ background: '#1a131b', border: '1px solid #451a1a', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaSignOutAlt color="#ef4444" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#ef4444' }}>Log Out</div>
                        </div>
                    </div>
                    <span style={{ color: '#ef4444', fontSize: '18px' }}>›</span>
                </div>

            </div>

            {/* Edit Profile Modal Popup */}
            {isEditModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
                    <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '16px', padding: '25px', width: '100%', maxWidth: '400px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#38bdf8' }}>Edit Profile</h3>
                            <FaTimes color="#94a3b8" size={20} style={{ cursor: 'pointer' }} onClick={() => setIsEditModalOpen(false)} />
                        </div>
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Name</label>
                                <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px', borderRadius: '8px' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Email</label>
                                <input type="email" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px', borderRadius: '8px' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>Mobile Number</label>
                                <input type="text" value={tempMobile} onChange={(e) => setTempMobile(e.target.value)} style={{ width: '100%', background: '#1f2937', border: '1px solid #374151', color: '#fff', padding: '10px', borderRadius: '8px' }} required />
                            </div>
                            <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}