import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleLogin } from "../api/AuthApi";
import { AuthContext } from "../context/AuthProvider";

export default function Login() {
  const navigate = useNavigate(); // optional redirect after login
  const [values, setValues] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  const validate = (v) => {
    const e = {};
    if (!v.username.trim()) e.username = "Username is required.";
    else if (v.username.trim().length < 3)
      e.username = "Username must be at least 3 characters.";
    if (!v.password) e.password = "Password is required.";
    else if (v.password.length < 4)
      e.password = "Password must be at least 4 characters.";
    return e;
  };

  const handleChange = (field) => (ev) => {
    const next = { ...values, [field]: ev.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const handleBlur = (field) => () => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setErrors(validate(values));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // force validation on submit
    const allTouched = { username: true, password: true };
    setTouched(allTouched);
    const v = validate(values);
    setErrors(v);
    if (Object.keys(v).length) return;

    setApiError("");
    setLoading(true);
    try {
      await handleLogin(
        values.username.trim(),
        values.password,
        setIsAuthenticated
      );

      navigate("/profile", { replace: true });
    } catch (err) {
      setApiError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const hasError = (name) => touched[name] && errors[name];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-semibold text-[#0e1f4a]">Sign In</h1>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={values.username}
              onChange={handleChange("username")}
              onBlur={handleBlur("username")}
              aria-invalid={!!hasError("username")}
              className={`block w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 ${
                hasError("username")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#0e1f4a]"
              }`}
            />
            {hasError("username") && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange("password")}
              onBlur={handleBlur("password")}
              aria-invalid={!!hasError("password")}
              className={`block w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 ${
                hasError("password")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-[#0e1f4a]"
              }`}
            />
            {hasError("password") && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading || Object.keys(validate(values)).length > 0}
            className="w-full rounded-md bg-[#0e1f4a] py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <Link to="/register">
          <p className="mt-4 text-xs text-gray-700">Don’t have account yet?</p>
        </Link>
      </div>
    </div>
  );
}
