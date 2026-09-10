import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

export default function ArenaWallet() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [userArenaInfo, setUserArenaInfo] = useState(null);
  
  // Modals States
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Live Camera Scanner Modal State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanTargetUser, setScanTargetUser] = useState(null);
  const [scanAmount, setScanAmount] = useState("");
  const videoRef = useRef(null);

  // Add/Withdraw Form Modal State
  const [actionType, setActionType] = useState(null); // "add" or "withdraw"
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ accNo: "", ifsc: "", name: "" });
  const [paytmNumber, setPaytmNumber] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (!isLoggedIn && !isAdmin) {
      alert("Please login first!");
      navigate("/login");
      return;
    }

    const savedBalance = localStorage.getItem("walletBalance");
    if (savedBalance) {
      setBalance(parseFloat(savedBalance));
    } else {
      localStorage.setItem("walletBalance", "0.00");
      setBalance(0.00);
    }

    const savedArena = localStorage.getItem("arenaWalletAccount");
    if (savedArena) {
      setUserArenaInfo(JSON.parse(savedArena));
    } else {
      setUserArenaInfo({ mobile: "8857824607", qrCodeText: "WINARENA-P2P-WALLET", email: "user@winarena.com" });
    }

    // 🟢 Clean history for new users (Removed hardcoded dummy data)
    const savedHistory = JSON.parse(localStorage.getItem("walletHistory")) || [];
    setHistory(savedHistory);
  }, [navigate]);

  // Camera Stream Effect when Scanner Modal is Open
  useEffect(() => {
    let currentStream = null;
    if (showScannerModal && !scanTargetUser) {
      setCameraError(false);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          currentStream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch((e) => console.log("Play error:", e));
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setCameraError(true);
        });
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showScannerModal, scanTargetUser]);

  const handleSimulateDetectedQR = () => {
    const detectedUser = {
      name: "Rahul_Esports",
      mobile: "9876543210",
      upiId: "rahul@winarena"
    };
    setScanTargetUser(detectedUser);
  };

  const handleExecuteScanTransfer = (e) => {
    e.preventDefault();
    const trAmt = parseFloat(scanAmount);
    if (!trAmt || trAmt <= 0) {
      alert("Please enter valid amount to transfer!");
      return;
    }
    if (trAmt > balance) {
      alert("Insufficient balance!");
      return;
    }

    const newBalance = balance - trAmt;
    setBalance(newBalance);
    localStorage.setItem("walletBalance", newBalance.toFixed(2));

    const uniqueTxnId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
    const currentDateTime = new Date().toLocaleString();

    const historyItem = { 
      type: `Paid to ${scanTargetUser.name}`, 
      amount: -trAmt, 
      time: currentDateTime, 
      txnId: uniqueTxnId,
      recipientMobile: scanTargetUser.mobile,
      status: "Success" 
    };

    const updatedHistory = [historyItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("walletHistory", JSON.stringify(updatedHistory));

    alert(`Successfully transferred ₹${trAmt} to ${scanTargetUser.name}!\nTxn ID: ${uniqueTxnId} ⚡`);
    setShowScannerModal(false);
    setScanTargetUser(null);
    setScanAmount("");
  };

  const handleAddMoney = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    const newBalance = balance + amt;
    setBalance(newBalance);
    localStorage.setItem("walletBalance", newBalance.toFixed(2));

    const uniqueTxnId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newHistoryItem = { 
      type: "Deposit via Arena Wallet", 
      amount: amt, 
      time: new Date().toLocaleString(), 
      txnId: uniqueTxnId,
      status: "Success" 
    };

    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("walletHistory", JSON.stringify(updatedHistory));

    setAmount("");
    setActionType(null);
    alert(`Successfully added ₹${amt}!\nTxn ID: ${uniqueTxnId}`);
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);

    if (!amt || amt <= 0) {
      alert("Please enter a valid amount!");
      return;
    }
    if (amt > balance) {
      alert("Insufficient wallet balance!");
      return;
    }

    const newBalance = balance - amt;
    setBalance(newBalance);
    localStorage.setItem("walletBalance", newBalance.toFixed(2));

    const uniqueTxnId = `TXN${Math.floor(100000000 + Math.random() * 900000000)}`;
    const newHistoryItem = { 
      type: `Withdrawal via ${withdrawMethod}`, 
      amount: -amt, 
      time: new Date().toLocaleString(), 
      txnId: uniqueTxnId,
      status: "Success" 
    };

    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem("walletHistory", JSON.stringify(updatedHistory));

    setAmount("");
    setActionType(null);
    alert(`Withdrawal Successful via ${withdrawMethod}!\nTxn ID: ${uniqueTxnId}`);
  };

  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase();
    const typeMatch = item.type?.toLowerCase().includes(query);
    const txnMatch = item.txnId?.toLowerCase().includes(query);
    return typeMatch || txnMatch;
  });

  return (
    <div style={{ padding: "16px", color: "#fff", background: "#0f172a", minHeight: "100vh", paddingBottom: "110px", maxWidth: "600px", margin: "0 auto", boxSizing: "border-box" }}>
      
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div 
            onClick={() => setShowQrModal(true)}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              background: "rgba(124, 58, 237, 0.2)", 
              border: "1px solid #fbbf24", 
              padding: "4px 10px 4px 4px", 
              borderRadius: "24px", 
              cursor: "pointer" 
            }}
            title="Click to view QR"
          >
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#7c3aed", display: "grid", placeItems: "center", fontSize: "15px", color: "#fff" }}>
              🔲
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "900", lineHeight: "1" }}>Show QR</span>
              <span style={{ fontSize: "8px", color: "#9ca3af" }}>Receive</span>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: "16px", color: "#fbbf24", margin: 0, fontWeight: "900" }}>Win Arena Wallet</h1>
            <span style={{ fontSize: "10px", color: "#9ca3af" }}>Balance: ₹{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* WIN ARENA DIGITAL WALLET BANNER */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)", borderRadius: "16px", border: "1px solid rgba(251,191,36,0.3)", padding: "24px 20px", marginBottom: "20px", textAlign: "center" }}>
        <span style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "800", letterSpacing: "1px", display: "block", marginBottom: "4px" }}>WIN ARENA DIGITAL WALLET</span>
        <h2 style={{ fontSize: "36px", color: "#fff", margin: "0 0 4px 0", fontWeight: "900" }}>₹{balance.toFixed(2)}</h2>
        <p style={{ fontSize: "11px", color: "#cbd5e1", margin: "0 0 16px 0" }}>Fast, secure P2P transfers & tournament payouts</p>
        
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button 
            onClick={() => { setActionType("add"); setAmount(""); }}
            style={{ background: "#fbbf24", color: "#000", border: "none", padding: "10px 22px", borderRadius: "10px", fontWeight: "900", fontSize: "12px", cursor: "pointer" }}
          >
            + Add Money
          </button>
          <button 
            onClick={() => { setActionType("withdraw"); setAmount(""); }}
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", padding: "10px 22px", borderRadius: "10px", fontWeight: "900", fontSize: "12px", cursor: "pointer" }}
          >
            ↗ Withdraw
          </button>
        </div>
      </div>

      {/* TRANSACTION HISTORY SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "14px", color: "#fbbf24", margin: 0, fontWeight: "900" }}>📜 Transaction History {searchQuery && `(Filtered)`}</h3>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "10px", fontWeight: "800", cursor: "pointer" }}>Clear Filter</button>
        )}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {filteredHistory.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>No transactions found yet.</p>
        ) : (
          filteredHistory.map((item, idx) => {
            const isPositive = item.amount > 0;
            return (
              <div key={idx} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 2px 0", fontSize: "13px", color: "#fff", fontWeight: "800" }}>{item.type}</h4>
                  <span style={{ fontSize: "9px", color: "#9ca3af", display: "block" }}>{item.time}</span>
                  {item.txnId && <span style={{ fontSize: "8px", color: "#fbbf24", fontFamily: "monospace" }}>ID: {item.txnId}</span>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontSize: "14px", color: isPositive ? "#22c55e" : "#ef4444", fontWeight: "900" }}>
                    {isPositive ? `+₹${item.amount}` : `-₹${Math.abs(item.amount)}`}
                  </strong>
                  <span style={{ fontSize: "8px", display: "block", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "1px 4px", borderRadius: "4px", marginTop: "2px" }}>{item.status}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* QR CODE POPUP MODAL */}
      {showQrModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 10px 0", fontSize: "16px" }}>🔲 Your Arena QR Code</h3>
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", textAlign: "center", display: "inline-block", marginBottom: "12px" }}>
              <QRCode 
                value={userArenaInfo?.qrCodeText || "WINARENA-P2P-QR"} 
                size={150}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
              <span style={{ fontSize: "9px", color: "#000", fontWeight: "900", display: "block", marginTop: "6px" }}>SCAN TO PAY</span>
            </div>
            <p style={{ fontSize: "11px", color: "#cbd5e1", margin: "0 0 14px 0" }}>Mobile: {userArenaInfo?.mobile}</p>
            <button onClick={() => setShowQrModal(false)} style={btnPrimaryStyle}>Close</button>
          </div>
        </div>
      )}

      {/* LIVE CAMERA SCANNER MODAL */}
      {showScannerModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ color: "#fbbf24", margin: 0, fontSize: "16px" }}>📷 Scan QR Code</h3>
              <button onClick={() => { setShowScannerModal(false); setScanTargetUser(null); }} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: "16px", cursor: "pointer", fontWeight: "900" }}>✕</button>
            </div>

            {!scanTargetUser ? (
              <div>
                <div style={{ width: "100%", height: "260px", background: "#000", borderRadius: "10px", overflow: "hidden", position: "relative", marginBottom: "12px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  {!cameraError ? (
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ color: "#ef4444", fontSize: "11px", textAlign: "center", padding: "10px" }}>
                      ⚠️ Camera unavailable or blocked.<br />Use simulation below:
                    </div>
                  )}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "140px", height: "140px", border: "2px dashed #fbbf24", borderRadius: "10px", pointerEvents: "none" }}></div>
                </div>

                <p style={{ fontSize: "10px", color: "#9ca3af", textAlign: "center", marginBottom: "12px" }}>Align QR code within the frame to scan automatically.</p>
                <button onClick={handleSimulateDetectedQR} style={btnPrimaryStyle}>Simulate Scan Success (Test)</button>
              </div>
            ) : (
              <form onSubmit={handleExecuteScanTransfer} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e", padding: "10px", borderRadius: "8px", textAlign: "left" }}>
                  <span style={{ fontSize: "9px", color: "#22c55e", fontWeight: "900" }}>✓ USER DETECTED</span>
                  <h4 style={{ margin: "2px 0", color: "#fff", fontSize: "14px" }}>{scanTargetUser.name}</h4>
                  <p style={{ margin: 0, fontSize: "10px", color: "#9ca3af" }}>Mobile: {scanTargetUser.mobile}</p>
                </div>

                <label style={{ fontSize: "10px", color: "#9ca3af", textAlign: "left" }}>Enter Transfer Amount</label>
                <input type="number" placeholder="0.00" value={scanAmount} onChange={(e) => setScanAmount(e.target.value)} style={inputStyle} required />

                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <button type="submit" style={btnPrimaryStyle}>PAY NOW 🚀</button>
                  <button type="button" onClick={() => setScanTargetUser(null)} style={btnSecondaryStyle}>Re-Scan</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ADD / WITHDRAW FORM MODAL */}
      {actionType && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ color: "#fbbf24", margin: 0, fontSize: "15px", fontWeight: "900" }}>
                {actionType === "add" ? "💰 Add Money" : "📤 Withdraw Funds"}
              </h3>
              <button onClick={() => setActionType(null)} style={{ background: "transparent", border: "none", color: "#9ca3af", fontSize: "16px", cursor: "pointer", fontWeight: "900" }}>✕</button>
            </div>

            <form onSubmit={actionType === "add" ? handleAddMoney : handleWithdraw}>
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#fbbf24", fontSize: "16px", fontWeight: "900" }}>₹</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: "100%", padding: "10px 10px 10px 30px", borderRadius: "8px", background: "#1e1b4b", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", fontSize: "15px", fontWeight: "900", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
                {[100, 500, 1000, 5000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    style={{ background: "rgba(255,255,255,0.05)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", padding: "6px", borderRadius: "6px", fontSize: "11px", fontWeight: "900", cursor: "pointer" }}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>

              {actionType === "withdraw" && (
                <div style={{ marginBottom: "12px", textAlign: "left" }}>
                  <span style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "800", display: "block", marginBottom: "6px" }}>SELECT METHOD</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
                    {["UPI", "Bank", "Paytm"].map((m) => (
                      <div
                        key={m}
                        onClick={() => setWithdrawMethod(m)}
                        style={{
                          background: withdrawMethod === m ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.03)",
                          border: withdrawMethod === m ? "1px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          padding: "6px",
                          textAlign: "center",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "900",
                          color: "#fff"
                        }}
                      >
                        {m}
                      </div>
                    ))}
                  </div>

                  {withdrawMethod === "UPI" && (
                    <input type="text" placeholder="Enter UPI ID" value={upiId} onChange={(e) => setUpiId(e.target.value)} style={inputStyle} required />
                  )}
                  {withdrawMethod === "Paytm" && (
                    <input type="text" placeholder="Enter Paytm Number" value={paytmNumber} onChange={(e) => setPaytmNumber(e.target.value)} style={inputStyle} required />
                  )}
                  {withdrawMethod === "Bank" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <input type="text" placeholder="Holder Name" value={bankDetails.name} onChange={(e) => setBankDetails({...bankDetails, name: e.target.value})} style={inputStyle} required />
                      <input type="text" placeholder="Account Number" value={bankDetails.accNo} onChange={(e) => setBankDetails({...bankDetails, accNo: e.target.value})} style={inputStyle} required />
                      <input type="text" placeholder="IFSC Code" value={bankDetails.ifsc} onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})} style={inputStyle} required />
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit" 
                style={{ 
                  background: actionType === "add" ? "#22c55e" : "#fbbf24", 
                  color: "#000", 
                  border: "none", 
                  padding: "10px", 
                  borderRadius: "8px", 
                  fontWeight: "900", 
                  cursor: "pointer", 
                  width: "100%",
                  fontSize: "12px"
                }}
              >
                {actionType === "add" ? "CONFIRM & ADD MONEY ⚡" : "CONFIRM WITHDRAWAL →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SEARCH INPUT MODAL */}
      {showSearchModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 10px 0", fontSize: "16px" }}>🔍 Search Transactions</h3>
            <p style={{ fontSize: "10px", color: "#9ca3af", marginBottom: "10px" }}>Enter user name or unique Transaction ID:</p>
            <input 
              type="text" 
              placeholder="e.g. Rahul or TXN1029..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", background: "#1e1b4b", color: "#fff", border: "1px solid rgba(251,191,36,0.4)", fontSize: "12px", marginBottom: "14px", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowSearchModal(false)} style={btnPrimaryStyle}>Search / Filter</button>
              <button onClick={() => { setSearchQuery(""); setShowSearchModal(false); }} style={btnSecondaryStyle}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM PHONEPE STYLE BOTTOM NAV */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#090d16",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "8px 0 16px 0",
        zIndex: 999
      }}>
        <Link to="/" style={navItemStyle}>
          <span style={{ fontSize: "18px" }}>🏠</span>
          <small style={{ fontSize: "10px", color: "#9ca3af" }}>Home</small>
        </Link>

        <div onClick={() => setShowSearchModal(true)} style={{ ...navItemStyle, cursor: "pointer" }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <small style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "900" }}>Search</small>
        </div>

        {/* SCAN BUTTON */}
        <div 
          onClick={() => setShowScannerModal(true)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            marginTop: "-20px"
          }}
        >
          <div style={{
            width: "50px",
            height: "50px",
            background: "#7c3aed",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.5)",
            border: "3px solid #0f172a"
          }}>
            <span style={{ fontSize: "20px" }}>🔲</span>
          </div>
          <small style={{ fontSize: "10px", color: "#fbbf24", fontWeight: "900", marginTop: "2px" }}>Scan</small>
        </div>

        <div onClick={() => alert("No new alerts.")} style={{ ...navItemStyle, cursor: "pointer" }}>
          <span style={{ fontSize: "18px" }}>🔔</span>
          <small style={{ fontSize: "10px", color: "#9ca3af" }}>Alerts</small>
        </div>

        <div onClick={() => navigate("/wallet-details")} style={{ ...navItemStyle, cursor: "pointer" }}>
          <span style={{ fontSize: "18px" }}>⏱️</span>
          <small style={{ fontSize: "10px", color: "#9ca3af" }}>History</small>
        </div>
      </nav>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  background: "#0f172a",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: "12px",
  boxSizing: "border-box"
};

const navItemStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textDecoration: "none",
  color: "#9ca3af"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "16px",
  boxSizing: "border-box"
};

const modalBoxStyle = {
  background: "#0f172a",
  border: "1px solid rgba(251, 191, 36, 0.4)",
  borderRadius: "16px",
  padding: "20px",
  width: "100%",
  maxWidth: "340px",
  textAlign: "center",
  boxSizing: "border-box"
};

const btnPrimaryStyle = {
  background: "#fbbf24",
  color: "#000",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "12px",
  width: "100%"
};

const btnSecondaryStyle = {
  flex: 1,
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "12px"
};