import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock, Globe, List, BarChart2 } from "lucide-react";
import SharedNav from "@/components/SharedNav";
import { API } from "@/config";
import { toast } from "sonner";

function BrowsingHistory({ user, token, onLogout }) {
    const [view, setView] = useState("sites"); // "log" or "sites"
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, [view, page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API}/browsing/history`, {
                params: { view, page, limit },
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error("Error fetching history:", error);
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) return `${hrs}h ${mins}m`;
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    const formatDate = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleString();
    };

    const renderPagination = () => {
        if (!data || data.pages <= 1) return null;

        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "2rem" }}>
                <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    style={{ borderRadius: "10px" }}
                >
                    <ChevronLeft size={16} style={{ marginRight: "0.5rem" }} />
                    Previous
                </Button>
                <span style={{ color: "#64748b", fontWeight: "500" }}>
                    Page {page} of {data.pages} (Total: {data.total})
                </span>
                <Button
                    variant="outline"
                    disabled={page >= data.pages}
                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                    style={{ borderRadius: "10px" }}
                >
                    Next
                    <ChevronRight size={16} style={{ marginLeft: "0.5rem" }} />
                </Button>
            </div>
        );
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)" }}>
            <SharedNav user={user} onLogout={onLogout} />

            <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
                            Browsing History
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "1.0625rem" }}>
                            Track your digital footprint and time usage.
                        </p>
                    </div>

                    <div style={{
                        background: "white",
                        padding: "0.5rem",
                        borderRadius: "12px",
                        display: "flex",
                        gap: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}>
                        <Button
                            variant={view === "log" ? "default" : "ghost"}
                            onClick={() => { setView("log"); setPage(1); }}
                            style={{
                                borderRadius: "8px",
                                background: view === "log" ? "#0ea5e9" : "transparent",
                                color: view === "log" ? "white" : "#64748b"
                            }}
                        >
                            <List size={18} style={{ marginRight: "0.5rem" }} />
                            Activity Log
                        </Button>
                        <Button
                            variant={view === "sites" ? "default" : "ghost"}
                            onClick={() => { setView("sites"); setPage(1); }}
                            style={{
                                borderRadius: "8px",
                                background: view === "sites" ? "#0ea5e9" : "transparent",
                                color: view === "sites" ? "white" : "#64748b"
                            }}
                        >
                            <BarChart2 size={18} style={{ marginRight: "0.5rem" }} />
                            Top Sites
                        </Button>
                    </div>
                </div>

                <div className="glassmorphism" style={{
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "white",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                }}>
                    {loading ? (
                        <div style={{ padding: "4rem", textAlign: "center" }}>
                            <div className="loader"></div>
                        </div>
                    ) : !data || data.history.length === 0 ? (
                        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                            No history found.
                        </div>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                                        {view === "log" ? (
                                            <>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Domain</th>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Timestamp</th>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Duration</th>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Category</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Domain</th>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Total Visits</th>
                                                <th style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontWeight: "600" }}>Total Duration</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.history.map((item, index) => (
                                        <tr key={index} style={{ borderBottom: "1px solid #f8fafc" }}>
                                            {view === "log" ? (
                                                <>
                                                    <td style={{ padding: "1rem", fontWeight: "500", color: "#0f172a" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                            <Globe size={16} style={{ color: "#94a3b8" }} />
                                                            {item.domain}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "1rem", color: "#64748b" }}>{formatDate(item.start_time)}</td>
                                                    <td style={{ padding: "1rem", color: "#0f172a", fontWeight: "500" }}>{formatDuration(item.duration)}</td>
                                                    <td style={{ padding: "1rem" }}>
                                                        <span style={{
                                                            padding: "0.25rem 0.75rem",
                                                            borderRadius: "20px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600",
                                                            textTransform: "uppercase",
                                                            background: item.status === "productive" ? "#dcfce7" : item.status === "distraction" ? "#fee2e2" : "#f1f5f9",
                                                            color: item.status === "productive" ? "#16a34a" : item.status === "distraction" ? "#dc2626" : "#64748b"
                                                        }}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ padding: "1rem", fontWeight: "500", color: "#0f172a" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                            <Globe size={16} style={{ color: "#94a3b8" }} />
                                                            {item.domain}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: "1rem", color: "#64748b" }}>{item.visit_count}</td>
                                                    <td style={{ padding: "1rem", color: "#0ea5e9", fontWeight: "600" }}>{formatDuration(item.total_duration)}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {renderPagination()}
            </main>
        </div>
    );
}

export default BrowsingHistory;
