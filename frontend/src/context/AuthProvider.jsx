import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [Loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setLoading(false);
    console.log(isAuthenticated);
  }, [location]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, Loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
