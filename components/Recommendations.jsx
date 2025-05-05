"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Loading from "@app/loading";
import { useSession } from "next-auth/react";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { formatPrice } from "@utils/utils";

const Recommendations = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = session ? "/api/recommendations" : "/api/mostSold";
        const res = await axios.get(endpoint);
        setProducts(res.data);
      } catch (error) {
        const errorMessage = session
          ? "Failed to fetch recommendations"
          : "Failed to fetch popular products";
        setError(errorMessage);
      } finally {
        setError("");
        setLoading(false);
      }
    };

    fetchProducts();
  }, [session]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div
          className="p-6 rounded-lg bg-white
       backdrop-blur-sm border border-white/20 text-center"
        >
          <p className="text-xl text-white font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white text-main rounded-full font-medium hover:bg-white/90 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const topProducts = products.slice(0, 4);
  const sectionTitle = session
    ? "Recommended For You"
    : "Most Popular Products";

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-white">{sectionTitle}</h2>
          </div>
          <p className="text-white/70 text-center max-w-2xl">
            {session
              ? "Products selected just for you based on your preferences and browsing history."
              : "Our customers' favorite picks that have been trending recently."}
          </p>
          <div className="w-24 h-1 bg-white/30 rounded-full mt-4"></div>
        </div>

        {/* Product Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 md:gap-8">
          {topProducts.map((product) => (
            <Link
              key={product._id}
              href={`/detail/${product._id}`}
              className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/30 hover:translate-y-[-4px] hover:shadow-lg hover:shadow-white/5"
            >
              {/* Product Image */}
              <div className="relative h-56 md:h-64 p-6 bg-white flex items-center justify-center">
                <div className="transition-transform duration-300 group-hover:scale-110 w-full h-full relative">
                  <Image
                    src={`/${product.images}`}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center justify-center gap-2 p-5 flex-grow">
                <h3 className="font-medium text-white text-lg  line-clamp-1">
                  {product.name}
                </h3>

                <div className="flex items-center ">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${
                          i < (product.rating || 4)
                            ? "text-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-xs ml-1">
                    (
                    {product.reviewCount ||
                      Math.floor(Math.random() * 100) + 10}
                    )
                  </span>
                </div>

                {/* Product Price */}
                <div className="mt-auto border-t border-white/10 flex justify-between items-center">
                  <p className="font-bold text-white text-lg">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            href="/"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            View All Products
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
