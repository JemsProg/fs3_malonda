// src/pages/Page404.jsx
import React from "react";

const Page404 = () => {
  const handleBack = () => window.history.back();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0e2146] via-slate-900 to-[#0b1533]">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400 blur-3xl" />
      </div>

      {/* Ghost 404 watermark */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="text-[22rem] font-black tracking-tighter text-white/5 select-none leading-none">
          404
        </span>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          {/* Icon tile */}
          <div className="mx-auto mb-6 inline-flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <svg
              viewBox="0 0 48 48"
              className="h-12 w-12 text-white/90"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {/* broken link icon */}
              <path d="M17 31 8 40a6 6 0 0 0 8.5 8.5l8.5-8.5" />
              <path d="M31 17 40 8a6 6 0 0 0-8.5-8.5L23 8" />
              <path d="M19 29l10-10" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Page not found
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-slate-200/80">
            Mukhang na-type mo ang maling link o na-move na ang page. Try a
            search below or go back to safety.
          </p>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Go home
            </a>
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Go back
            </button>
            <a
              href="mailto:support@example.com?subject=Report%20a%20broken%20link"
              className="inline-flex items-center justify-center rounded-lg border border-white/25 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              Report issue
            </a>
          </div>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q");
              if (q)
                window.location.href = `/search?q=${encodeURIComponent(q)}`;
            }}
            className="mx-auto mt-8 max-w-md"
          >
            <div className="relative">
              <input
                name="q"
                placeholder="Search the site…"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-24 text-white placeholder-white/60 outline-none backdrop-blur focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Page404;
