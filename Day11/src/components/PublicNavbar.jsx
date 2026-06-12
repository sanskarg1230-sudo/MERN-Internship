import { NavLink } from "react-router-dom";

function PublicNavbar() {
  return (
    <nav className="navbar">
      <h2>MERN Auth</h2>

      <div className="nav-links">
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? "nav-btn active" : "nav-btn"
          }
        >
          Login
        </NavLink>

        <NavLink
          to="/register"
          className={({ isActive }) =>
            isActive ? "nav-btn active" : "nav-btn"
          }
        >
          Register
        </NavLink>
      </div>
    </nav>
  );
}

export default PublicNavbar;