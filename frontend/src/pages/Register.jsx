// Register.jsx
import React from "react";

export default function Register() {
  // Static UI (no logic) — prevent page refresh on submit
  const onSubmit = (e) => e.preventDefault();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-semibold text-[#0e1f4a]">Sign Up</h1>

        <form onSubmit={onSubmit} className="space-y-4">
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0e1f4a]"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0e1f4a]"
            />
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
              autoComplete="new-password"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0e1f4a]"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-xs font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#0e1f4a]"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-[#0e1f4a] py-2 text-sm font-medium text-white hover:opacity-95 active:opacity-90"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-700">I already had an account.</p>
      </div>
    </div>
  );
}
