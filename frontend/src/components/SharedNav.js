import { Button } from "@/components/ui/button";
import { Brain, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function SharedNav({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glassmorphism" style={{
      padding: "1.5rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div 
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
        onClick={() => navigate("/dashboard")}
      >
        <Brain size={32} style={{ color: "#0ea5e9" }} />
        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: "700",
          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>Kairo</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          style={{ 
            color: isActive("/dashboard") ? "#0ea5e9" : "#64748b",
            fontWeight: isActive("/dashboard") ? "600" : "500"
          }}
        >
          Dashboard
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/integrations")}
          style={{ 
            color: isActive("/integrations") || location.pathname.startsWith("/integrations/") ? "#0ea5e9" : "#64748b",
            fontWeight: isActive("/integrations") || location.pathname.startsWith("/integrations/") ? "600" : "500"
          }}
        >
          Integrations
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          style={{ 
            color: isActive("/profile") ? "#0ea5e9" : "#64748b",
            fontWeight: isActive("/profile") ? "600" : "500"
          }}
        >
          Profile
        </Button>
        <span style={{ color: "#475569", fontWeight: "500" }}>Hi, {user.username}!</span>
        <Button
          onClick={onLogout}
          variant="outline"
          style={{
            borderRadius: "10px",
            border: "2px solid #e2e8f0",
            padding: "0.5rem 1.25rem"
          }}
        >
          <LogOut size={18} style={{ marginRight: "0.5rem" }} />
          Logout
        </Button>
      </div>
    </header>
  );
}

export default SharedNav;
