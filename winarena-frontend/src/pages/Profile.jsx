import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "Arena Player",
        email: "user@winarena.com",
        mobile: "Not Available",
        walletBalance: 0.00
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const storedEmail = localStorage.getItem('userEmail') || "user@winarena.com";
            // Backend se user balance / details fetch karna
            const response = await axios.get(`https://winarena-backend-1.onrender.com/api/user/balance?email=${storedEmail}`);
            if (response.data.success) {
                setUser(prev => ({
                    ...prev,
                    email: storedEmail,
                    walletBalance: response.data.balance
                }));
            }
        } catch (err) {
            console.error("Error fetching profile details:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#0f172a', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ background: '#1e1b4b', border: '1px solid #3b82f6', color: '#fff', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer' }}
                >
                    ← Back
                </button>
                <h2 style={{ flex: 1, textAlign: 'center', margin: 0, color: '#38bdf8' }}>My Profile</h2>
            </div>

            {/* Profile Card */}
            <div style={{ background: '#1e1b4b', border: '1px solid #3b82f6', borderRadius: '15px', padding: '25px', maxWidth: '400px', margin: '0 auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', margin: '0 auto 10px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 style={{ margin: '5px 0', color: '#f8fafc' }}>{user.name}</h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{user.email}</p>
                </div>

                <div style={{ borderTop: '1px solid #334155', paddingTop: '15px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#94a3b8' }}>Mobile:</span>
                        <span style={{ fontWeight: 'bold' }}>{user.mobile}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#94a3b8' }}>Wallet Balance:</span>
                        <span style={{ fontWeight: 'bold', color: '#22c55e' }}>₹{user.walletBalance.toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        localStorage.clear();
                        navigate('/');
                    }}
                    style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}