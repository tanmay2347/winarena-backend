import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function GameDetail() {
  const { gameName } = useParams();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    // Admin tournaments fetch karein
    const allTournaments = JSON.parse(localStorage.getItem("adminTournaments")) || [];
    // Sirf is game ke tournaments filter karein (e.g. Free Fire)
    const filtered = allTournaments.filter(
      (t) => t.game.toLowerCase().replace(/\s+/g, "") === gameName.toLowerCase().replace(/\s+/g, "")
    );
    setTournaments(filtered);
  }, [gameName]);

  // Live Countdown Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedTimes = {};
      tournaments.forEach((t) => {
        const diff = t.startTime - now;
        if (diff <= 0) {
          updatedTimes[t.id] = "MATCH STARTED";
        } else {
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          updatedTimes[t.id] = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
      });
      setTimeLeft(updatedTimes);
    }, 1000);

    return () => clearInterval(timer);
  }, [tournaments]);

  return (
    <div style={{ padding: "20px", color: "#fff", background: "#0f172a", minHeight: "100vh", paddingBottom: "80px", maxWidth: "600px", margin: "0 auto", boxSizing: "border-box" }}>
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: "#7c3aed", 
          color: "#fff", 
          border: "none", 
          padding: "8px 14px", 
          borderRadius: "8px", 
          cursor: "pointer", 
          marginBottom: "20px",
          fontWeight: "700"
        }}
      >
        ← Back
      </button>

      {/* HEADER TITLE */}
      <h1 style={{ fontSize: "20px", color: "#fbbf24", marginBottom: "4px", fontWeight: "900", textTransform: "uppercase" }}>
        {gameName} Tournaments
      </h1>
      <p style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "20px" }}>
        Live and upcoming tournaments for {gameName}.
      </p>

      {/* TOURNAMENTS LIST */}
      {tournaments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
          <p>No active tournaments found for {gameName}. Check admin panel to create one!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {tournaments.map((tournament) => {
            const registeredCount = tournament.registeredUsers?.length || 0;
            const isFull = registeredCount >= tournament.totalSlots;
            const timerText = timeLeft[tournament.id] || "Loading...";

            return (
              <div 
                key={tournament.id}
                style={{ 
                  background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", 
                  borderRadius: "16px", 
                  border: "1px solid rgba(255,255,255,0.15)", 
                  padding: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
                }}
              >
                {/* TOP BAR: Title & Live Badge / Timer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", color: "#fff", fontWeight: "900", textTransform: "uppercase" }}>
                    {tournament.game} – {tournament.mode}
                  </h3>
                  <span style={{ background: "#22c55e", color: "#fff", fontSize: "9px", fontWeight: "900", padding: "3px 8px", borderRadius: "6px" }}>
                    ● LIVE
                  </span>
                </div>

                {/* SLOTS & TIMER */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", fontSize: "12px" }}>
                  <span style={{ color: "#9ca3af" }}>
                    Slots: <strong style={{ color: "#fff" }}>{registeredCount} / {tournament.totalSlots}</strong>
                  </span>
                  <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "4px 10px", borderRadius: "6px", color: "#fbbf24", fontWeight: "800", fontSize: "11px" }}>
                    ⏳ Starts in: {timerText}
                  </div>
                </div>

                {/* ENTRY & PRIZE */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "9px", color: "#9ca3af", display: "block", fontWeight: "700" }}>ENTRY</span>
                    <strong style={{ fontSize: "16px", color: "#fbbf24" }}>₹{tournament.entry}</strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "9px", color: "#9ca3af", display: "block", fontWeight: "700" }}>PRIZE POOL</span>
                    <strong style={{ fontSize: "16px", color: "#22c55e" }}>₹{tournament.prize}</strong>
                  </div>
                </div>

                {/* JOIN NOW BUTTON */}
                <button 
                  disabled={isFull}
                  onClick={() => navigate(`/tournament/${tournament.id}`)}
                  style={{ 
                    background: isFull ? "#4b5563" : "#7c3aed", 
                    color: "#fff", 
                    border: "none", 
                    padding: "12px", 
                    borderRadius: "10px", 
                    fontWeight: "900", 
                    cursor: isFull ? "not-allowed" : "pointer",
                    width: "100%",
                    fontSize: "13px",
                    boxShadow: isFull ? "none" : "0 4px 15px rgba(124, 58, 237, 0.4)"
                  }}
                >
                  {isFull ? "SLOTS FULL" : "JOIN NOW"}
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}