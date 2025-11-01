import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Sparkles, Plus, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfileSetup({ user, token, onComplete }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  
  // Manual form state
  const [profession, setProfession] = useState("");
  const [workFocus, setWorkFocus] = useState([]);
  const [newWorkFocus, setNewWorkFocus] = useState("");
  const [importantSites, setImportantSites] = useState([]);
  const [newSite, setNewSite] = useState({ domain: "", category: "productive", reason: "" });
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  
  // AI form state
  const [aiDescription, setAiDescription] = useState("");

  const handleAddWorkFocus = () => {
    if (newWorkFocus.trim()) {
      setWorkFocus([...workFocus, newWorkFocus.trim()]);
      setNewWorkFocus("");
    }
  };

  const handleRemoveWorkFocus = (index) => {
    setWorkFocus(workFocus.filter((_, i) => i !== index));
  };

  const handleAddSite = () => {
    if (newSite.domain.trim()) {
      setImportantSites([...importantSites, newSite]);
      setNewSite({ domain: "", category: "productive", reason: "" });
    }
  };

  const handleRemoveSite = (index) => {
    setImportantSites(importantSites.filter((_, i) => i !== index));
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      
      toast.success("Profile created successfully!");
      if (onComplete) onComplete();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    
    if (!aiDescription.trim()) {
      toast.error("Please describe your work and interests");
      return;
    }

    setAiLoading(true);

    try {
      const response = await axios.post(
        `${API}/profile/generate-ai`,
        { description: aiDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("AI profile generated! Redirecting...");
      if (onComplete) onComplete();
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast.error("Failed to generate AI profile");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Brain size={64} style={{ color: "#0ea5e9", margin: "0 auto 1rem" }} />
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "1rem" }}>
            Personalize Your Kairo Experience
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#64748b", lineHeight: "1.7" }}>
            Help Kairo understand your work and interests so we can provide personalized focus tracking. 
            What's productive for you might be a distraction for others.
          </p>
        </div>

        {/* Toggle between AI and Manual */}
        <div className="glassmorphism" style={{ padding: "1.5rem", borderRadius: "20px", marginBottom: "2rem", textAlign: "center" }}>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <Button
              onClick={() => setUseAI(true)}
              style={{
                background: useAI ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" : "white",
                color: useAI ? "white" : "#64748b",
                border: useAI ? "none" : "2px solid #e2e8f0",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px"
              }}
            >
              <Sparkles size={18} style={{ marginRight: "0.5rem" }} />
              AI-Generated (Recommended)
            </Button>
            <Button
              onClick={() => setUseAI(false)}
              style={{
                background: !useAI ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" : "white",
                color: !useAI ? "white" : "#64748b",
                border: !useAI ? "none" : "2px solid #e2e8f0",
                padding: "0.75rem 1.5rem",
                borderRadius: "12px"
              }}
            >
              Manual Setup
            </Button>
          </div>
        </div>

        {/* AI Form */}
        {useAI ? (
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px" }}>
            <form onSubmit={handleAIGenerate}>
              <div style={{ marginBottom: "1.5rem" }}>
                <Label style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.75rem", display: "block" }}>
                  Describe Your Work & Interests
                </Label>
                <Textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Example: I'm a social media manager for a tech startup. I spend most of my day on Twitter, LinkedIn, and Instagram creating content, engaging with followers, and analyzing metrics. I'm also learning video editing and graphic design..."
                  rows={8}
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: "1.6",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0"
                  }}
                />
                <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.5rem" }}>
                  Be specific about which websites you use for work, learning, and personal interests.
                </p>
              </div>

              <Button
                type="submit"
                disabled={aiLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600"
                }}
              >
                {aiLoading ? (
                  <>
                    <Sparkles size={18} style={{ marginRight: "0.5rem", animation: "spin 1s linear infinite" }} />
                    AI is analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} style={{ marginRight: "0.5rem" }} />
                    Generate My Profile with AI
                  </>
                )}
              </Button>
            </form>
          </div>
        ) : (
          /* Manual Form */
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px" }}>
            <form onSubmit={handleManualSubmit}>
              {/* Profession */}
              <div style={{ marginBottom: "1.5rem" }}>
                <Label htmlFor="profession" style={{ marginBottom: "0.5rem", display: "block" }}>
                  Your Profession / Role
                </Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g., Software Developer, Content Creator, Student"
                  required
                  style={{ padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                />
              </div>

              {/* Work Focus Areas */}
              <div style={{ marginBottom: "1.5rem" }}>
                <Label style={{ marginBottom: "0.5rem", display: "block" }}>Work Focus Areas</Label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Input
                    value={newWorkFocus}
                    onChange={(e) => setNewWorkFocus(e.target.value)}
                    placeholder="e.g., Social Media, Coding, Design"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddWorkFocus())}
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddWorkFocus}
                    style={{ padding: "0.75rem", borderRadius: "10px", background: "#0ea5e9" }}
                  >
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
                <Label style={{ marginBottom: "0.5rem", display: "block" }}>Important Sites for Your Work</Label>
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
                  </select>
                  <Input
                    value={newSite.reason}
                    onChange={(e) => setNewSite({ ...newSite, reason: e.target.value })}
                    placeholder="Reason (e.g., Social media work)"
                    style={{ padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSite}
                    style={{ padding: "0.75rem", borderRadius: "10px", background: "#0ea5e9" }}
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {importantSites.map((site, index) => (
                    <div key={index} style={{
                      background: "#f8fafc",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <strong style={{ color: "#0f172a" }}>{site.domain}</strong>
                        <span style={{ color: "#64748b", fontSize: "0.875rem", marginLeft: "0.5rem" }}>
                          ({site.category}) - {site.reason}
                        </span>
                      </div>
                      <X size={16} style={{ cursor: "pointer", color: "#64748b" }} onClick={() => handleRemoveSite(index)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div style={{ marginBottom: "2rem" }}>
                <Label style={{ marginBottom: "0.5rem", display: "block" }}>Personal Interests</Label>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="e.g., Photography, Gaming, Fitness"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                    style={{ flex: 1, padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddInterest}
                    style={{ padding: "0.75rem", borderRadius: "10px", background: "#0ea5e9" }}
                  >
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

              <Button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: "600"
                }}
              >
                {loading ? "Saving..." : "Save My Profile"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSetup;
