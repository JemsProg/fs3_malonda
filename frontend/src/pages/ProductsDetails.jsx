import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/api";
import Loading from "../components/Loading";

/* Reusable modal */
const Modal = ({ open, onClose, title, children, actions = null }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-xl mx-3 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="mt-3 text-sm text-gray-600">{children}</div>
        <div className="mt-5 flex items-center justify-end gap-2">
          {actions}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const [productDetails, setProductDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [errorKind, setErrorKind] = useState(null); // 'auth' | 'stock' | 'other'

  const { product_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await axios.get(`${BASE_URL}api/products/${product_id}/`);
        setProductDetails(res.data);
      } catch (err) {
        console.log(err);
        setModalMsg("Failed to load product.");
        setErrorKind("other");
        setErrorOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductDetails();
  }, [product_id]);

  const increment = () => {
    if (quantity < (productDetails.countInStock || 0))
      setQuantity((q) => q + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorKind("auth");
      setModalMsg("Please log in to add items to your cart.");
      setErrorOpen(true);
      return;
    }

    if (!productDetails.countInStock || productDetails.countInStock <= 0) {
      setErrorKind("stock");
      setModalMsg("Sorry, this item is out of stock.");
      setErrorOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      const productPk =
        productDetails.id ?? productDetails.product_id ?? Number(product_id);
      await axios.post(
        `${BASE_URL}api/cart/add/`,
        { product_id: productPk, qty: Number(quantity) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessOpen(true);
      setModalMsg(`${productDetails.product_name} added to cart ✅`);
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        setErrorKind("auth");
        setModalMsg("Session expired. Please log in again.");
      } else {
        setErrorKind("other");
        setModalMsg("Could not add to cart. Please try again.");
      }
      setErrorOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  const price = productDetails.product_price
    ? Number(productDetails.product_price).toLocaleString(undefined, {
        style: "currency",
        currency: "PHP",
      })
    : "";

  const outOfStock =
    !productDetails.countInStock || productDetails.countInStock <= 0;

  return (
    <>
      <div className="max-w-6xl h-screen pt-50 mx-auto p-6 flex flex-col md:flex-row gap-10">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={`${BASE_URL}${productDetails.image}`}
            alt={productDetails.product_name || "Product"}
            className="w-full max-w-md object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-2">
            {productDetails.product_name}
          </h1>

          <p className="text-xl text-gray-700 mb-2">{price}</p>

          <p className="text-sm text-gray-600 mb-4">
            Available Stocks:{" "}
            <span
              className={`font-semibold ${outOfStock ? "text-red-600" : ""}`}
            >
              {productDetails.countInStock}
            </span>
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={decrement}
              className="w-8 h-8 bg-blue-900 text-white text-lg font-semibold rounded disabled:opacity-50"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="w-10 text-center">{quantity}</span>
            <button
              onClick={increment}
              className="w-8 h-8 bg-blue-900 text-white text-lg font-semibold rounded disabled:opacity-50"
              disabled={quantity >= (productDetails.countInStock || 0)}
            >
              +
            </button>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={submitting || outOfStock}
            className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Adding..."
              : outOfStock
              ? "Out of Stock"
              : "Add to cart"}
          </button>

          {/* Description */}
          <div className="mt-10">
            <h2 className="text-sm font-semibold mb-2">Description</h2>
            <p className="text-sm text-gray-600">
              {productDetails.description}
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Added to Cart"
      >
        <p>{modalMsg}</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            className="px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800"
            onClick={() => navigate("/cart")}
          >
            View Cart
          </button>
          <button
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            onClick={() => setSuccessOpen(false)}
          >
            Continue Shopping
          </button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal open={errorOpen} onClose={() => setErrorOpen(false)} title="Oops!">
        <p>{modalMsg}</p>
        <div className="mt-4 flex items-center gap-2">
          {errorKind === "auth" ? (
            <button
              className="px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default ProductDetails;
