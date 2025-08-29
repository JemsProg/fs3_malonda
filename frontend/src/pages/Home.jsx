import React from "react";
import Hero_img from "../assets/hero_image.png";
import OneStopSection from "../components/OneStopSection";
import ProductList from "../components/ProductList";
import Partner from "../components/Partner";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col-reverse 2xl:flex-row flex-wrap justify-center items-center gap-30 p-10 sm md lg">
        {/* left panel */}
        <div className="flex flex-col gap-10 w-150">
          <h1 className="text-3xl font-bold">Sit and shop, we got you!</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <a>Shop Now</a>
        </div>

        {/* right panel */}
        <div>
          <img className="h-130" src={Hero_img} alt="hero image" />
        </div>
      </div>

      <OneStopSection />
      <ProductList />
      <Partner />
    </div>
  );
};

export default Home;
