import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import Loading_Page from "../components/Loading";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, Loading } = useContext(AuthContext);

  if (Loading)
    return (
      <div>
        <Loading_Page />
      </div>
    );

  return isAuthenticated ? children : <Navigate to="/login" />;
};
