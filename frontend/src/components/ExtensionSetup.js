import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Chrome, Shield, Eye, Lock, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SharedNav from "@/components/SharedNav";
import { API, BACKEND_URL } from "@/config";

function ExtensionSetup({ user, token, onLogout }) {
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      const link = document.createElement('a');
      link.href = `${API}/extension/download`;
      link.download = 'kairo-extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download extension. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
      <SharedNav user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Privacy & Data Collection Notice */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px",
          marginBottom: "2rem",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
          border: "2px solid rgba(59, 130, 246, 0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
            <Shield size={32} style={{ color: "#3b82f6", flexShrink: 0 }} />
            <div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>Privacy & Data Collection</h3>
              <p style={{ color: "#64748b", lineHeight: "1.6" }}>We believe in complete transparency. Here's exactly what data Kairo collects and why:</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {/* What We Collect */}
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Eye size={20} style={{ color: "#3b82f6" }} />
                <h4 style={{ fontSize: "1.0625rem", fontWeight: "600", color: "#0f172a" }}>What We Collect</h4>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Website URLs you visit",
                  "Page titles",
                  "Domain names",
                  "Time spent on each site",
                  "Tab switch frequency",
                  "Session timestamps"
                ].map((item, index) => (
                  <li key={index} style={{
                    padding: "0.5rem 0",
                    color: "#64748b",
                    fontSize: "0.9375rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <span style={{ color: "#3b82f6", fontSize: "0.75rem" }}>●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What We DON'T Collect */}
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Lock size={20} style={{ color: "#22c55e" }} />
                <h4 style={{ fontSize: "1.0625rem", fontWeight: "600", color: "#0f172a" }}>What We DON'T Collect</h4>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Page content or text",
                  "Passwords or credentials",
                  "Form inputs or data",
                  "Personal messages",
                  "Search queries",
                  "Banking or financial info"
                ].map((item, index) => (
                  <li key={index} style={{
                    padding: "0.5rem 0",
                    color: "#64748b",
                    fontSize: "0.9375rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* How We Use It */}
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "16px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                <Database size={20} style={{ color: "#8b5cf6" }} />
                <h4 style={{ fontSize: "1.0625rem", fontWeight: "600", color: "#0f172a" }}>How We Use It</h4>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Calculate focus metrics",
                  "Generate AI insights",
                  "Identify distraction patterns",
                  "Track progress over time",
                  "Provide gentle nudges",
                  "Show peak productivity hours"
                ].map((item, index) => (
                  <li key={index} style={{
                    padding: "0.5rem 0",
                    color: "#64748b",
                    fontSize: "0.9375rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    <span style={{ color: "#8b5cf6", fontSize: "0.75rem" }}>●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{
            marginTop: "1.5rem",
            padding: "1rem 1.5rem",
            background: "rgba(59, 130, 246, 0.05)",
            borderRadius: "12px",
            border: "1px solid rgba(59, 130, 246, 0.1)"
          }}>
            <p style={{ color: "#334155", fontSize: "0.9375rem", lineHeight: "1.6", margin: 0 }}>
              <strong style={{ color: "#0f172a" }}>Your Privacy Guarantee:</strong> All data is encrypted, stored securely in your private account, and never shared with third parties. You have full control to delete your data anytime from the dashboard.
            </p>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="glassmorphism" style={{
          padding: "2.5rem",
          borderRadius: "24px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <Chrome size={64} style={{ margin: "0 auto 1.5rem", color: "#0ea5e9" }} />
            <h2 style={{ fontSize: "2.25rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.75rem" }}>Setup Kairo Extension</h2>
            <p style={{ color: "#64748b", fontSize: "1.0625rem" }}>Follow these steps to install and configure your AI accountability partner</p>
          </div>

          {/* Step 1 */}
          <div data-testid="setup-step-1" style={{
            marginBottom: "1.75rem",
            padding: "2rem",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%)",
            borderRadius: "16px",
            border: "2px solid rgba(14, 165, 233, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "white",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                flexShrink: 0
              }}>1</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>Download the Extension</h3>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.6" }}>Download the Kairo Chrome extension package to get started with real-time focus tracking.</p>
                <Button
                  data-testid="download-extension-button"
                  onClick={handleDownload}
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    borderRadius: "12px",
                    padding: "0.75rem 1.5rem"
                  }}
                >
                  <Download size={18} style={{ marginRight: "0.5rem" }} />
                  Download Extension (9.4 KB)
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div data-testid="setup-step-2" style={{
            marginBottom: "1.75rem",
            padding: "2rem",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%)",
            borderRadius: "16px",
            border: "2px solid rgba(14, 165, 233, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "white",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                flexShrink: 0
              }}>2</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>Install in Chrome</h3>
                <ol style={{ color: "#64748b", paddingLeft: "1.5rem", lineHeight: "1.8", margin: 0 }}>
                  <li style={{ marginBottom: "0.5rem" }}>Open Chrome and go to <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px", fontFamily: "monospace" }}>chrome://extensions</code></li>
                  <li style={{ marginBottom: "0.5rem" }}>Enable "Developer mode" toggle in the top right corner</li>
                  <li style={{ marginBottom: "0.5rem" }}>Click "Load unpacked" button</li>
                  <li style={{ marginBottom: "0.5rem" }}>Extract and select the downloaded Kairo extension folder</li>
                  <li>The Kairo extension icon should appear in your browser toolbar</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div data-testid="setup-step-3" style={{
            marginBottom: "1.75rem",
            padding: "2rem",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%)",
            borderRadius: "16px",
            border: "2px solid rgba(14, 165, 233, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                color: "white",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: "700",
                flexShrink: 0
              }}>3</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>Configure Your Token</h3>
                <p style={{ color: "#64748b", marginBottom: "1rem", lineHeight: "1.6" }}>Copy your authentication token below and paste it in the extension settings:</p>
                <div style={{
                  background: "#f8fafc",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  marginBottom: "1rem"
                }}>
                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>API URL:</p>
                  <code style={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    wordBreak: "break-all",
                    color: "#0f172a",
                    display: "block",
                    marginBottom: "1rem"
                  }}>{BACKEND_URL}/api</code>

                  <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>Authentication Token:</p>
                  <code data-testid="user-token" style={{
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    wordBreak: "break-all",
                    color: "#0f172a",
                    display: "block"
                  }}>{token}</code>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: "1.6" }}>
                  💡 <strong>Tip:</strong> Click the Kairo extension icon → Enter the API URL and token → Click "Save Settings"
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div style={{
            padding: "2rem",
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
            borderRadius: "16px",
            border: "2px solid rgba(34, 197, 94, 0.2)",
            textAlign: "center"
          }}>
            <CheckCircle size={48} style={{ color: "#22c55e", margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>You're All Set!</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Kairo will now track your browsing and provide gentle nudges to keep you focused.</p>
            <Button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                borderRadius: "12px",
                padding: "0.75rem 1.5rem"
              }}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExtensionSetup;