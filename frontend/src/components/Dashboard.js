import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, LogOut, TrendingUp, Clock, Target, Sparkles, Chrome, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchWeeklyInsights();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/browsing/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchWeeklyInsights = async () => {
    try {
      const response = await axios.get(`${API}/insights/daily?limit=7`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyData(response.data);
    } catch (error) {
      console.error("Error fetching weekly insights:", error);
    }
  };

  const generateInsights = async () => {
    setLoadingInsights(true);
    try {
      const response = await axios.post(
        `${API}/insights/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInsights(response.data.insights);
      toast.success("Insights generated!");
    } catch (error) {
      toast.error("Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
      <header className="glassmorphism" style={{
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
          <span style={{ color: "#475569", fontWeight: "500" }}>Hi, {user.username}!</span>
          <Button
            data-testid="logout-button"
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

      {/* Main Content */}
      <main style={{ padding: "3rem 2rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Extension Setup Banner */}
        <div className="glassmorphism card-hover" style={{
          padding: "2rem",
          borderRadius: "20px",
          marginBottom: "2rem",
          background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)",
          border: "2px solid rgba(14, 165, 233, 0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: "16px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Chrome size={32} style={{ color: "white" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>Install Kairo Extension</h3>
                <p style={{ color: "#64748b" }}>Get real-time focus nudges and track your browsing automatically</p>
              </div>
            </div>
            <Button
              data-testid="setup-extension-button"
              onClick={() => navigate("/extension-setup")}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: "12px",
                padding: "0.75rem 1.5rem",
                fontWeight: "600"
              }}
            >
              Setup Extension
              <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {loadingStats ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loader"></div>
          </div>
        ) : stats && stats.session_count > 0 ? (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              {/* Focus Score */}
              <div className="glassmorphism card-hover" data-testid="focus-score-card" style={{
                padding: "2rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                border: "2px solid rgba(34, 197, 94, 0.2)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Focus Score</p>
                    <h2 style={{ fontSize: "3rem", fontWeight: "700", color: "#22c55e" }}>{stats.focus_score}</h2>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>out of 100</p>
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
                    borderRadius: "12px",
                    padding: "0.75rem"
                  }}>
                    <Target size={24} style={{ color: "white" }} />
                  </div>
                </div>
              </div>

              {/* Total Time */}
              <div className="glassmorphism card-hover" data-testid="total-time-card" style={{
                padding: "2rem",
                borderRadius: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Total Time</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a" }}>{formatTime(stats.total_time)}</h2>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>tracked today</p>
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    borderRadius: "12px",
                    padding: "0.75rem"
                  }}>
                    <Clock size={24} style={{ color: "white" }} />
                  </div>
                </div>
              </div>

              {/* Productive Time */}
              <div className="glassmorphism card-hover" data-testid="productive-time-card" style={{
                padding: "2rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                border: "2px solid rgba(59, 130, 246, 0.2)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Productive Time</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3b82f6" }}>{formatTime(stats.productive_time)}</h2>
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{stats.total_time > 0 ? Math.round((stats.productive_time / stats.total_time) * 100) : 0}% of total</p>
                  </div>
                  <div style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    borderRadius: "12px",
                    padding: "0.75rem"
                  }}>
                    <TrendingUp size={24} style={{ color: "white" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="glassmorphism" style={{
              padding: "2.5rem",
              borderRadius: "20px",
              marginBottom: "2rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Sparkles size={28} style={{ color: "#0ea5e9" }} />
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>AI Insights</h3>
                </div>
                <Button
                  data-testid="generate-insights-button"
                  onClick={generateInsights}
                  disabled={loadingInsights}
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    borderRadius: "12px",
                    padding: "0.75rem 1.5rem"
                  }}
                >
                  {loadingInsights ? "Generating..." : "Generate Today's Insights"}
                </Button>
              </div>

              {insights ? (
                <div data-testid="insights-content" style={{
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%)",
                  padding: "1.5rem",
                  borderRadius: "16px",
                  border: "2px solid rgba(14, 165, 233, 0.1)",
                  lineHeight: "1.8",
                  color: "#334155",
                  whiteSpace: "pre-wrap"
                }}>
                  {insights}
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#94a3b8"
                }}>
                  <Sparkles size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  <p>Click "Generate Today's Insights" to get personalized feedback from your AI accountability partner</p>
                </div>
              )}
            </div>

            {/* Top Distractions */}
            {stats.top_distractions && stats.top_distractions.length > 0 && (
              <div className="glassmorphism" style={{
                padding: "2.5rem",
                borderRadius: "20px"
              }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "1.5rem" }}>Top Distractions Today</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {stats.top_distractions.map((distraction, index) => (
                    <div key={index} data-testid={`distraction-item-${index}`} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.5rem",
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)",
                      borderRadius: "12px",
                      border: "1px solid rgba(239, 68, 68, 0.1)"
                    }}>
                      <span style={{ color: "#334155", fontWeight: "500" }}>{distraction.domain}</span>
                      <span style={{ color: "#ef4444", fontWeight: "600" }}>{formatTime(distraction.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="glassmorphism" style={{
            padding: "4rem 2rem",
            borderRadius: "20px",
            textAlign: "center"
          }}>
            <Brain size={64} style={{ margin: "0 auto 1.5rem", color: "#0ea5e9", opacity: 0.5 }} />
            <h3 style={{ fontSize: "1.75rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>No Data Yet</h3>
            <p style={{ color: "#64748b", fontSize: "1.0625rem", marginBottom: "2rem" }}>Install the Kairo browser extension to start tracking your focus journey!</p>
            <Button
              data-testid="install-extension-button"
              onClick={() => navigate("/extension-setup")}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: "12px",
                padding: "0.875rem 2rem",
                fontSize: "1.0625rem"
              }}
            >
              Install Extension
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;