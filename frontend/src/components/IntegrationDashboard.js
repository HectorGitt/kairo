import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MessageSquare, Activity, FileText, Chrome, TrendingUp, Clock, Target, CheckCircle, Download, Settings as SettingsIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import SharedNav from "@/components/SharedNav";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const INTEGRATION_DETAILS = {
  chrome_extension: {
    name: "Chrome Extension",
    icon: Chrome,
    color: "#0ea5e9",
    metrics: [
      { label: "Sites Tracked", value: "247", icon: Target },
      { label: "Focus Sessions", value: "18", icon: Clock },
      { label: "Nudges Sent", value: "42", icon: TrendingUp },
      { label: "Avg Session", value: "38m", icon: Activity }
    ]
  },
  notion: {
    name: "Notion",
    icon: FileText,
    color: "#000000",
    metrics: [
      { label: "Tasks Synced", value: "156", icon: CheckCircle },
      { label: "Projects", value: "12", icon: FileText },
      { label: "Completed Today", value: "8", icon: Target },
      { label: "Focus Time/Task", value: "1.2h", icon: Clock }
    ]
  },
  google_calendar: {
    name: "Google Calendar",
    icon: Calendar,
    color: "#4285f4",
    metrics: [
      { label: "Focus Blocks", value: "24", icon: Calendar },
      { label: "Hours Scheduled", value: "52h", icon: Clock },
      { label: "Completion Rate", value: "87%", icon: Target },
      { label: "Avg Block Length", value: "2.2h", icon: TrendingUp }
    ]
  },
  slack: {
    name: "Slack",
    icon: MessageSquare,
    color: "#4a154b",
    metrics: [
      { label: "Status Updates", value: "34", icon: MessageSquare },
      { label: "Interruptions Avoided", value: "128", icon: Target },
      { label: "DND Hours", value: "28h", icon: Clock },
      { label: "Focus Mode Active", value: "42%", icon: Activity }
    ]
  },
  google_fit: {
    name: "Google Fit",
    icon: Activity,
    color: "#22c55e",
    metrics: [
      { label: "Avg Sleep", value: "7.2h", icon: Activity },
      { label: "Active Days", value: "5/7", icon: Target },
      { label: "Steps/Day", value: "8,420", icon: TrendingUp },
      { label: "Focus/Sleep Correlation", value: "+34%", icon: CheckCircle }
    ]
  }
};

function IntegrationDashboard({ user, token, onLogout }) {
  const navigate = useNavigate();
  const { integrationId } = useParams();
  const [integrationData, setIntegrationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const integration = INTEGRATION_DETAILS[integrationId];
  const IntegrationIcon = integration?.icon;

  useEffect(() => {
    if (!integration) {
      navigate("/integrations");
      return;
    }
    fetchIntegrationData();
  }, [integrationId]);

  const fetchIntegrationData = async () => {
    try {
      const response = await axios.get(`${API}/integrations/${integrationId}/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntegrationData(response.data);
    } catch (error) {
      console.error("Error fetching integration data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!integration) return null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
      <SharedNav user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/integrations")}
          style={{ marginBottom: "1.5rem", color: "#64748b" }}
        >
          <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} />
          Back to Integrations
        </Button>

        {/* Integration Header */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px",
          marginBottom: "2rem",
          background: `linear-gradient(135deg, ${integration.color}15 0%, ${integration.color}05 100%)`,
          border: `2px solid ${integration.color}40`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{
              background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}dd 100%)`,
              borderRadius: "16px",
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <IntegrationIcon size={36} style={{ color: "white" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
                {integration.name} Dashboard
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle size={16} style={{ color: "#22c55e" }} />
                <span style={{ color: "#22c55e", fontWeight: "500" }}>Connected & Syncing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          {integration.metrics.map((metric, index) => {
            const MetricIcon = metric.icon;
            return (
              <div key={index} className="glassmorphism card-hover" style={{
                padding: "1.75rem",
                borderRadius: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{metric.label}</p>
                    <h3 style={{ fontSize: "2.25rem", fontWeight: "700", color: integration.color }}>{metric.value}</h3>
                  </div>
                  <MetricIcon size={20} style={{ color: integration.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Chrome Extension Management Section */}
        {integrationId === "chrome_extension" && (
          <div className="glassmorphism" style={{
            padding: "2rem",
            borderRadius: "20px",
            marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)",
            border: "2px solid rgba(14, 165, 233, 0.2)"
          }}>
            <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "1.5rem" }}>Extension Management</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.75rem" }}>
                  Download Latest Version
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: "1.6" }}>
                  Get the latest version of the Kairo extension with your personalized rules and latest features.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      const link = document.createElement('a');
                      link.href = `${API}/extension/download`;
                      link.download = 'kairo-extension.zip';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("Extension downloaded successfully!");
                    } catch (error) {
                      console.error('Download failed:', error);
                      toast.error('Failed to download extension');
                    }
                  }}
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                    borderRadius: "10px",
                    padding: "0.75rem"
                  }}
                >
                  <Download size={16} style={{ marginRight: "0.5rem" }} />
                  Download Extension
                </Button>
              </div>

              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.75rem" }}>
                  Setup & Configuration
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: "1.6" }}>
                  View detailed installation instructions and configure your extension settings.
                </p>
                <Button
                  onClick={() => navigate("/extension-setup")}
                  variant="outline"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    padding: "0.75rem"
                  }}
                >
                  <SettingsIcon size={16} style={{ marginRight: "0.5rem" }} />
                  Setup Instructions
                </Button>
              </div>
            </div>

            <div style={{
              marginTop: "1.5rem",
              padding: "1rem 1.5rem",
              background: "rgba(14, 165, 233, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(14, 165, 233, 0.1)"
            }}>
              <p style={{ color: "#0284c7", fontSize: "0.875rem", lineHeight: "1.6", margin: 0 }}>
                💡 <strong>Tip:</strong> After updating your profile or custom rules, download the extension again to sync the latest personalized categorization rules.
              </p>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px",
          marginBottom: "2rem"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "1.5rem" }}>Recent Activity</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { time: "2 hours ago", action: "Synced new data", status: "success" },
              { time: "5 hours ago", action: "Updated 3 records", status: "success" },
              { time: "Yesterday", action: "Connected successfully", status: "success" }
            ].map((activity, index) => (
              <div key={index} style={{
                padding: "1rem 1.5rem",
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(56, 189, 248, 0.02) 100%)",
                borderRadius: "12px",
                border: "1px solid rgba(14, 165, 233, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <p style={{ fontWeight: "500", color: "#0f172a", marginBottom: "0.25rem" }}>{activity.action}</p>
                  <p style={{ fontSize: "0.875rem", color: "#64748b" }}>{activity.time}</p>
                </div>
                <CheckCircle size={20} style={{ color: "#22c55e" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Integration-Specific Insights */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px"
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>Insights</h3>
          <p style={{ color: "#64748b", lineHeight: "1.7" }}>
            Your {integration.name} integration is working great! Keep it up to unlock more personalized insights about your productivity patterns.
          </p>
        </div>
      </main>
    </div>
  );
}

export default IntegrationDashboard;
