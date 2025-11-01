import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Sparkles, Save, CheckCircle, Edit2, ChevronRight, ChevronLeft, Activity, Target, Award, TrendingUp, Chrome, Download } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SharedNav from "@/components/SharedNav";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ProfileSettings({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [useAI, setUseAI] = useState(false);
  const [categorizationRules, setCategorizationRules] = useState(null);
  const [editingRules, setEditingRules] = useState(false);
  
  // Form state
  const [profession, setProfession] = useState("");
  const [workFocus, setWorkFocus] = useState([]);
  const [newWorkFocus, setNewWorkFocus] = useState("");
  const [importantSites, setImportantSites] = useState([]);
  const [newSite, setNewSite] = useState({ domain: "", category: "productive", reason: "" });
  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState("");
  
  // AI
  const [aiDescription, setAiDescription] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchCategorizationRules();
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

  const fetchCategorizationRules = async () => {
    try {
      const response = await axios.get(`${API}/profile/categorization-rules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategorizationRules(response.data);
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const handleSave = async () => {
    if (useAI && !aiDescription.trim()) {
      toast.error("Please describe your work and interests");
      return;
    }

    setSaving(true);
    try {
      if (useAI) {
        // AI generation
        await axios.post(
          `${API}/profile/generate-ai`,
          { description: aiDescription },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Profile generated with AI!");
      } else {
        // Manual save
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
      }
      
      setEditing(false);
      setUseAI(false);
      setCurrentStep(1);
      fetchProfile();
      toast.success("Extension rules will refresh automatically");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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
      <SharedNav user={user} onLogout={onLogout} />

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
            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                onClick={() => {
                  setEditing(true);
                  setUseAI(false);
                }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                  borderRadius: "10px",
                  padding: "0.75rem 1.5rem"
                }}
              >
                <Edit2 size={18} style={{ marginRight: "0.5rem" }} />
                Edit Manually
              </Button>
              <Button
                onClick={() => {
                  setEditing(true);
                  setUseAI(true);
                }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  borderRadius: "10px",
                  padding: "0.75rem 1.5rem"
                }}
              >
                <Sparkles size={18} style={{ marginRight: "0.5rem" }} />
                Regenerate with AI
              </Button>
            </div>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px", marginBottom: "2rem" }}>
            {useAI ? (
              /* AI Form */
              <div>
                <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                  <Sparkles size={48} style={{ color: "#8b5cf6", margin: "0 auto 1rem" }} />
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
                    Regenerate with AI
                  </h3>
                  <p style={{ color: "#64748b" }}>
                    Describe your work and Claude Sonnet 4 will build your profile
                  </p>
                </div>
                
                <Textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Example: I'm a social media manager for a tech startup. I spend most of my day on Twitter, LinkedIn, and Instagram creating content and analyzing metrics..."
                  rows={10}
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                    fontSize: "0.9375rem",
                    lineHeight: "1.6"
                  }}
                />

                <div style={{ display: "flex", gap: "1rem" }}>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: "1rem",
                      background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                  >
                    {saving ? (
                      <>
                        <Sparkles size={18} style={{ marginRight: "0.5rem", animation: "spin 1s linear infinite" }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} style={{ marginRight: "0.5rem" }} />
                        Generate & Save
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setAiDescription("");
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
              /* Manual Step Form */
              <div>
                {/* Step Indicator */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                  {[1, 2, 3].map((step) => (
                    <div key={step} style={{ display: "flex", alignItems: "center" }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: currentStep >= step ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)" : "#e5e7eb",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600"
                      }}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div style={{
                          width: "60px",
                          height: "3px",
                          background: currentStep > step ? "#0ea5e9" : "#e5e7eb"
                        }}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Profession */}
                {currentStep === 1 && (
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>
                      Step 1: Your Role
                    </h3>
                    <div style={{ marginBottom: "2rem" }}>
                      <Label htmlFor="profession" style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                        What do you do?
                      </Label>
                      <Input
                        id="profession"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g., Software Developer, Content Creator, Student"
                        style={{ padding: "0.875rem", borderRadius: "10px", border: "2px solid #e2e8f0", fontSize: "1rem" }}
                      />
                    </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setCurrentStep(1);
                      // Reset form to current profile data
                      setProfession(profile?.profession || "");
                      setWorkFocus(profile?.work_focus || []);
                      setImportantSites(profile?.important_sites || []);
                      setInterests(profile?.interests || []);
                    }}
                    variant="outline"
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      borderRadius: "10px",
                      border: "2px solid #e2e8f0"
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!profession.trim()}
                    style={{
                      flex: 1,
                      width: "100%",
                      padding: "0.875rem",
                      background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      fontWeight: "600"
                    }}
                  >
                    Next Step
                    <ChevronRight size={18} style={{ marginLeft: "0.5rem" }} />
                  </Button>
                </div>
                  </div>
                )}

                {/* Step 2: Work Focus & Sites */}
                {currentStep === 2 && (
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>
                      Step 2: Work Details
                    </h3>
                    
                    <div style={{ marginBottom: "1.5rem" }}>
                      <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                        Work Focus Areas
                      </Label>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <Input
                          value={newWorkFocus}
                          onChange={(e) => setNewWorkFocus(e.target.value)}
                          placeholder="e.g., Social Media, Coding"
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

                    <div style={{ marginBottom: "2rem" }}>
                      <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                        Custom Site Rules
                      </Label>
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
                          style={{ 
                            padding: "0.75rem", 
                            borderRadius: "10px", 
                            border: "2px solid #e2e8f0",
                            fontSize: "0.875rem",
                            fontFamily: "inherit",
                            backgroundColor: "white",
                            cursor: "pointer",
                            outline: "none"
                          }}
                        >
                          <option value="productive">Productive</option>
                          <option value="neutral">Neutral</option>
                          <option value="distraction">Distraction</option>
                        </select>
                        <Input
                          value={newSite.reason}
                          onChange={(e) => setNewSite({ ...newSite, reason: e.target.value })}
                          placeholder="Reason"
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
                            padding: "0.75rem",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}>
                            <span style={{ fontSize: "0.875rem" }}><strong>{site.domain}</strong> ({site.category})</span>
                            <X size={14} style={{ cursor: "pointer" }} onClick={() => handleRemoveSite(index)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Button
                        onClick={() => setCurrentStep(1)}
                        variant="outline"
                        style={{ flex: 1, padding: "0.875rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                      >
                        <ChevronLeft size={18} style={{ marginRight: "0.5rem" }} />
                        Back
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                        style={{
                          flex: 1,
                          padding: "0.875rem",
                          background: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
                          borderRadius: "10px"
                        }}
                      >
                        Next Step
                        <ChevronRight size={18} style={{ marginLeft: "0.5rem" }} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Interests & Save */}
                {currentStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#0f172a", marginBottom: "1rem" }}>
                      Step 3: Personal Interests
                    </h3>
                    
                    <div style={{ marginBottom: "2rem" }}>
                      <Label style={{ marginBottom: "0.5rem", display: "block", fontWeight: "600" }}>
                        What are you interested in?
                      </Label>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <Input
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          placeholder="e.g., Photography, Gaming"
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

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        variant="outline"
                        style={{ flex: 1, padding: "0.875rem", borderRadius: "10px", border: "2px solid #e2e8f0" }}
                      >
                        <ChevronLeft size={18} style={{ marginRight: "0.5rem" }} />
                        Back
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          flex: 2,
                          padding: "0.875rem",
                          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                          borderRadius: "10px",
                          fontSize: "1rem",
                          fontWeight: "600"
                        }}
                      >
                        <Save size={18} style={{ marginRight: "0.5rem" }} />
                        {saving ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* View Mode */}
        {!editing && (
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

        {/* Categorization Rules Section */}
        {categorizationRules && !editing && (
          <div className="glassmorphism" style={{ padding: "2.5rem", borderRadius: "20px", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.5rem" }}>
                  Your Categorization Rules
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
                  {categorizationRules.profile_set 
                    ? `Active rules based on your profile as ${profession || "your role"}`
                    : "Default rules (set up your profile for personalization)"
                  }
                </p>
              </div>
              {categorizationRules.profile_set && (
                <Button
                  onClick={() => {
                    setEditing(true);
                    setUseAI(false);
                    setCurrentStep(2); // Jump directly to rules section
                  }}
                  variant="outline"
                  style={{ borderRadius: "10px", border: "2px solid #e2e8f0", padding: "0.625rem 1.25rem" }}
                >
                  <Edit2 size={16} style={{ marginRight: "0.5rem" }} />
                  Edit Rules
                </Button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              {/* Productive Sites */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22c55e" }}></div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Productive ({categorizationRules.productive?.length || 0})
                  </h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                  {categorizationRules.productive?.slice(0, 10).map((site, index) => (
                    <div key={index} style={{
                      background: "#f0fdf4",
                      padding: "0.625rem 0.875rem",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color: "#166534",
                      border: "1px solid #bbf7d0"
                    }}>
                      {site}
                    </div>
                  ))}
                  {categorizationRules.productive?.length > 10 && (
                    <p style={{ fontSize: "0.8125rem", color: "#64748b", fontStyle: "italic", padding: "0.5rem" }}>
                      +{categorizationRules.productive.length - 10} more...
                    </p>
                  )}
                </div>
              </div>

              {/* Distraction Sites */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ef4444" }}></div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Distractions ({categorizationRules.distraction?.length || 0})
                  </h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                  {categorizationRules.distraction?.map((site, index) => (
                    <div key={index} style={{
                      background: "#fef2f2",
                      padding: "0.625rem 0.875rem",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      color: "#991b1b",
                      border: "1px solid #fecaca"
                    }}>
                      {site}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Rules */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#8b5cf6" }}></div>
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Custom Rules ({categorizationRules.custom_sites?.length || 0})
                  </h4>
                </div>
                {categorizationRules.custom_sites?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {categorizationRules.custom_sites.map((site, index) => (
                      <div key={index} style={{
                        background: "#faf5ff",
                        padding: "0.75rem",
                        borderRadius: "10px",
                        border: "1px solid #e9d5ff"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <strong style={{ fontSize: "0.875rem", color: "#6b21a8" }}>{site.domain}</strong>
                          <span style={{
                            background: site.category === "productive" ? "#dcfce7" : "#fee2e2",
                            color: site.category === "productive" ? "#16a34a" : "#dc2626",
                            padding: "0.125rem 0.375rem",
                            borderRadius: "8px",
                            fontSize: "0.6875rem",
                            fontWeight: "600",
                            textTransform: "uppercase"
                          }}>
                            {site.category}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8125rem", color: "#7c3aed", lineHeight: "1.4" }}>{site.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.875rem", color: "#94a3b8", fontStyle: "italic" }}>
                    No custom rules yet. Edit your profile to add site-specific rules.
                  </p>
                )}
              </div>
            </div>

            {!categorizationRules.profile_set && (
              <div style={{
                marginTop: "1.5rem",
                padding: "1rem 1.5rem",
                background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)",
                borderRadius: "12px",
                border: "2px solid rgba(14, 165, 233, 0.2)"
              }}>
                <p style={{ color: "#0284c7", fontSize: "0.9375rem", lineHeight: "1.6", margin: 0 }}>
                  💡 <strong>Tip:</strong> Set up your profile to get personalized categorization! Sites like Twitter can be productive for social media managers but distracting for developers.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Attention Health Tips */}
        {!editing && (
          <div className="glassmorphism" style={{
            padding: "2.5rem",
            borderRadius: "20px",
            marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
            border: "2px solid rgba(139, 92, 246, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Activity size={28} style={{ color: "#8b5cf6" }} />
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>
                  Boost Your Attention Health Score
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
                  Your attention health score combines focus, consistency, streaks, and improvement
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Focus Score Tips */}
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Target size={20} style={{ color: "#22c55e" }} />
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Focus Score (40% weight)
                  </h4>
                </div>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: "1.8" }}>
                  <li>Spend more time on productive sites</li>
                  <li>Set up custom rules for your work sites</li>
                  <li>Use focus mode to block distractions</li>
                  <li>Track activities relevant to your goals</li>
                </ul>
              </div>

              {/* Consistency Tips */}
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <CheckCircle size={20} style={{ color: "#3b82f6" }} />
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Consistency (30% weight)
                  </h4>
                </div>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: "1.8" }}>
                  <li>Track your focus every day</li>
                  <li>Install and use the Chrome extension</li>
                  <li>Build a daily routine around focus</li>
                  <li>Even 30 min/day counts!</li>
                </ul>
              </div>

              {/* Streak Tips */}
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <Award size={20} style={{ color: "#f59e0b" }} />
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Streaks (20% weight)
                  </h4>
                </div>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: "1.8" }}>
                  <li>Maintain consecutive days with 60%+ focus</li>
                  <li>Use Pomodoro timer in extension</li>
                  <li>Set daily focus goals</li>
                  <li>Streaks compound motivation!</li>
                </ul>
              </div>

              {/* Improvement Tips */}
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <TrendingUp size={20} style={{ color: "#8b5cf6" }} />
                  <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a" }}>
                    Improvement (10% weight)
                  </h4>
                </div>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "#64748b", fontSize: "0.875rem", lineHeight: "1.8" }}>
                  <li>Track week-over-week progress</li>
                  <li>Review AI insights regularly</li>
                  <li>Identify distraction patterns</li>
                  <li>Small improvements add up!</li>
                </ul>
              </div>
            </div>

            <div style={{
              marginTop: "1.5rem",
              padding: "1.25rem 1.5rem",
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.2)"
            }}>
              <p style={{ color: "#7c3aed", fontSize: "0.9375rem", lineHeight: "1.7", margin: 0, fontWeight: "500" }}>
                🎯 <strong>Pro Tip:</strong> Your attention health score updates daily. Focus on consistency over perfection – showing up every day matters more than occasional perfect days!
              </p>
            </div>
          </div>
        )}

        {/* Extension Management */}
        {!editing && (
          <div className="glassmorphism" style={{
            padding: "2.5rem",
            borderRadius: "20px",
            background: "linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)",
            border: "2px solid rgba(14, 165, 233, 0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Chrome size={28} style={{ color: "#0ea5e9" }} />
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#0f172a" }}>
                  Chrome Extension
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.9375rem" }}>
                  Manage your Kairo browser extension
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px" }}>
                <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#0f172a", marginBottom: "0.75rem" }}>
                  Download Extension
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: "1.6" }}>
                  Get the latest version of the Kairo extension with your personalized rules and improvements.
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
                      toast.success("Extension downloaded!");
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
                  Setup Instructions
                </h4>
                <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1rem", lineHeight: "1.6" }}>
                  Need help installing or configuring the extension? View detailed setup instructions.
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
                  <Chrome size={16} style={{ marginRight: "0.5rem" }} />
                  View Setup Guide
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
                💡 <strong>Tip:</strong> Your personalization rules automatically sync with the extension in real-time. Just refresh the rules in your extension settings to get the latest updates.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfileSettings;
