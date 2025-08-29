import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { BASE_URL } from "../api/api";

/* ------- Reusable Modals ------- */
const ModalShell = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      <div
        className="relative w-full sm:max-w-md bg-white rounded-2xl shadow-2xl mx-3 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="mt-3 text-sm text-gray-700">{children}</div>
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

const ErrorModal = ({ open, onClose, message, kind = "other", onLogin }) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title="Something went wrong"
    actions={
      kind === "auth" ? (
        <button
          onClick={onLogin}
          className="px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800"
        >
          Log in
        </button>
      ) : null
    }
  >
    <p>{message}</p>
  </ModalShell>
);

const ConfirmModal = ({
  open,
  onClose,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  onConfirm,
}) => (
  <ModalShell
    open={open}
    onClose={onClose}
    title={title}
    actions={
      <button
        onClick={onConfirm}
        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
      >
        {confirmText}
      </button>
    }
  >
    <p>{message}</p>
  </ModalShell>
);
/* -------------------------------- */

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "PHP",
  });

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  // Error modal state
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKind, setErrorKind] = useState("other"); // 'auth' | 'other'

  // Confirm remove modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemove, setToRemove] = useState({ id: null, name: "", subtotal: 0 });

  const [checkout, setCheckout] = useState({
    full_name: "",
    address: "",
    city: "",
    postal_code: "",
    country: "Philippines",
    email: "",
    mobile: "",
  });

  const navigate = useNavigate();

  const openError = (msg, kind = "other") => {
    setErrorMsg(msg);
    setErrorKind(kind);
    setErrorOpen(true);
  };

  // Load cart
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("cart/");
        setCartItems(data);
      } catch (e) {
        console.error(e);
        if (e?.response?.status === 401) {
          openError("Please log in to view your cart.", "auth");
        } else {
          openError("Failed to load cart. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Presentational mapping
  const viewItems = useMemo(
    () =>
      cartItems.map((it) => ({
        id: it.cart_id,
        name: it.product?.product_name,
        price: Number(it.product?.product_price || 0),
        quantity: Number(it.qty || 0),
        image: it.product?.image ? `${BASE_URL}${it.product.image}` : "",
        countInStock: Number(it.product?.countInStock || 0),
      })),
    [cartItems]
  );

  const total = useMemo(
    () => viewItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [viewItems]
  );

  const syncQty = async (cartId, newQty) => {
    try {
      await axiosInstance.put(`cart/${cartId}/`, { qty: newQty });
      setCartItems((items) =>
        items.map((it) => (it.cart_id === cartId ? { ...it, qty: newQty } : it))
      );
    } catch (e) {
      console.error(e);
      openError("Could not update quantity. Please try again.");
    }
  };

  const increment = (cartId) => {
    const item = viewItems.find((i) => i.id === cartId);
    if (!item) return;
    const capped = Math.min(item.quantity + 1, item.countInStock || 0);
    if (capped !== item.quantity) syncQty(cartId, capped);
  };

  const decrement = (cartId) => {
    const item = viewItems.find((i) => i.id === cartId);
    if (!item) return;
    const next = Math.max(1, item.quantity - 1);
    if (next !== item.quantity) syncQty(cartId, next);
  };

  // Prompt remove
  const promptRemove = (item) => {
    setToRemove({
      id: item.id,
      name: item.name,
      subtotal: item.price * item.quantity,
    });
    setConfirmOpen(true);
  };

  // Confirm removal
  const confirmRemove = async () => {
    const id = toRemove.id;
    setConfirmOpen(false);
    try {
      await axiosInstance.delete(`cart/${id}/delete/`);
      setCartItems((items) => items.filter((it) => it.cart_id !== id));
    } catch (e) {
      console.error(e);
      openError("Could not remove item. Please try again.");
    } finally {
      setToRemove({ id: null, name: "", subtotal: 0 });
    }
  };

  const onCheckoutChange = (e) => {
    const { name, value } = e.target;
    setCheckout((c) => ({ ...c, [name]: value }));
  };

  const proceedToCheckout = async () => {
    if (viewItems.length === 0) {
      openError("Your cart is empty.");
      return;
    }

    const required = [
      "full_name",
      "address",
      "city",
      "postal_code",
      "country",
      "email",
    ];
    const missing = required.filter((k) => !checkout[k]?.trim());
    if (missing.length) {
      openError(`Please complete: ${missing.join(", ")}.`);
      return;
    }

    setCheckingOut(true);
    try {
      const payload = { total_price: total, ...checkout };
      const { data } = await axiosInstance.post(
        "api/payments/create/",
        payload
      );
      if (data?.checkout_url) {
        window.location.href = data.checkout_url; // PayMongo hosted checkout
      } else {
        openError("Payment link not returned. Please try again.");
      }
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 401) {
        openError("Your session has expired. Please log in again.", "auth");
      } else {
        const errMsg = e?.response?.data?.error
          ? typeof e.response.data.error === "string"
            ? e.response.data.error
            : JSON.stringify(e.response.data.error)
          : "Failed to create payment. Please try again.";
        openError(errMsg);
      }
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl h-screen mx-auto p-6 grid md:grid-cols-[1fr_360px] gap-6">
        <div>
          <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

          {loading ? (
            <div className="rounded-2xl bg-white shadow-md p-10 text-center text-gray-500">
              Loading cart…
            </div>
          ) : viewItems.length === 0 ? (
            <div className="rounded-2xl bg-white shadow-md p-10 text-center text-gray-500">
              Your cart is empty.
            </div>
          ) : (
            <div className="rounded-2xl bg-white shadow-lg overflow-hidden divide-y divide-gray-100">
              {viewItems.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center gap-4 p-4 sm:px-6 grid-cols-[96px_1fr_auto_auto]"
                >
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded shrink-0 shadow-sm"
                    loading="lazy"
                  />

                  {/* Title / price */}
                  <div className="min-w-0">
                    <h2 className="font-semibold truncate">{item.name}</h2>
                    <p className="text-sm text-gray-500">
                      {currency(item.price)}
                    </p>
                    {item.countInStock <= 5 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {item.countInStock > 0
                          ? `Only ${item.countInStock} left`
                          : "Out of stock"}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => decrement(item.id)}
                      className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100 shadow-sm focus:outline-none disabled:opacity-50"
                      aria-label="Decrease quantity"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100 shadow-sm focus:outline-none disabled:opacity-50"
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.countInStock}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => promptRemove(item)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                    <span className="font-semibold">
                      {currency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between p-4 sm:px-6">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold">{currency(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Checkout */}
        <aside className="md:sticky md:top-6 h-fit">
          <div className="rounded-2xl bg-white shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-3">Checkout</h2>
            <div className="space-y-3">
              <input
                name="full_name"
                value={checkout.full_name}
                onChange={onCheckoutChange}
                placeholder="Full name"
                className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
              />
              <input
                name="email"
                value={checkout.email}
                onChange={onCheckoutChange}
                placeholder="Email"
                type="email"
                className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
              />
              <input
                name="mobile"
                value={checkout.mobile}
                onChange={onCheckoutChange}
                placeholder="Mobile (optional)"
                className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
              />
              <input
                name="address"
                value={checkout.address}
                onChange={onCheckoutChange}
                placeholder="Address"
                className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="city"
                  value={checkout.city}
                  onChange={onCheckoutChange}
                  placeholder="City"
                  className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
                />
                <input
                  name="postal_code"
                  value={checkout.postal_code}
                  onChange={onCheckoutChange}
                  placeholder="Postal Code"
                  className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
                />
              </div>
              <input
                name="country"
                value={checkout.country}
                onChange={onCheckoutChange}
                placeholder="Country"
                className="w-full rounded px-3 py-2 shadow-sm focus:outline-none"
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{currency(total)}</span>
            </div>

            <button
              onClick={proceedToCheckout}
              disabled={checkingOut || loading || viewItems.length === 0}
              className="mt-4 w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
            >
              {checkingOut ? "Creating Payment Link..." : "Proceed to Checkout"}
            </button>

            <p className="text-xs text-gray-500 mt-2">
              You’ll be redirected to PayMongo (GCash) to complete payment.
            </p>
          </div>
        </aside>
      </div>

      {/* Error Modal (all errors funnel here) */}
      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMsg}
        kind={errorKind}
        onLogin={() => navigate("/login")}
      />

      {/* Confirm Remove Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove item?"
        message={
          <>
            <div className="font-medium">{toRemove.name}</div>
            <div className="text-gray-600">
              This will remove the item from your cart.
            </div>
            {toRemove.subtotal > 0 && (
              <div className="mt-2 text-sm">
                Subtotal: {currency(toRemove.subtotal)}
              </div>
            )}
          </>
        }
        confirmText="Remove"
        onConfirm={confirmRemove}
      />
    </>
  );
};

export default Cart;
