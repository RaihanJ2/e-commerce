"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Loading from "@app/loading";
import Review from "@app/Review/page";
import { FaStar } from "react-icons/fa6";
import Recommendations from "@components/Recommendations";
import { useSession } from "next-auth/react";
import { formatPrice, getImageUrl } from "@utils/utils";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const { data: session } = useSession();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${id}`);
        if (isMounted) {
          setProduct(res.data);

          if (res.data.size.length === 1) {
            setSelectedSize(res.data.size[0]);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching product:", error);
        }
      }
    };
    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  /** BUTTON HANDLERS **/

  const handleAddToCart = useCallback(async () => {
    if (!selectedSize) {
      setCartMessage({
        type: "error",
        text: "Please select a size before adding to cart.",
      });
      return;
    }
    if (!session) {
      setCartMessage({
        type: "error",
        text: "Please sign in to add items to cart.",
      });
      return;
    }

    if (product.isOutOfStock) {
      setCartMessage({
        type: "error",
        text: "This product is out of stock.",
      });
      return;
    }

    if (quantity > product.stock) {
      setCartMessage({
        type: "error",
        text: `Only ${product.stock} items available in stock.`,
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await axios.post("/api/cart", {
        productId: product._id,
        name: product.name,
        size: selectedSize,
        quantity: quantity,
        images: product.images,
        price: product.price,
      });
      setCartMessage({ type: "success", text: "Added to cart successfully!" });
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      console.error("Failed to add item to cart", error);
      setCartMessage({ type: "error", text: "Failed to add item to cart." });
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedSize, session, product, quantity]);

  const handleQuantity = useCallback((newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  }, []);

  const handleSizeClick = useCallback((size) => {
    setSelectedSize(size);
    setCartMessage(null);
  }, []);

  /** LOADING STATE **/

  if (!product) {
    return <Loading />;
  }

  const maxQuantity = Math.min(product.stock, 10); // Limit to 10 or available stock

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Detail */}
      <section className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2 flex-center p-8 relative">
            <Image
              src={`${getImageUrl(product.images)}`}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain max-h-[500px] w-auto"
              priority
            />
            {/* Stock Status Badge */}
            {product.isOutOfStock && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8">
            <div className="flex-between mb-4">
              <h1 className="text-3xl font-bold text-primary-darkest">
                {product.name}
              </h1>
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full">
                <FaStar className="text-yellow-500" />
                <span className="font-medium">{product.avgRatings}</span>
                <span className="text-primary-dark">/5</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Price */}
              <div className="text-3xl font-bold text-primary-medium">
                {formatPrice(product.price)}
              </div>

              {/* Stock Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-darkest">
                    Stock:
                  </span>
                  <span
                    className={`font-medium ${
                      product.isOutOfStock ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {product.isOutOfStock
                      ? "Out of Stock"
                      : `${product.stock} available`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                {product.description.map((desc, index) => (
                  <p className="text-primary-dark" key={index}>
                    {desc}
                  </p>
                ))}
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="font-medium text-primary-darkest mb-2">Size</h3>
                {product.size.length === 1 ? (
                  <div className="inline-block px-4 py-2 border border-primary-light rounded bg-white text-primary-dark">
                    {product.size[0]}
                    <input type="hidden" value={product.size[0]} readOnly />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => handleSizeClick(size)}
                        disabled={product.isOutOfStock}
                        className={`px-4 py-2 rounded-md border-2 transition-all ${
                          selectedSize === size
                            ? "bg-primary-medium text-primary-lightest border-primary-medium"
                            : "border-primary-light hover:border-primary-medium"
                        } ${
                          product.isOutOfStock
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <h3 className="font-medium text-primary-darkest mb-2">
                  Quantity
                </h3>
                <div className="flex items-center rounded-md border border-primary-light w-36">
                  <button
                    onClick={() => handleQuantity(quantity - 1)}
                    disabled={product.isOutOfStock || quantity <= 1}
                    className="flex-1 text-xl font-medium px-3 py-2 hover:bg-white transition-colors rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-medium py-2 text-primary-dark">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantity(quantity + 1)}
                    disabled={product.isOutOfStock || quantity >= maxQuantity}
                    className="flex-1 text-xl font-medium px-3 py-2 hover:bg-white transition-colors rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {!product.isOutOfStock && quantity >= maxQuantity && (
                  <p className="text-sm text-orange-600 mt-1">
                    Maximum quantity available: {maxQuantity}
                  </p>
                )}
              </div>

              {/* Subtotal */}
              <div>
                <h3 className="font-medium text-primary-darkest">Subtotal</h3>
                <div className="text-2xl font-bold text-primary-medium">
                  {formatPrice(quantity * product.price)}
                </div>
              </div>

              {/* Add to cart */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.isOutOfStock}
                  className={`w-full py-3 px-6 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-medium focus:ring-opacity-50 ${
                    product.isOutOfStock
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-primary-medium text-primary-lightest hover:bg-opacity-90 disabled:opacity-70"
                  }`}
                >
                  {product.isOutOfStock
                    ? "Out of Stock"
                    : isAddingToCart
                    ? "Adding..."
                    : "Add to Cart"}
                </button>

                {cartMessage && (
                  <div
                    className={`py-2 px-4 rounded-md ${
                      cartMessage.type === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {cartMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mt-8">
        <Recommendations />
      </section>

      {/* Reviews */}
      <section className="mt-16">
        <div className="bg-primary-lightest rounded-xl shadow-md overflow-hidden">
          <Review productId={product._id} />
        </div>
      </section>
    </div>
  );
}
