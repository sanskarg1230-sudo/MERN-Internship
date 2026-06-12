import DashboardNavbar from "../components/DashboardNavbar";

function Dashboard() {
  return (
    <>
      <DashboardNavbar />

      <div className="dashboard">
        <div className="card">
          <h2>Welcome 👋</h2>
          <p>You have successfully logged in.</p>
        </div>

        <div className="card">
          <h3>JWT Authentication</h3>
          <p>This is a protected dashboard page.</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;