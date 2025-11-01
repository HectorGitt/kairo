import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import ExtensionSetup from "@/components/ExtensionSetup";
import Integrations from "@/components/Integrations";
import IntegrationDashboard from "@/components/IntegrationDashboard";
import ProfileSetup from "@/components/ProfileSetup";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("kairo_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      // Try to fetch user data with the token
      const response = await axios.get(`${API}/browsing/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // If successful, token is valid
      const userData = JSON.parse(localStorage.getItem("kairo_user"));
      setUser(userData);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem("kairo_token");
      localStorage.removeItem("kairo_user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("kairo_token", userToken);
    localStorage.setItem("kairo_user", JSON.stringify(userData));
    toast.success("Welcome back to Kairo!");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kairo_token");
    localStorage.removeItem("kairo_user");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              !user ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? <Dashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/extension-setup" 
            element={
              user ? <ExtensionSetup user={user} token={token} /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/integrations" 
            element={
              user ? <Integrations user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />
            } 
          />
          <Route 
            path="/integrations/:integrationId" 
            element={
              user ? <IntegrationDashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/" />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;