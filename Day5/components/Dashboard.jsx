import React from "react";

const Dashboard = ({ summary, onLoadUsers }) => {
  const cardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  };

  return (
    <div
      style={{
        padding: "30px",
        textAlign: "center",
        background: "#f8fafc",
      }}
    >
      <h1
        style={{
          color: "#14213D",
          marginBottom: "10px",
        }}
      >
        Users Dashboard
      </h1>

      <p
        style={{
          color: "#64748B",
          marginBottom: "20px",
        }}
      >
        Data fetched from MongoDB via Express API
      </p>

      <button 
        onClick={onLoadUsers}
        style={{
          background: "#4F46E5",
          color: "#fff",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "30px",
        }}>
      
        Refresh Users
       </button> 
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <h2 style={{ color: "#4F46E5" }}>
            {summary.totalUsers}
          </h2>
          <p>Fetched from database</p>
        </div>

        <div style={cardStyle}>
          <h3>Active Users</h3>
          <h2 style={{ color: "#22C55E" }}>
            {summary.activeUsers}
          </h2>
          <p>Currently active</p>
        </div>

        <div style={cardStyle}>
          <h3>Inactive Users</h3>
          <h2 style={{ color: "#F59E0B" }}>
            {summary.inactiveUsers}
          </h2>
          <p>Not active</p>
        </div>

        <div style={cardStyle}>
          <h3>Data Source</h3>
          <h2 style={{ color: "#9333EA" }}>
            MongoDB
          </h2>
          <p>Connected</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;