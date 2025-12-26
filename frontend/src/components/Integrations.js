import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Activity, FileText, Chrome, ArrowRight, CheckCircle, XCircle, RefreshCw, Settings, BarChart3, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SharedNav from "@/components/SharedNav";
import { API } from "@/config";

const INTEGRATIONS = [
  {
    id: "chrome_extension",
    name: "Chrome Extension",
    icon: Chrome,
    color: "#0ea5e9",
    description: "Track browsing activity, detect distractions, and receive real-time focus nudges.",
    permissions: [
      "Read active tab information (URL, title, domain)",
      "Track time spent on websites",
      "Monitor tab switching behavior",
      "Send browser notifications"
    ],
    benefits: [
      "Automatic focus tracking",
      "Real-time distraction detection",
      "Gentle nudges to refocus",
      "Zero manual input required"
    ],
    status: "available"
  },
  {
    id: "edge_extension",
    name: "Edge Extension",
    icon: Globe,
    color: "#0078d4",
    description: "Track browsing activity in Microsoft Edge, detect distractions, and receive real-time focus nudges.",
    permissions: [
      "Read active tab information (URL, title, domain)",
      "Track time spent on websites",
      "Monitor tab switching behavior",
      "Send browser notifications"
    ],
    benefits: [
      "Automatic focus tracking on Edge",
      "Real-time distraction detection",
      "Gentle nudges to refocus",
      "Seamless Microsoft ecosystem integration"
    ],
    status: "preview"
  },
  {
    id: "firefox_extension",
    name: "Firefox Extension",
    icon: Globe,
    color: "#ff7139",
    description: "Track browsing activity in Firefox, detect distractions, and receive real-time focus nudges.",
    permissions: [
      "Read active tab information (URL, title, domain)",
      "Track time spent on websites",
      "Monitor tab switching behavior",
      "Send browser notifications"
    ],
    benefits: [
      "Automatic focus tracking on Firefox",
      "Real-time distraction detection",
      "Privacy-focused browser support",
      "Zero manual input required"
    ],
    status: "preview"
  },
  {
    id: "safari_extension",
    name: "Safari Extension",
    icon: Globe,
    color: "#006cff",
    description: "Track browsing activity in Safari, detect distractions, and receive real-time focus nudges on Mac and iOS.",
    permissions: [
      "Read active tab information (URL, title, domain)",
      "Track time spent on websites",
      "Monitor tab switching behavior",
      "Send browser notifications"
    ],
    benefits: [
      "Automatic focus tracking on Safari",
      "Mac and iOS device support",
      "Apple ecosystem integration",
      "Privacy-first tracking"
    ],
    status: "preview"
  },
  {
    id: "notion",
    name: "Notion",
    icon: FileText,
    color: "#000000",
    description: "Sync tasks and projects to align focus sessions with your actual work and deadlines.",
    permissions: [
      "Read workspace databases",
      "Access task lists and properties",
      "Read project timelines",
      "View page content (task descriptions only)"
    ],
    benefits: [
      "Link focus sessions to specific tasks",
      "Track time per project",
      "Deadline-aware focus planning",
      "Productivity per project insights"
    ],
    status: "preview"
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    icon: Calendar,
    color: "#4285f4",
    description: "Schedule focus blocks, sync deep work sessions, and protect your concentration time.",
    permissions: [
      "Read calendar events",
      "Create focus block events",
      "Modify event descriptions",
      "Access free/busy information"
    ],
    benefits: [
      "Auto-schedule focus sessions",
      "Block meeting-free time",
      "Sync focus data to calendar",
      "Team visibility for deep work"
    ],
    status: "preview"
  },
  {
    id: "slack",
    name: "Slack",
    icon: MessageSquare,
    color: "#4a154b",
    description: "Auto-update status during focus time and reduce context-switching from notifications.",
    permissions: [
      "Update user status",
      "Manage Do Not Disturb settings",
      "Read notification preferences",
      "Post status updates"
    ],
    benefits: [
      "Auto 'In Focus' status",
      "Mute notifications during deep work",
      "Team awareness of focus time",
      "Reduce interruptions"
    ],
    status: "preview"
  },
  {
    id: "google_fit",
    name: "Google Fit",
    icon: Activity,
    color: "#22c55e",
    description: "Understand how sleep, exercise, and wellness impact your focus performance.",
    permissions: [
      "Read activity data",
      "Access sleep information",
      "View step count and exercise",
      "Read heart rate data"
    ],
    benefits: [
      "Correlate focus with sleep quality",
      "Track energy levels",
      "Identify optimal focus times",
      "Holistic productivity insights"
    ],
    status: "preview"
  }
];

function Integrations({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [chromeConnected, setChromeConnected] = useState(false);

  useEffect(() => {
    fetchIntegrations();
    checkChromeExtension();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(`${API}/integrations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIntegrations(response.data);
    } catch (error) {
      console.error("Error fetching integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkChromeExtension = async () => {
    try {
      const response = await axios.get(`${API}/browsing/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // If we have sessions, extension is connected
      setChromeConnected(response.data.session_count > 0);
    } catch (error) {
      console.error("Error checking chrome extension:", error);
    }
  };

  const handleConnect = async (integrationType) => {
    if (integrationType === "chrome_extension") {
      navigate("/extension-setup");
      return;
    }

    try {
      await axios.post(
        `${API}/integrations/connect`,
        {
          integration_type: integrationType,
          credentials: {},
          settings: {}
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Integration connected successfully!");
      fetchIntegrations();
    } catch (error) {
      toast.error("Failed to connect integration");
    }
  };

  const handleDisconnect = async (integrationType) => {
    try {
      await axios.post(
        `${API}/integrations/${integrationType}/disconnect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Integration disconnected");
      fetchIntegrations();
    } catch (error) {
      toast.error("Failed to disconnect integration");
    }
  };

  const isConnected = (integrationId) => {
    if (integrationId === "chrome_extension") {
      return chromeConnected;
    }
    return integrations.some(
      (i) => i.integration_type === integrationId && i.status === "connected"
    );
  };

  const IntegrationIcon = ({ integration }) => {
    const Icon = integration.icon;
    return <Icon size={24} style={{ color: "white" }} />;
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
      {/* Header */}
      <SharedNav user={user} onLogout={onLogout} />

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
        {/* Hero Section */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>Integrations</h2>
          <p style={{ fontSize: "1.125rem", color: "#64748b", maxWidth: "800px", margin: "0 auto", lineHeight: "1.7" }}>
            Connect your favorite tools to create a unified focus ecosystem. Track tasks, schedule deep work, manage notifications, and understand how your habits impact productivity.
          </p>
        </div>

        {/* Integration Flow Diagram */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px",
          marginBottom: "3rem",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)",
          border: "2px solid rgba(139, 92, 246, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <BarChart3 size={24} style={{ color: "#8b5cf6" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a" }}>Integration Flow</h3>
          </div>
          <p style={{ color: "#64748b", lineHeight: "1.7", fontSize: "0.9375rem" }}>
            <strong style={{ color: "#0f172a" }}>Chrome Extension</strong> tracks browsing → sends focus data to web app → syncs tasks via <strong style={{ color: "#0f172a" }}>Notion API</strong> → schedules "Focus Blocks" in <strong style={{ color: "#0f172a" }}>Google Calendar</strong> → <strong style={{ color: "#0f172a" }}>Slack</strong> status auto-updates during sessions → Kairo AI coach reflects on your day using <strong style={{ color: "#0f172a" }}>Claude Sonnet 4</strong>.
          </p>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div className="loader"></div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem"
          }}>
            {INTEGRATIONS.map((integration) => {
              const connected = isConnected(integration.id);
              return (
                <div
                  key={integration.id}
                  className="glassmorphism card-hover"
                  data-testid={`integration-${integration.id}`}
                  style={{
                    padding: "2rem",
                    borderRadius: "20px",
                    border: connected ? `2px solid ${integration.color}40` : "1px solid #e5e7eb",
                    background: connected ? `linear-gradient(135deg, ${integration.color}08 0%, ${integration.color}02 100%)` : "white"
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{
                        background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}dd 100%)`,
                        borderRadius: "12px",
                        padding: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <IntegrationIcon integration={integration} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a" }}>{integration.name}</h3>
                          {integration.status === "preview" && (
                            <span style={{
                              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                              color: "white",
                              padding: "0.125rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.6875rem",
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em"
                            }}>
                              Preview
                            </span>
                          )}
                        </div>
                        {connected && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.25rem" }}>
                            <CheckCircle size={14} style={{ color: "#22c55e" }} />
                            <span style={{ fontSize: "0.8125rem", color: "#22c55e", fontWeight: "500" }}>Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {connected && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/integrations/${integration.id}`)}
                        style={{ color: integration.color }}
                      >
                        <BarChart3 size={16} style={{ marginRight: "0.375rem" }} />
                        Dashboard & Settings
                      </Button>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.6", fontSize: "0.9375rem" }}>
                    {integration.description}
                  </p>

                  {/* Benefits */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.75rem" }}>Benefits:</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {integration.benefits.map((benefit, index) => (
                        <span key={index} style={{
                          background: `${integration.color}15`,
                          color: integration.color,
                          padding: "0.375rem 0.75rem",
                          borderRadius: "16px",
                          fontSize: "0.8125rem",
                          fontWeight: "500"
                        }}>
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  {!connected && (
                    <details style={{ marginBottom: "1.5rem" }}>
                      <summary style={{
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#64748b",
                        marginBottom: "0.5rem"
                      }}>
                        Required Permissions
                      </summary>
                      <ul style={{ paddingLeft: "1.5rem", margin: 0 }}>
                        {integration.permissions.map((permission, index) => (
                          <li key={index} style={{ color: "#64748b", fontSize: "0.8125rem", lineHeight: "1.6" }}>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {!connected ? (
                      <Button
                        data-testid={`connect-${integration.id}`}
                        onClick={() => handleConnect(integration.id)}
                        style={{
                          flex: 1,
                          background: `linear-gradient(135deg, ${integration.color} 0%, ${integration.color}dd 100%)`,
                          borderRadius: "10px",
                          padding: "0.75rem"
                        }}
                      >
                        Connect {integration.name}
                      </Button>
                    ) : (
                      <>
                        <Button
                          data-testid={`disconnect-${integration.id}`}
                          onClick={() => handleDisconnect(integration.id)}
                          variant="outline"
                          style={{
                            flex: 1,
                            borderRadius: "10px",
                            padding: "0.75rem",
                            border: `2px solid ${integration.color}40`,
                            color: integration.color
                          }}
                        >
                          <XCircle size={16} style={{ marginRight: "0.5rem" }} />
                          Disconnect
                        </Button>
                        <Button
                          onClick={() => {
                            if (integration.id === "chrome_extension") {
                              navigate("/extension-setup");
                            } else {
                              toast.info(`Settings for ${integration.name} coming soon`);
                            }
                          }}
                          variant="outline"
                          style={{
                            borderRadius: "10px",
                            padding: "0.75rem",
                            border: "2px solid #e2e8f0"
                          }}
                        >
                          <Settings size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Overall Dashboard Link */}
        <div className="glassmorphism card-hover" style={{
          padding: "2rem",
          borderRadius: "20px",
          textAlign: "center",
          cursor: "pointer"
        }}
          onClick={() => navigate("/integrations/overview")}
        >
          <BarChart3 size={48} style={{ color: "#0ea5e9", margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>View Overall Dashboard</h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>See combined insights from all your connected integrations</p>
          <Button
            style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
              borderRadius: "10px",
              padding: "0.75rem 2rem"
            }}
          >
            View Overall Insights
            <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Integrations;