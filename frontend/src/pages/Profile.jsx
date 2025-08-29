// Profile.jsx
import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { BASE_URL } from "../api/api";

export default function Profile() {
  const formatMoney = (n) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const [userData, setUserData] = useState({});
  const [orders, setOrder] = useState([]);
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          axiosInstance.get("api/profile/"),
          // axiosInstance.get("orders/"),
        ]);
        setUserData(profileRes.data);
        // setOrder(ordersRes.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");

    try {
      await axiosInstance.post("api/logout/", { refresh });
    } catch (err) {
      console.log(err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Profile Card */}
      <section className="rounded-md bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">My Profile</h1>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="font-semibold text-zinc-900">Username:</dt>
                <dd className="text-zinc-700">{userData.username}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold text-zinc-900">Email:</dt>
                <dd className="text-zinc-700">{userData.email}</dd>
              </div>
            </dl>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Purchase History */}
      <section className="rounded-md bg-white p-6 shadow">
        <h2 className="text-3xl font-semibold text-zinc-900">
          Purchase History
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-zinc-600">
              <tr className="[&>th]:py-2 [&>th]:text-left">
                <th className="w-40">Product Image</th>
                <th>Product Name</th>
                <th>Purchase Date</th>
                <th>Quantity</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {orders.map((o, i) => (
                <tr key={i} className="align-middle">
                  <td className="py-4">
                    <img
                      src={o.image}
                      alt={o.name}
                      className="h-12 w-24 object-contain"
                    />
                  </td>
                  <td className="py-4">{o.name}</td>
                  <td className="py-4">{formatDate(o.date)}</td>
                  <td className="py-4">{o.qty}</td>
                  <td className="py-4">{formatMoney(o.amount)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-zinc-500">
                    No purchases yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
