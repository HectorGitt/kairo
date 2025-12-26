import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Sparkles, Target, TrendingUp } from "lucide-react";
import { API } from "@/config";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      const message = error.response?.data?.detail || "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background with gradient */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)",
        zIndex: 0
      }}></div>

      {/* Floating shapes */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
        zIndex: 1
      }}></div>
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite",
        zIndex: 1
      }}></div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        minHeight: "100vh",
        padding: "2rem"
      }}>
        {/* Left Side - Hero */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 4rem",
          maxWidth: "600px"
        }} className="fade-in">
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Brain size={40} style={{ color: "#0ea5e9" }} />
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>Kairo</h1>
            </div>
            <h2 style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "1rem",
              lineHeight: "1.2"
            }}>Your AI Accountability Partner</h2>
            <p style={{
              fontSize: "1.125rem",
              color: "#475569",
              lineHeight: "1.7",
              marginBottom: "2rem"
            }}>Transform distractions into focus. Kairo observes your browsing patterns, provides gentle nudges, and helps you build lasting focus habits with AI-powered insights.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: "12px",
                padding: "0.75rem",
                flexShrink: 0
              }}>
                <Sparkles size={24} style={{ color: "white" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.25rem" }}>Real-time Awareness</h3>
                <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Gentle nudges when you drift off track, building mindful browsing habits</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                borderRadius: "12px",
                padding: "0.75rem",
                flexShrink: 0
              }}>
                <Target size={24} style={{ color: "white" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.25rem" }}>AI-Powered Insights</h3>
                <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Daily reflections and personalized strategies from your AI partner</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%)",
                borderRadius: "12px",
                padding: "0.75rem",
                flexShrink: 0
              }}>
                <TrendingUp size={24} style={{ color: "white" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.25rem" }}>Track Your Progress</h3>
                <p style={{ color: "#64748b", fontSize: "0.95rem" }}>Visualize focus trends and celebrate improvements over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem"
        }} className="slide-in-left">
          <div className="glassmorphism" style={{
            padding: "3rem",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "450px"
          }}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
              <h3 style={{
                fontSize: "1.875rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0.5rem"
              }}>{isLogin ? "Welcome Back" : "Get Started"}</h3>
              <p style={{ color: "#64748b" }}>
                {isLogin ? "Continue your focus journey" : "Start building better habits today"}
              </p>
            </div>

            <form onSubmit={handleSubmit} data-testid="auth-form">
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {!isLogin && (
                  <div>
                    <Label htmlFor="username" style={{ color: "#334155", fontWeight: "500" }}>Username</Label>
                    <Input
                      id="username"
                      data-testid="username-input"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required={!isLogin}
                      style={{
                        marginTop: "0.5rem",
                        height: "48px",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        fontSize: "1rem"
                      }}
                      placeholder="Enter your username"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="email" style={{ color: "#334155", fontWeight: "500" }}>Email</Label>
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      marginTop: "0.5rem",
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" style={{ color: "#334155", fontWeight: "500" }}>Password</Label>
                  <Input
                    id="password"
                    data-testid="password-input"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    style={{
                      marginTop: "0.5rem",
                      height: "48px",
                      borderRadius: "12px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                    placeholder="Enter your password"
                  />
                </div>

                <Button
                  data-testid="submit-button"
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: "52px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    fontSize: "1.0625rem",
                    fontWeight: "600",
                    marginTop: "0.5rem"
                  }}
                >
                  {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>

                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <button
                    type="button"
                    data-testid="toggle-auth-mode"
                    onClick={() => setIsLogin(!isLogin)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0ea5e9",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500"
                    }}
                  >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;