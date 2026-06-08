import React from "react";
import UserCard from "./UserCard";

function UserList({ users }) {
  const styles = {
    container: {
      padding: "30px",
      background: "#f8fafc",
      minHeight: "100vh",
    },

    heading: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "25px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
      gap: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        📋 All Users
      </h2>

      <div style={styles.grid}>
        {users.length > 0 ? (
          users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
            />
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
}

export default UserList;