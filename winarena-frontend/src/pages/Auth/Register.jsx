import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================
  // CREATE ACCOUNT
  // =========================================
  const handleRegister = (e) => {
    e.preventDefault();

    if (!name || !email || !mobile || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (mobile.length !== 10) {
      alert("Enter a valid 10 digit mobile number");
      return;
    }

    // =========================================
    // SAVE USER
    // =========================================
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userMobile", mobile);

    // =========================================
    // GO TO HOME
    // =========================================
    navigate("/");
  };

  return (
    <div className="login-page">

      {/* =========================================
          REGISTER CARD
      ========================================= */}
      <div className="login-card">

        {/* LOGO IMAGE FROM PUBLIC FOLDER */}
        <div className="login-logo" style={{ textAlign: "center", marginBottom: "16px" }}>
          <img 
            src="/logo.png" 
            alt="WinArena Logo" 
            style={{ width: "110px", height: "auto", objectFit: "contain" }} 
          />
        </div>

        {/* TITLE */}
        <h1>Create Account</h1>

        <p className="login-subtitle">
          Join WinArena and start your gaming journey
        </p>

        {/* =========================================
            REGISTER FORM
        ========================================= */}
        <form onSubmit={handleRegister}>

          {/* FULL NAME */}
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* EMAIL */}
          <div className="input-group">
            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* MOBILE */}
          <div className="input-group">
            <label>Mobile Number</label>

            <input
              type="tel"
              placeholder="Enter 10 digit mobile number"
              maxLength="10"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setMobile(value);
              }}
            />
          </div>

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="input-group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* CREATE ACCOUNT BUTTON */}
          <button
            type="submit"
            className="login-button"
          >
            CREATE ACCOUNT
          </button>

        </form>

        {/* =========================================
            LOGIN LINK
        ========================================= */}
        <div className="create-account">

          <span>Already have an account?</span>

          <Link to="/login">
            Login
          </Link>

        </div>

      </div>

    </div>
  );
} 