import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../api/api";
import { useLocation, Link } from "react-router-dom";
import Loading from "./Loading";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation().pathname;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/products/`);
        setProducts(response.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProducts();
    console.log(location);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <section className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 py-10 sm:py-12">
        {/* Title */}
        <h2 className="text-center text-[#0e2146] text-2xl sm:text-3xl font-bold tracking-wide">
          PRODUCT LIST
        </h2>

        {/* Grid */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
          {(location == "/" ? products.slice(0, 6) : products).map((p) => (
            <div
              key={p.product_id}
              className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 p-4 md:p-5 flex flex-col gap-4 hover:shadow-md transition"
            >
              <Link to={`/product/${p.product_id}`}>
                <img
                  src={`${BASE_URL}${p.image}`}
                  alt={p.product_name}
                  className="w-full h-32 sm:h-36 object-contain select-none"
                  draggable="false"
                />

                <div className="mt-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                      {p.product_name}
                    </h3>
                    <span className="text-xs sm:text-sm text-slate-700">
                      ${p.product_price}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                      {p.brand}
                    </p>

                    <button
                      type="button"
                      className="rounded-md bg-[#0e2146] px-3 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#0b1a38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e2146]"
                    >
                      BUY
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* View all button */}
        {location === "/" && (
          <div className="mt-10 sm:mt-12 flex justify-center">
            <button
              type="button"
              className="rounded-md bg-[#0e2146] px-5 sm:px-6 py-2 text-sm font-semibold text-white hover:bg-[#0b1a38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0e2146]"
            >
              View all products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
