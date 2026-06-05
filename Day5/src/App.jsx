import { useState, useEffect } from "react";
import "./App.css";

import Header from "../components/Header";
import Dashboard from "../components/Dashboard";
import UserList from "../components/UserList";

function App() {
  const [users, setUsers] = useState([]);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`)
      const result = await response.json();

      setUsers(result.data);

      setSummary({
        totalUsers: result.summary.totalUsers,
        activeUsers: result.summary.activeUsers,
        inactiveUsers: result.summary.inactiveUsers,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <Header />

      <Dashboard
        summary={summary}
        onLoadUsers={fetchUsers}
      />

      <UserList users={users} />
    </>
  );
}

export default App;