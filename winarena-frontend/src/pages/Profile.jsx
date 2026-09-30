import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaGamepad, FaPercent, FaWallet, FaUserEdit, FaTelegramPlane, FaShieldAlt, FaGift, FaHistory, FaHeadset, FaInfoCircle, FaSignOutAlt, FaCopy } from 'react-icons/fa';

export default function Profile() {
    const navigate = useNavigate();
    const [stats] = useState({
        name: "Paras",
        playerId: "WA912815",
        telegramLinked: false,
        level: 0,
        xpCurrent: 0,
        xpMax: 50,
        totalWins: 0,
        totalGames: 0,
        winRate: "0%",
        totalBalance: 11961.00
    });
    const [copied, setCopied] = useState(false);

    const handleCopyId = () => {
        navigator.clipboard.writeText(stats.playerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/'); // Agar login page par jana ho logout par, tabhi yahan aayega
    };

    return (
        <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '15px 15px 90px 15px', fontFamily: 'sans-serif' }}>
            
            {/* Top Header Balance & Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '20px', fontWeight: 'bold' }}>
                    <span style={{ background: '#1e293b', padding: '6px', borderRadius: '8px', display: 'flex' }}>👤</span> My Profile
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', padding: '8px 15px', borderRadius: '20px', color: '#facc15', fontWeight: 'bold', fontSize: '15px' }}>
                    ₹{stats.totalBalance.toFixed(2)}
                </div>
            </div>

            {/* Profile User Info Card */}
            <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '18px', padding: '20px', marginBottom: '20px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ width: '65px', height: '65px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', border: '2px solid #facc15' }}>
                        👦
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {stats.name} <span style={{ fontSize: '14px' }}>✏️</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Player ID: {stats.playerId} 
                            <span onClick={handleCopyId} style={{ cursor: 'pointer', color: '#38bdf8' }}>📋</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', cursor: 'pointer' }} onClick={() => navigate('/telegram')}>
                            Telegram: Not Linked (Click to link)
                        </div>
                    </div>
                </div>

                {copied && <div style={{ fontSize: '11px', color: '#22c55e', marginBottom: '8px' }}>Player ID copied to clipboard!</div>}

                {/* Level Progress Bar */}
                <div style={{ background: '#1a233a', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#7c3aed', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>👑 Level {stats.level}</span>
                    <div style={{ flex: 1, margin: '0 15px', background: '#334155', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${(stats.xpCurrent / stats.xpMax) * 100}%`, background: '#facc15', height: '100%' }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{stats.xpCurrent} / {stats.xpMax}</span>
                </div>
            </div>

            {/* Top 4 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaTrophy color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Wins</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.totalWins}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaGamepad color="#38bdf8" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Games</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.totalGames}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaPercent color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Win Rate</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.winRate}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaWallet color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Balance</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>₹{stats.totalBalance.toFixed(2)}</div>
                </div>
            </div>

            {/* Menu Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div onClick={() => navigate('/edit-profile')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaUserEdit color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Edit Profile</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Update your name, email, mobile number</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => navigate('/telegram')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaTelegramPlane color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Telegram Account</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Link your Telegram for updates & room IDs</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => navigate('/security')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaShieldAlt color="#38bdf8" size={20} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>Account Security</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Change password, 2FA, linked accounts</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                <div onClick={() => navigate('/rewards')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
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

                <div onClick={() => navigate('/about')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
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
        </div>
    );
}