import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // 🟢 ADMIN KA UNIQUE ID & PASSWORD
    const ADMIN_UNIQUE_ID = "admin@winarena.com";
    const ADMIN_PASSWORD = "admin@2347";

    if (email === ADMIN_UNIQUE_ID && password === ADMIN_PASSWORD) {
      // Agar admin login karta hai
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("isAdmin", "true"); // Admin flag set karein
      alert("Welcome Admin!");
      navigate("/admin"); // Seedha Admin panel par bhej dein
    } else {
      // Normal User Login
      localStorage.setItem("isLoggedIn", "true");
      localStorage.removeItem("isAdmin"); // User ke liye admin flag hata dein
      navigate("/"); // Home page par bhej dein
    }
  };

  return (
    <div style={{ padding: "30px 20px", color: "#fff", background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "400px", margin: "0 auto", boxSizing: "border-box" }}>
      
      {/* 🟢 PUBLIC FOLDER WALA LOGO IMAGE */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <img 
          src="/logo.png" 
          alt="WinArena Logo" 
          style={{ width: "110px", height: "auto", objectFit: "contain" }} 
        />
      </div>

      <h1 style={{ fontSize: "20px", color: "#fbbf24", marginBottom: "6px", fontWeight: "900", textAlign: "center" }}>
        LOGIN TO WINARENA
      </h1>
      <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "24px", textAlign: "center" }}>
        Enter your credentials to continue
      </p>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px", fontWeight: "700" }}>Email or Unique ID</label>
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter email / admin ID"
            required
            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#1e1b4b", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "11px", color: "#9ca3af", marginBottom: "4px", fontWeight: "700" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Enter password"
            required
            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#1e1b4b", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", boxSizing: "border-box" }}
          />
        </div>

        <button 
          type="submit" 
          style={{ 
            background: "#7c3aed", 
            color: "#fff", 
            border: "none", 
            padding: "12px", 
            borderRadius: "8px", 
            fontWeight: "900", 
            cursor: "pointer",
            marginTop: "10px"
          }}
        >
          LOGIN
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "12px", color: "#9ca3af", marginTop: "20px" }}>
        Don't have an account? <Link to="/register" style={{ color: "#fbbf24", fontWeight: "700", textDecoration: "none" }}>Register</Link>
      </p>

    </div>
  );
}