import React from "react";
import {
  FiFileText, // Browse
  FiShoppingCart, // Add to cart
  FiTrendingUp, // Checkout
  FiCreditCard, // Payment
  FiClock, // Then wait
} from "react-icons/fi";

const steps = [
  { title: "BROWSE", Icon: FiFileText },
  { title: "ADD TO CART", Icon: FiShoppingCart },
  { title: "CHECKOUT", Icon: FiTrendingUp },
  { title: "PAYMENT", Icon: FiCreditCard },
  { title: "THEN WAIT", Icon: FiClock },
];

const OneStopSection = () => {
  return (
    <section className="w-full bg-[#0e2146]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
        {/* Heading + subtext */}
        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide">
          ONE STOP ONE SHOP
        </h2>
        <p className="mt-4 max-w-3xl text-slate-200/80 text-sm sm:text-base leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>

        {/* Steps grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {steps.map(({ title, Icon }) => (
            <div
              key={title}
              className="group rounded-xl bg-white/95 shadow-sm ring-1 ring-slate-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="rounded-lg bg-slate-100 p-4 ring-1 ring-slate-200">
                <Icon className="h-7 w-7 md:h-8 md:w-8 text-[#0e2146]" />
              </div>
              <div className="mt-4 text-xs sm:text-sm font-semibold tracking-wide text-[#0e2146]">
                {title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OneStopSection;
