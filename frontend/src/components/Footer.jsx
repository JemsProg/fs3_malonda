// src/components/Footer.jsx
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0B1F4A] text-white py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-20">
          {/* Logo & Social */}
          <div>
            <div className="mb-6">
              <div className="bg-white text-[#0B1F4A] font-extrabold text-lg px-2 py-1 inline-block">
                LFT
              </div>
            </div>
            <div className="flex gap-5 text-sm">
              <a href="#" className="hover:underline">
                Facebook
              </a>
              <a href="#" className="hover:underline">
                Instagram
              </a>
              <a href="#" className="hover:underline">
                LinkedIn
              </a>
              <a href="#" className="hover:underline">
                Pinterest
              </a>
            </div>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-sm mb-3">Wir halten dich auf dem laufenden</p>
              <form className="flex items-center border-b border-white/50 max-w-xs">
                <input
                  type="email"
                  placeholder="Deine E-Mail Adresse"
                  className="bg-transparent text-sm placeholder-white/70 flex-1 py-2 outline-none"
                />
                <button
                  type="submit"
                  className="ml-2 text-white hover:text-gray-300"
                >
                  ↗
                </button>
              </form>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Quick links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:underline">
                  So gehts
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Erfahrung
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Aligner
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Preise
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Standorte
                </a>
              </li>
            </ul>
          </div>

          {/* Newz */}
          <div>
            <h4 className="font-semibold mb-4">Newz</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Lift Media
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Offene Stellen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Presse kit
                </a>
              </li>
            </ul>
          </div>

          {/* Behandlung */}
          <div>
            <h4 className="font-semibold mb-4">Behandlung</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:underline">
                  Gratis Termin
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Freunde einladen
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Patienteninformationen
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 space-y-4 md:space-y-0">
          <p>© 2020 Lift Media. All right reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">
              Datenschutz
            </a>
            <a href="#" className="hover:underline">
              Impressum
            </a>
            <a href="#" className="hover:underline">
              Cookie Policy
            </a>
            <a href="#" className="hover:underline">
              AGBs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
