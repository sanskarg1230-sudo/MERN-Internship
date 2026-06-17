import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api/auth";

  // Configure Axios default header
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  const loadUser = async (authToken) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      const res = await axios.get(`${API}/profile`);
      const userData = res.data;
      if (userData && userData.role) {
        userData.role = userData.role.toLowerCase();
      }
      setUser(userData);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role ? res.data.role.toLowerCase() : "customer",
      });
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      return { success: true, user: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post(`${API}/register`, {
        name,
        email,
        password,
        role,
      });
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role ? res.data.role.toLowerCase() : "customer",
      });
      localStorage.setItem("token", res.data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      return { success: true, user: res.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  useEffect(() => {
    if (token) {
      loadUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
