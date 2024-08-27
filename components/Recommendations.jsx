"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Loading from "@app/loading";

const Recommendations = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRec = async () => {
      try {
        const res = await axios.get("/api/recommendations");
        setRecommendedProducts(res.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch recommendations");
        setLoading(false);
      } finally {
        setError("");
        setLoading(false);
      }
    };
    fetchRec();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(price)
      .replace("Rp", "Rp.");
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <p className="p-6 rounded-md bg-white text-2xl text-main font-bold flex-center">
        {error}
      </p>
    );
  const topRecommendedProducts = recommendedProducts.slice(0, 4);
  return (
    <div className="flex-center flex-col pt-4">
      <h2 className="text-white text-2xl font-bold border-b-2 w-full text-center pb-2">
        Recommended Products
      </h2>
      <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-8 p-4 mt-4 mb-8">
        {topRecommendedProducts.map((product) => (
          <Link
            key={product._id}
            href={`/detail/${product._id}`}
            className="relative cursor-pointer border border-white bg-white text-main hover:scale-105 transition-all rounded-md overflow-hidden"
          >
            <Image
              src={`/${product.images}`}
              alt={product.name}
              width={300}
              height={300}
              className="max-h-80 object-scale-down mb-28 sm:mb-22 p-4"
            />

            <div className="flex flex-col font-sans bg-main text-white font-bold md:text-xl text-md p-4 text-center gap-2 absolute bottom-0 left-0 right-0">
              <h1>{product.name}</h1>
              <h1>{formatPrice(product.price)}</h1>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
