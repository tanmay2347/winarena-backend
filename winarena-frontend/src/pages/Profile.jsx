import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaGamepad, FaPercent, FaWallet, FaUserEdit, FaTelegramPlane, FaShieldAlt, FaGift, FaHistory, FaHeadset, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';

export default function Profile() {
    const navigate = useNavigate();
    const [stats] = useState({
        totalWins: 0,
        totalGames: 0,
        winRate: "0%",
        totalBalance: 11961.00
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={{ background: '#0b0f19', color: '#fff', minHeight: '100vh', padding: '15px 15px 80px 15px', fontFamily: 'sans-serif' }}>
            
            {/* Top 4 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaTrophy color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Wins</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.totalWins}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaGamepad color="#38bdf8" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Games</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.totalGames}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaPercent color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Win Rate</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{stats.winRate}</div>
                </div>
                <div style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 5px', textAlign: 'center' }}>
                    <FaWallet color="#facc15" size={18} style={{ marginBottom: '5px' }} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Total Balance</div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>₹{stats.totalBalance.toFixed(2)}</div>
                </div>
            </div>

            {/* Menu Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Edit Profile */}
                <div onClick={() => navigate('/edit-profile')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaUserEdit color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Edit Profile</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Update your name, email, mobile number</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* Telegram Account */}
                <div onClick={() => navigate('/telegram')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaTelegramPlane color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Telegram Account</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Link your Telegram for updates & room IDs</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* Account Security */}
                <div onClick={() => navigate('/security')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaShieldAlt color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Account Security</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Change password, 2FA, linked accounts</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* My Rewards */}
                <div onClick={() => navigate('/rewards')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaGift color="#ef4444" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>My Rewards</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>View your bonuses & cashback</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* Transaction History */}
                <div onClick={() => navigate('/history')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaHistory color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Transaction History</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>View deposits, withdrawals & game history</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* Help & Support */}
                <div onClick={() => navigate('/ai-support')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaHeadset color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>Help & Support</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>FAQs, contact us, raise a ticket</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* About WinArena */}
                <div onClick={() => navigate('/about')} style={{ background: '#131c31', border: '1px solid #1f2937', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaInfoCircle color="#38bdf8" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>About WinArena</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Terms, Privacy, Responsible Gaming</div>
                        </div>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>›</span>
                </div>

                {/* Log Out */}
                <div onClick={handleLogout} style={{ background: '#1a131b', border: '1px solid #451a1a', borderRadius: '14px', padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginTop: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaSignOutAlt color="#ef4444" size={22} />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#ef4444' }}>Log Out</div>
                        </div>
                    </div>
                    <span style={{ color: '#ef4444', fontSize: '18px' }}>›</span>
                </div>

            </div>
        </div>
    );
}