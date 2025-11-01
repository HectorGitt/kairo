import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Brain, LogOut, TrendingUp, Clock, Target, Sparkles, Chrome, ArrowRight, Zap, Award, Activity, BarChart3, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Dashboard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchWeeklySummary();
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

  const fetchWeeklySummary = async () => {
    try {
      const response = await axios.get(`${API}/browsing/weekly-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWeeklyData(response.data);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
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
      fetchWeeklySummary(); // Refresh to update attention health
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

  const formatHour = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${period}`;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
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
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            style={{ color: "#0ea5e9", fontWeight: "600" }}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/integrations")}
            style={{ color: "#64748b" }}
          >
            Integrations
          </Button>
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
      <main style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Extension Setup Banner - Only show if no data */}
        {(!loadingStats && (!stats || stats.session_count === 0)) && (
          <div className="glassmorphism card-hover" style={{
            padding: "1.5rem 2rem",
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
                  <Chrome size={28} style={{ color: "white" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.25rem" }}>Install Kairo Extension</h3>
                  <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Get real-time focus nudges and track your browsing automatically</p>
                </div>
              </div>
              <Button
                data-testid="setup-extension-button"
                onClick={() => navigate("/extension-setup")}
                style={{
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  borderRadius: "12px",
                  padding: "0.625rem 1.25rem",
                  fontWeight: "600"
                }}
              >
                Setup Extension
                <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
              </Button>
            </div>
          </div>
        )}

        {loadingStats ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loader"></div>
          </div>
        ) : stats && stats.session_count > 0 ? (
          <>
            {/* Attention Health & Streak Section */}
            {weeklyData && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Attention Health Score */}
                <div className="glassmorphism card-hover" data-testid="attention-health-card" style={{
                  padding: "2rem",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
                  border: "2px solid rgba(139, 92, 246, 0.2)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Attention Health Score</p>
                      <h2 style={{ fontSize: "3.5rem", fontWeight: "700", color: "#8b5cf6" }}>{weeklyData.attention_health}</h2>
                      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>out of 100</p>
                    </div>
                    <div style={{
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      height: "fit-content"
                    }}>
                      <Activity size={24} style={{ color: "white" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <div style={{ flex: 1, background: "rgba(139, 92, 246, 0.1)", padding: "0.75rem", borderRadius: "10px" }}>
                      <p style={{ fontSize: "0.8125rem", color: "#64748b" }}>Avg Focus</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#8b5cf6" }}>{weeklyData.avg_focus_score}%</p>
                    </div>
                    <div style={{ flex: 1, background: "rgba(139, 92, 246, 0.1)", padding: "0.75rem", borderRadius: "10px" }}>
                      <p style={{ fontSize: "0.8125rem", color: "#64748b" }}>Consistency</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#8b5cf6" }}>{weeklyData.consistency_rate}%</p>
                    </div>
                  </div>
                </div>

                {/* Focus Streak & Badges */}
                <div className="glassmorphism card-hover" data-testid="streak-card" style={{
                  padding: "2rem",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)",
                  border: "2px solid rgba(249, 115, 22, 0.2)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "0.5rem" }}>Daily Focus Streak</p>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                        <h2 style={{ fontSize: "3.5rem", fontWeight: "700", color: "#f97316" }}>{weeklyData.focus_streak}</h2>
                        <span style={{ fontSize: "1.5rem", color: "#64748b" }}>days</span>
                      </div>
                      {weeklyData.weekly_improvement !== 0 && (
                        <p style={{ color: weeklyData.weekly_improvement > 0 ? "#22c55e" : "#ef4444", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                          {weeklyData.weekly_improvement > 0 ? "↑" : "↓"} {Math.abs(weeklyData.weekly_improvement)}% from last week
                        </p>
                      )}
                    </div>
                    <div style={{
                      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      height: "fit-content"
                    }}>
                      <Award size={24} style={{ color: "white" }} />
                    </div>
                  </div>
                  {weeklyData.badges && weeklyData.badges.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.75rem" }}>Earned Badges</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {weeklyData.badges.map((badge, index) => (
                          <div key={index} style={{
                            background: badge.color,
                            color: "white",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.8125rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem"
                          }}>
                            <span>{badge.icon}</span>
                            {badge.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Core Focus Metrics */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              {/* Focus Score */}
              <div className="glassmorphism card-hover" data-testid="focus-score-card" style={{
                padding: "1.75rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                border: "2px solid rgba(34, 197, 94, 0.2)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Focus Ratio</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#22c55e" }}>{stats.focus_score}%</h2>
                  </div>
                  <Target size={20} style={{ color: "#22c55e" }} />
                </div>
              </div>

              {/* Active Focus Time */}
              <div className="glassmorphism card-hover" data-testid="productive-time-card" style={{
                padding: "1.75rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                border: "2px solid rgba(59, 130, 246, 0.2)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Active Focus Time</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#3b82f6" }}>{formatTime(stats.productive_time)}</h2>
                  </div>
                  <TrendingUp size={20} style={{ color: "#3b82f6" }} />
                </div>
              </div>

              {/* Distraction Time */}
              <div className="glassmorphism card-hover" data-testid="distraction-time-card" style={{
                padding: "1.75rem",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
                border: "2px solid rgba(239, 68, 68, 0.2)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Distraction Time</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#ef4444" }}>{formatTime(stats.distraction_time)}</h2>
                  </div>
                  <Clock size={20} style={{ color: "#ef4444" }} />
                </div>
              </div>

              {/* Total Time */}
              <div className="glassmorphism card-hover" data-testid="total-time-card" style={{
                padding: "1.75rem",
                borderRadius: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Total Time</p>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a" }}>{formatTime(stats.total_time)}</h2>
                  </div>
                  <Clock size={20} style={{ color: "#0ea5e9" }} />
                </div>
              </div>
            </div>

            {/* Behavioral Insights */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              {/* Context Switches */}
              <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <Zap size={18} style={{ color: "#f59e0b" }} />
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Context Switches</p>
                </div>
                <p style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a" }}>{stats.context_switches}</p>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>{stats.switches_per_hour}/hour</p>
              </div>

              {/* Session Count */}
              <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <BarChart3 size={18} style={{ color: "#06b6d4" }} />
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Session Count</p>
                </div>
                <p style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a" }}>{stats.session_count}</p>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>Today</p>
              </div>

              {/* Avg Focus Streak */}
              <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <Activity size={18} style={{ color: "#8b5cf6" }} />
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Avg Focus Streak</p>
                </div>
                <p style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a" }}>{formatTime(stats.avg_focus_streak)}</p>
                <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>Uninterrupted</p>
              </div>

              {/* Peak Focus Hours */}
              {stats.peak_focus_hours && stats.peak_focus_hours.length > 0 && (
                <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <TrendingUp size={18} style={{ color: "#22c55e" }} />
                    <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Peak Focus Hours</p>
                  </div>
                  <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#0f172a" }}>
                    {stats.peak_focus_hours.slice(0, 2).map(h => formatHour(h)).join(", ")}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>Best performance</p>
                </div>
              )}
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
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>AI Reflection Notes</h3>
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

            {/* Top Sites Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Top Distractions */}
              {stats.top_distractions && stats.top_distractions.length > 0 && (
                <div className="glassmorphism" style={{
                  padding: "2rem",
                  borderRadius: "20px"
                }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1.5rem" }}>Top 5 Distractions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {stats.top_distractions.map((distraction, index) => (
                      <div key={index} data-testid={`distraction-item-${index}`} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.25rem",
                        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)",
                        borderRadius: "12px",
                        border: "1px solid rgba(239, 68, 68, 0.1)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}>{index + 1}</span>
                          <span style={{ color: "#334155", fontWeight: "500" }}>{distraction.domain}</span>
                        </div>
                        <span style={{ color: "#ef4444", fontWeight: "600" }}>{formatTime(distraction.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Productive Sites */}
              {stats.top_productive && stats.top_productive.length > 0 && (
                <div className="glassmorphism" style={{
                  padding: "2rem",
                  borderRadius: "20px"
                }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1.5rem" }}>Top 5 Productive Sites</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {stats.top_productive.map((productive, index) => (
                      <div key={index} data-testid={`productive-item-${index}`} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.25rem",
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)",
                        borderRadius: "12px",
                        border: "1px solid rgba(34, 197, 94, 0.1)"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{
                            background: "#dcfce7",
                            color: "#16a34a",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: "700"
                          }}>{index + 1}</span>
                          <span style={{ color: "#334155", fontWeight: "500" }}>{productive.domain}</span>
                        </div>
                        <span style={{ color: "#22c55e", fontWeight: "600" }}>{formatTime(productive.time)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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