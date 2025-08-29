import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Teams from "./pages/Teams";
import Page404 from "./pages/Page404";
import ProductDetails from "./pages/ProductsDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";

import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./context/PrivateRoute";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products-items-list" element={<Products />} />
            <Route path="/product/:product_id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="*" element={<Page404 />} />
          </Routes>

          <Footer />
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
