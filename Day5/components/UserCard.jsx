import React from "react";

function UserCard({ user }) {
  const styles = {
    card: {
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      border: "1px solid #e5e7eb",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },

    top: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },

    avatar: {
      width: "55px",
      height: "55px",
      borderRadius: "50%",
      background: user.isActive ? "#e8f5e9" : "#fce4ec",
      color: user.isActive ? "#2e7d32" : "#d81b60",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "700",
      flexShrink: 0,
    },

    info: {
      flex: 1,
    },

    name: {
      margin: 0,
      fontSize: "18px",
      fontWeight: "600",
      color: "#1f2937",
    },

    email: {
      margin: "4px 0 8px",
      fontSize: "13px",
      color: "#64748b",
    },

    status: {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      background: user.isActive ? "#dcfce7" : "#ffe4e6",
      color: user.isActive ? "#15803d" : "#e11d48",
    },

    divider: {
      border: "none",
      borderTop: "1px solid #e5e7eb",
      margin: 0,
    },

    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "13px",
      color: "#64748b",
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div style={styles.avatar}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div style={styles.info}>
          <h3 style={styles.name}>{user.name}</h3>

          <p style={styles.email}>
            {user.email || `${user.name.toLowerCase()}@example.com`}
          </p>

          <span style={styles.status}>
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <hr style={styles.divider} />

      <div style={styles.footer}>
        <span>📅 {user.age} years</span>
        <span>🆔 {user._id.slice(-12)}</span>
      </div>
    </div>
  );
}

export default UserCard;