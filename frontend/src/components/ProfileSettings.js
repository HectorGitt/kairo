import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, LogOut, Plus, X, Sparkles, Save, RefreshCw, CheckCircle, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfileSettings({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  
  // Form state
  const [profession, setProfession] = useState("");
  const [workFocus, setWorkFocus] = useState([]);
  const [newWorkFocus, setNewWorkFocus] = useState("");
  const [importantSites, setImportantSites] = useState([]);
  const [newSite, setNewSite] = useState({ domain: "", category: "productive", reason: "" });
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  
  // AI regeneration
  const [showAIForm, setShowAIForm] = useState(false);
  const [aiDescription, setAiDescription] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      
      // Populate form
      setProfession(response.data.profession || "");
      setWorkFocus(response.data.work_focus || []);
      setImportantSites(response.data.important_sites || []);
      setInterests(response.data.interests || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(
        `${API}/profile`,
        {
          profession,
          work_focus: workFocus,
          important_sites: importantSites,
          interests,
          learning_goals: []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
      
      // Notify extension to refresh rules
      toast.success("Extension rules will refresh automatically");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAIRegenerate = async () => {
    if (!aiDescription.trim()) {
      toast.error("Please describe your work and interests");
      return;
    }

    setRegenerating(true);
    try {
      await axios.post(
        `${API}/profile/generate-ai`,
        { description: aiDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Profile regenerated with AI!");
      setShowAIForm(false);
      setAiDescription("");
      fetchProfile();
      setEditing(false);
    } catch (error) {
      toast.error("Failed to regenerate profile");
    } finally {
      setRegenerating(false);
    }
  };

  const handleAddWorkFocus = () => {
    if (newWorkFocus.trim() && !workFocus.includes(newWorkFocus.trim())) {
      setWorkFocus([...workFocus, newWorkFocus.trim()]);
      setNewWorkFocus("");
    }
  };

  const handleRemoveWorkFocus = (index) => {
    setWorkFocus(workFocus.filter((_, i) => i !== index));
  };

  const handleAddSite = () => {
    if (newSite.domain.trim()) {
      setImportantSites([...importantSites, { ...newSite }]);
      setNewSite({ domain: "", category: "productive", reason: "" });
    }
  };

  const handleRemoveSite = (index) => {
    setImportantSites(importantSites.filter((_, i) => i !== index));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="loader"></div>
      </div>
    );
  }

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
          <Button variant="ghost" onClick={() => navigate("/dashboard")} style={{ color: "#64748b" }}>
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate("/integrations")} style={{ color: "#64748b" }}>
            Integrations
          </Button>
          <Button variant="ghost" onClick={() => navigate("/profile")} style={{ color: "#0ea5e9", fontWeight: "600" }}>
            Profile
          </Button>
          <span style={{ color: "#475569", fontWeight: "500" }}>Hi, {user.username}!</span>
          <Button onClick={onLogout} variant="outline" style={{ borderRadius: "10px", border: "2px solid #e2e8f0", padding: "0.5rem 1.25rem" }}>
            <LogOut size={18} style={{ marginRight: "0.5rem" }} />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
            Profile Settings
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.0625rem" }}>
            Manage your personalization settings. Changes will automatically sync to your Chrome extension.
          </p>
        </div>

        {/* Profile Status */}
        <div className="glassmorphism" style={{
          padding: "1.5rem",
          borderRadius: "20px",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: profile?.profession ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)" : "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)",
          border: profile?.profession ? "2px solid rgba(34, 197, 94, 0.2)" : "2px solid rgba(239, 68, 68, 0.2)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              {profile?.profession ? <CheckCircle size={20} style={{ color: "#22c55e" }} /> : <X size={20} style={{ color: "#ef4444" }} />}
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#0f172a" }}>
                {profile?.profession ? "Profile Configured" : "Profile Not Set"}
              </h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
              {profile?.profession 
                ? `Personalization active for ${profession || "your role"}`
                : "Set up your profile to get personalized focus tracking"
              }
            </p>
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing(true)}
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                borderRadius: "10px",
                padding: "0.75rem 1.5rem"
              }}
            >
              <Edit2 size={18} style={{ marginRight: "0.5rem" }} />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px", marginBottom: "2rem" }}>
            {/* Profession */}
            <div style={{ marginBottom: "1.5rem" }}>
              <Label htmlFor="profession" style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                Your Profession / Role
              </Label>
              <Input
                id="profession"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g., Software Developer, Content Creator, Student"
                style={{ padding: "0.875rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
              />
            </div>

            {/* Work Focus Areas */}
            <div style={{ marginBottom: "1.5rem" }}>
              <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                Work Focus Areas
              </Label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Input
                  value={newWorkFocus}
                  onChange={(e) => setNewWorkFocus(e.target.value)}
                  placeholder="e.g., Social Media, Coding, Design"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddWorkFocus())}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                />
                <Button onClick={handleAddWorkFocus} style={{ padding: "0.75rem", borderRadius: "10px" }}>
                  <Plus size={18} />
                </Button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {workFocus.map((focus, index) => (
                  <span key={index} style={{
                    background: "#e0f2fe",
                    color: "#0284c7",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    {focus}
                    <X size={14} style={{ cursor: "pointer" }} onClick={() => handleRemoveWorkFocus(index)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Important Sites */}
            <div style={{ marginBottom: "1.5rem" }}>
              <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                Custom Site Rules
              </Label>
              <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Add sites that should be categorized differently for your work
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Input
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                  placeholder="twitter.com"
                  style={{ padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                />
                <select
                  value={newSite.category}
                  onChange={(e) => setNewSite({ ...newSite, category: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                >
                  <option value="productive">Productive</option>
                  <option value="neutral">Neutral</option>
                  <option value="distraction">Distraction</option>
                </select>
                <Input
                  value={newSite.reason}
                  onChange={(e) => setNewSite({ ...newSite, reason: e.target.value })}
                  placeholder="Reason (e.g., Social media work)"
                  style={{ padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                />
                <Button onClick={handleAddSite} style={{ padding: "0.75rem", borderRadius: "10px" }}>
                  <Plus size={18} />
                </Button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {importantSites.map((site, index) => (
                  <div key={index} style={{
                    background: "#f8fafc",
                    padding: "1rem 1.25rem",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div>
                      <strong style={{ color: "#0f172a", fontSize: "0.9375rem" }}>{site.domain}</strong>
                      <span style={{
                        color: site.category === "productive" ? "#22c55e" : site.category === "distraction" ? "#ef4444" : "#64748b",
                        fontSize: "0.875rem",
                        marginLeft: "0.75rem",
                        fontWeight: "500"
                      }}>
                        ({site.category})
                      </span>
                      <span style={{ color: "#64748b", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                        - {site.reason}
                      </span>
                    </div>
                    <X size={16} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => handleRemoveSite(index)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div style={{ marginBottom: "2rem" }}>
              <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                Personal Interests
              </Label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="e.g., Photography, Gaming, Fitness"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                />
                <Button onClick={handleAddInterest} style={{ padding: "0.75rem", borderRadius: "10px" }}>
                  <Plus size={18} />
                </Button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {interests.map((interest, index) => (
                  <span key={index} style={{
                    background: "#f0fdf4",
                    color: "#16a34a",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "20px",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}>
                    {interest}
                    <X size={14} style={{ cursor: "pointer" }} onClick={() => handleRemoveInterest(index)} />
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600"
                }}
              >
                <Save size={18} style={{ marginRight: "0.5rem" }} />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => {
                  setEditing(false);
                  fetchProfile(); // Reset form
                }}
                variant="outline"
                style={{
                  flex: 1,
                  padding: "1rem",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  border: "2px solid #e2e8f0"
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px", marginBottom: "2rem" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>
                PROFESSION
              </h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>
                {profession || "Not set"}
              </p>
            </div>

            {workFocus.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#64748b", marginBottom: "0.75rem" }}>
                  WORK FOCUS
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {workFocus.map((focus, index) => (
                    <span key={index} style={{
                      background: "#e0f2fe",
                      color: "#0284c7",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}>
                      {focus}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {importantSites.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#64748b", marginBottom: "0.75rem" }}>
                  CUSTOM SITE RULES
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {importantSites.map((site, index) => (
                    <div key={index} style={{
                      background: "#f8fafc",
                      padding: "1rem 1.25rem",
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                        <strong style={{ color: "#0f172a" }}>{site.domain}</strong>
                        <span style={{
                          background: site.category === "productive" ? "#dcfce7" : site.category === "distraction" ? "#fee2e2" : "#f1f5f9",
                          color: site.category === "productive" ? "#16a34a" : site.category === "distraction" ? "#dc2626" : "#64748b",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          textTransform: "uppercase"
                        }}>
                          {site.category}
                        </span>
                      </div>
                      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{site.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interests.length > 0 && (
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#64748b", marginBottom: "0.75rem" }}>
                  INTERESTS
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {interests.map((interest, index) => (
                    <span key={index} style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Regeneration Section */}
        <div className="glassmorphism" style={{
          padding: "2rem",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
          border: "2px solid rgba(139, 92, 246, 0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <Sparkles size={24} style={{ color: "#8b5cf6" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a" }}>
              Regenerate with AI
            </h3>
          </div>
          <p style={{ color: "#64748b", marginBottom: "1.5rem", lineHeight: "1.6" }}>
            Changed careers or interests? Let AI regenerate your profile based on a new description.
          </p>

          {!showAIForm ? (
            <Button
              onClick={() => setShowAIForm(true)}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                borderRadius: "10px",
                padding: "0.75rem 1.5rem"
              }}
            >
              <RefreshCw size={18} style={{ marginRight: "0.5rem" }} />
              Regenerate with AI
            </Button>
          ) : (
            <div>
              <Textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="Describe your new role, work focus, and the websites you use for work..."
                rows={6}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0"
                }}
              />
              <div style={{ display: "flex", gap: "1rem" }}>
                <Button
                  onClick={handleAIRegenerate}
                  disabled={regenerating}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    borderRadius: "10px",
                    padding: "0.75rem"
                  }}
                >
                  {regenerating ? "Generating..." : "Generate"}
                </Button>
                <Button
                  onClick={() => {
                    setShowAIForm(false);
                    setAiDescription("");
                  }}
                  variant="outline"
                  style={{
                    flex: 1,
                    borderRadius: "10px",
                    padding: "0.75rem",
                    border: "2px solid #e2e8f0"
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ProfileSettings;
