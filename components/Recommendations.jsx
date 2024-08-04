import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

const Recommendations = ({ productId }) => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`/api/recommendations/${productId}`);
        setRecommendedProducts(response.data);
      } catch (err) {
        setError("Failed to load recommendations");
        console.error("Error fetching recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(price)
      .replace("Rp", "Rp.");
  };
  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Recommended Products</h2>
      <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-8 p-4 mt-4 mb-8 ">
        {recommendedProducts.map((product) => (
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
