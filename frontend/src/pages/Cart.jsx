// src/components/Cart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";
import { BASE_URL } from "../api/api";

const API_PREFIX = "api/";

const fmt = (n) =>
  (Number(n) || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchCart = async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await axiosInstance.get(`${API_PREFIX}cart/`);
      setItems(data);
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.status === 401
          ? "Your session expired. Please sign in again."
          : "Failed to load cart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, i) => s + (i.product?.product_price || 0) * (i.qty || 1),
        0
      ),
    [items]
  );

  const updateQty = async (cartId, delta) => {
    const current = items.find((i) => i.cart_id === cartId);
    if (!current) return;
    const newQty = Math.max(1, (current.qty || 1) + delta);

    // Optimistic UI
    setItems((prev) =>
      prev.map((i) => (i.cart_id === cartId ? { ...i, qty: newQty } : i))
    );

    try {
      const { data } = await axiosInstance.put(
        `${API_PREFIX}cart/update/${cartId}/`,
        { qty: newQty }
      );
      // sync with server (qty, price, etc.)
      setItems((prev) => prev.map((i) => (i.cart_id === cartId ? data : i)));
    } catch (e) {
      console.error(e);
      // rollback on failure
      setItems((prev) => prev.map((i) => (i.cart_id === cartId ? current : i)));
      alert("Unable to update quantity.");
    }
  };

  const removeItem = async (cartId) => {
    const snapshot = items;
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.cart_id !== cartId));
    try {
      await axiosInstance.delete(`${API_PREFIX}cart/remove/${cartId}/`);
    } catch (e) {
      console.error(e);
      setItems(snapshot); // rollback
      alert("Unable to remove item.");
    }
  };

  return (
    <div className="bg-[#F5F6FA] min-h-[60vh] py-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 grid gap-8 md:grid-cols-[2fr_1fr]">
        {/* Cart Panel */}
        <section className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-semibold">Shopping Cart</h1>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              Loading your cart…
            </div>
          ) : err ? (
            <div className="px-6 py-10 text-center text-sm text-red-600">
              {err}
            </div>
          ) : (
            <div className="divide-y">
              {items.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">
                  Your cart is empty.
                </div>
              ) : (
                items.map((item) => (
                  <article key={item.cart_id} className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={`${BASE_URL}${item.product.image}`}
                        alt={item.product.product_name}
                        className="h-14 w-24 rounded object-cover ring-1 ring-gray-200"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {item.product.product_name}
                        </p>

                        <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="mr-1">Qty:</span>
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateQty(item.cart_id, -1)}
                              className="grid h-7 w-7 place-items-center rounded-full border border-gray-300 hover:bg-gray-50"
                            >
                              <FiMinus />
                            </button>
                            <span className="inline-block w-6 text-center font-medium text-gray-900">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateQty(item.cart_id, 1)}
                              className="grid h-7 w-7 place-items-center rounded-full border border-gray-300 hover:bg-gray-50"
                            >
                              <FiPlus />
                            </button>
                          </div>

                          <span className="text-xs text-gray-500">
                            Price: {fmt(item.product.product_price)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.cart_id)}
                        className="ml-2 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* Summary Panel */}
        <aside className="bg-white rounded-lg shadow-md h-max">
          <div className="px-6 py-5">
            <h2 className="text-xl font-semibold text-center">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">{fmt(subtotal)}</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex items-center justify-between text-base">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{fmt(subtotal)}</span>
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-md bg-[#142A59] py-2.5 text-white font-medium hover:opacity-95 active:opacity-90"
                onClick={() => alert("Proceeding to checkout…")}
              >
                Checkout
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
