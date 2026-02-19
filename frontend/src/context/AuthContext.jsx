import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post("/auth/login/", { username, password });
      const { access, refresh, user: userData } = response.data;

      // Store tokens
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      return { success: false, error: message };
    }
  };

  const register = async (username, password, email) => {
    try {
      const response = await api.post("/auth/register/", {
        username,
        password,
        email,
      });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) return false;

      const response = await api.post("/auth/refresh/", { refresh });
      localStorage.setItem("accessToken", response.data.access);
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh);
      }
      return true;
    } catch {
      logout();
      return false;
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post("/auth/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to change password";
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.is_admin || false,
    loading,
    login,
    register,
    logout,
    refreshToken,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
