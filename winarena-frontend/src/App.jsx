import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import TournamentDetail from "./pages/TournamentDetail";
import Tournaments from "./pages/Tournaments";
import Wallet from "./pages/Wallet";
import WalletDetails from "./pages/WalletDetails"; // <-- Wallet Details & History Import
import ArenaWallet from "./pages/ArenaWallet"; // <-- Arena P2P Wallet Page Import
import Leaderboard from "./pages/Leaderboard";
import Support from "./pages/Support"; // <-- Support AI Import

function App() {
  return (
    <Routes>

      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* LOGIN */}
      <Route path="/login" element={<Login />} />

      {/* REGISTER */}
      <Route path="/register" element={<Register />} />

      {/* GAMES LIST */}
      <Route path="/games" element={<Games />} />

      {/* SPECIFIC GAME DETAIL PAGE */}
      <Route path="/games/:gameName" element={<GameDetail />} />

      {/* TOURNAMENTS LIST PAGE */}
      <Route path="/tournaments" element={<Tournaments />} />

      {/* TOURNAMENT DETAIL & T&C PAGE */}
      <Route path="/tournament/:id" element={<TournamentDetail />} />

      {/* WALLET ROUTE */}
      <Route path="/wallet" element={<Wallet />} />

      {/* WALLET DETAILS & TRANSACTION HISTORY ROUTE */}
      <Route path="/wallet-details" element={<WalletDetails />} />

      {/* ARENA P2P WALLET ROUTE (PhonePe Style) */}
      <Route path="/arena-wallet" element={<ArenaWallet />} />

      {/* LEADERBOARD ROUTE */}
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* SUPPORT AI ROUTE */}
      <Route path="/support" element={<Support />} />

      {/* ADMIN PANEL ROUTE */}
      <Route path="/admin" element={<Admin />} />

      {/* PROFILE ROUTE */}
      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}

export default App;