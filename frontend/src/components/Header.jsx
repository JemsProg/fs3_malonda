import { useContext } from "react";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";

const Header = () => {
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-lg font-bold">RIVANSH</h1>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link
            to="/products-items-list"
            className="text-gray-700 hover:text-gray-900"
          >
            Products
          </Link>
          <Link to="/teams" className="text-gray-700 hover:text-gray-900">
            Team
          </Link>

          {/* Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="text-xl text-primary hover:text-primary-hover"
                >
                  <FaShoppingCart />
                </Link>
                <Link
                  to="/profile"
                  className="text-xl text-primary hover:text-primary-hover"
                >
                  <FaUserCircle />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="#"
                  className="px-4 py-2 border border-blue-900 text-blue-900 rounded-md hover:bg-blue-50 transition"
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
