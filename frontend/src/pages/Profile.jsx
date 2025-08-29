import React, { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { BASE_URL } from "../api/api";

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "PHP",
  });

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [orders, setOrders] = useState([]); // API: list of payments with items + shipping
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { setLoading, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          axiosInstance.get("profile/"),
          axiosInstance.get("orders/"),
        ]);
        setUserData(profileRes.data);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Profile/orders load error:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchAll();
  }, []);

  // Flatten to item-rows for the table
  const rows = useMemo(() => {
    const out = [];
    for (const ord of orders) {
      const date = ord.paid_at || null;
      const paymentId = ord.payment_id;
      const status = ord.paymongo_status || (ord.is_paid ? "paid" : "unpaid");
      const items = ord.items || [];
      for (const it of items) {
        const prod = it.product || null;
        out.push({
          key: `${paymentId}-${it.order_id}`,
          paymentId,
          status,
          date,
          name: prod?.product_name || "Product unavailable",
          image: prod?.image ? `${BASE_URL}${prod.image}` : "",
          qty: it.qty,
          amount: it.line_total ?? it.qty * Number(it.price || 0),
        });
      }
    }
    return out;
  }, [orders]);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    setLoading(true);
    try {
      await axiosInstance.post("logout/", { refresh });
    } catch (err) {
      console.warn(
        "Logout request failed (continuing):",
        err?.response?.data || err.message
      );
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      setLoading(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="p-6 min-h-screen space-y-10 max-w-6xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white shadow-md p-6 rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">My Profile</h2>
          <p>
            <span className="font-semibold">Username:</span> {userData.username}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {userData.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Purchase History */}
      <div className="bg-white shadow-md p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Purchase History</h2>
          {orders.length > 0 && (
            <span className="text-sm text-gray-500">
              {orders.length} order{orders.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loadingOrders ? (
          <div className="rounded-xl bg-white p-10 text-center text-gray-500">
            Loading orders…
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-600">
            No purchases yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="pb-2">Product</th>
                  <th className="pb-2">Name</th>
                  <th className="pb-2">Purchase Date</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr key={r.key} className="hover:bg-gray-50">
                    <td className="py-3">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-20 h-auto object-contain rounded shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded grid place-items-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="pr-2">{r.name}</td>
                    <td className="pr-2">{formatDate(r.date)}</td>
                    <td className="pr-2">{r.qty}</td>
                    <td className="pr-2 font-semibold">{currency(r.amount)}</td>
                    <td className="pr-2">{r.paymentId}</td>
                    <td className="pr-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                          r.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals by order (optional): show a card per order */}
            {/* If you want an expandable per-order view with shipping, say the word and I'll add it. */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
