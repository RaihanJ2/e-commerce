"use client";
import Loading from "@app/loading";
import { formatPrice, getImageUrl } from "@utils/utils";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const ItemList = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [displayProducts, setDisplayProducts] = useState(8);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/product");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategory = useCallback((category) => {
    setSelectedCategory(category);
    setDisplayProducts(8);
  }, []);

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  const filteredProducts = useMemo(() => {
    return selectedCategory
      ? products.filter((product) => product.category === selectedCategory)
      : products;
  }, [selectedCategory, products]);

  const productsToDisplay = useMemo(
    () => filteredProducts.slice(0, displayProducts),
    [filteredProducts, displayProducts]
  );

  const loadMore = () => {
    setDisplayProducts(displayProducts + 8);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Category Filter */}
      <div className="bg-primary-light/30 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              !selectedCategory
                ? "bg-primary-lightest text-primary-darkest shadow-lg"
                : "bg-primary-dark/60 text-primary-lightest hover:bg-primary-lightest/20 border border-primary-lightest/30"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary-lightest text-primary-darkest shadow-lg"
                  : "bg-primary-dark/60 text-primary-lightest hover:bg-primary-lightest/20 border border-primary-lightest/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-primary-dark">
          <span className="font-semibold">{filteredProducts.length}</span>{" "}
          products found
          {selectedCategory && (
            <span>
              {" "}
              in <span className="italic">{selectedCategory}</span>
            </span>
          )}
        </p>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-primary-lightest/5 rounded-xl">
          <h3 className="text-3xl font-semibold text-primary-dark mb-2">
            No products found
          </h3>
          <p className="text-primary-dark/70">
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-6">
        {productsToDisplay.map((product, index) => (
          <Link
            key={product._id}
            href={`/detail/${product._id}`}
            className={`group flex flex-col h-full bg-primary-lightest rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] ${
              product.isOutOfStock ? "opacity-75" : ""
            }`}
          >
            <div className="h-56 sm:h-64 p-4 flex items-center justify-center bg-white relative">
              <div className="relative w-full h-full">
                <Image
                  src={`${getImageUrl(product.images)}`}
                  alt={product.name}
                  priority={index === 0}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                    product.isOutOfStock ? "grayscale" : ""
                  }`}
                />
              </div>

              {/* Stock Status Badges */}
              {product.isOutOfStock && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Out of Stock
                </div>
              )}
            </div>

            <div className="flex flex-col items-center flex-grow bg-primary-medium text-primary-lightest p-5">
              <h2 className="font-bold text-xl mb-2 line-clamp-2 text-center">
                {product.name}
              </h2>

              {/* Stock Information */}
              <div className="text-sm text-primary-lightest/80 mb-2">
                {product.isOutOfStock
                  ? "Out of Stock"
                  : `${product.stock} in stock`}
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-2xl text-primary-lightest">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {productsToDisplay.length < filteredProducts.length && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            className="px-8 py-3 rounded-full text-primary-lightest font-bold border-2 border-primary-lightest hover:bg-primary-lightest/10 transition-all duration-300 flex items-center gap-2"
          >
            <span>Show More Products</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* No more products note */}
      {productsToDisplay.length === filteredProducts.length &&
        filteredProducts.length > 0 && (
          <div className="text-center mt-8 text-primary-dark/50 text-sm">
            No more products to load
          </div>
        )}
    </div>
  );
};

export default ItemList;
