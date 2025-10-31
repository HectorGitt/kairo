import { Button } from "@/components/ui/button";
import { Brain, Download, CheckCircle, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ExtensionSetup({ user, token }) {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const API = `${BACKEND_URL}/api`;

  const handleDownload = async () => {
    try {
      // Create a link and trigger download
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
        <Button
          data-testid="back-to-dashboard-button"
          onClick={() => navigate("/dashboard")}
          variant="outline"
          style={{
            borderRadius: "10px",
            border: "2px solid #e2e8f0",
            padding: "0.5rem 1.25rem"
          }}
        >
          Back to Dashboard
        </Button>
      </header>

      {/* Main Content */}
      <main style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div className="glassmorphism" style={{
          padding: "3rem",
          borderRadius: "24px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Chrome size={64} style={{ margin: "0 auto 1.5rem", color: "#0ea5e9" }} />
            <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>Setup Kairo Extension</h2>
            <p style={{ color: "#64748b", fontSize: "1.0625rem" }}>Follow these steps to install and configure your AI accountability partner</p>
          </div>

          {/* Step 1 */}
          <div data-testid="setup-step-1" style={{
            marginBottom: "2rem",
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
                  Download Extension
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div data-testid="setup-step-2" style={{
            marginBottom: "2rem",
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
                <ol style={{ color: "#64748b", paddingLeft: "1.25rem", lineHeight: "1.8" }}>
                  <li>Open Chrome and go to <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>chrome://extensions</code></li>
                  <li>Enable "Developer mode" in the top right corner</li>
                  <li>Click "Load unpacked" and select the downloaded Kairo folder</li>
                  <li>The Kairo extension icon should appear in your browser toolbar</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div data-testid="setup-step-3" style={{
            marginBottom: "2rem",
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
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  wordBreak: "break-all",
                  marginBottom: "1rem"
                }}>
                  <span data-testid="user-token">{token}</span>
                </div>
                <p style={{ color: "#64748b", fontSize: "0.875rem", lineHeight: "1.6" }}>
                  Also set the API URL to: <code style={{ background: "#f1f5f9", padding: "0.25rem 0.5rem", borderRadius: "4px" }}>{BACKEND_URL}/api</code>
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
            <p style={{ color: "#64748b" }}>Kairo will now track your browsing and provide gentle nudges to keep you focused.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExtensionSetup;