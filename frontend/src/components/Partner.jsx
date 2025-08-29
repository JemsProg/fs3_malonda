// src/components/Partner.jsx
import React from "react";

/** Simple inline "KISKO" logo to mirror the mockup */
function KiskoLogo({ className = "" }) {
  return (
    <svg
      viewBox="0 0 220 84"
      className={className}
      role="img"
      aria-label="KISKO"
    >
      {/* bars */}
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <path d="M30 22 v22" />
        <path d="M50 14 v30" />
        <path d="M70 26 v18" />
        <path d="M90 10 v34" />
        <path d="M110 22 v22" />
        <path d="M130 14 v30" />
        <path d="M150 26 v18" />
        <path d="M170 18 v26" />
      </g>
      {/* wordmark */}
      <g transform="translate(18,58)" fill="currentColor">
        <text
          x="0"
          y="16"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="700"
          fontSize="28"
          letterSpacing="6"
        >
          KISKO
        </text>
      </g>
    </svg>
  );
}

const logos = Array.from({ length: 8 }, () => ({ name: "KISKO" }));

export default function Partner() {
  return (
    <section className="bg-[#0B1F4A] py-10 md:py-14">
      <div className="mx-auto w-full max-w-7xl px-4">
        <h2 className="text-white text-xl md:text-2xl font-semibold">
          Our Partner
        </h2>

        {/* Carousel */}
        <div className="relative mt-6 md:mt-8">
          {/* edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#0B1F4A] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#0B1F4A] to-transparent" />

          {/* track (duplicated content for seamless loop) */}
          <div className="group overflow-hidden">
            <div className="flex gap-6 md:gap-10 will-change-transform animate-[partner-scroll_22s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...logos, ...logos].map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 grid place-items-center bg-white rounded-lg shadow-md h-28 w-48 md:h-32 md:w-64"
                >
                  <KiskoLogo className="h-16 w-auto text-sky-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* component-scoped styles for the scrolling animation */}
      <style>{`
        @keyframes partner-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* move past the first set */
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-[partner-scroll_22s_linear_infinite] {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
