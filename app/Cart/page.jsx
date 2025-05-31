"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";
import Address from "@components/Address";
import { formatPrice, getImageUrl } from "@utils/utils";

const Cart = () => {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [productDetails, setProductDetails] = useState({});

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get("/api/cart");
      const cartItems = res.data.items || [];
      setCart(cartItems);

      // Fetch product details for stock information
      const productIds = [...new Set(cartItems.map((item) => item.productId))];
      const productPromises = productIds.map((id) =>
        axios
          .get(`/api/product/${id}`)
          .catch((err) => ({ data: null, productId: id }))
      );

      const productResponses = await Promise.all(productPromises);
      const productsMap = {};

      productResponses.forEach((response, index) => {
        if (response.data) {
          productsMap[productIds[index]] = response.data;
        }
      });

      setProductDetails(productsMap);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchCart();
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    );

    script.onload = () => {
      console.log("Snap.js loaded successfully");
    };

    script.onerror = () => {
      console.error("Failed to load Snap.js");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [session, fetchCart]);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }

    // Check for out of stock items
    const outOfStockItems = cart.filter((item) => {
      const product = productDetails[item.productId];
      return product && product.stock <= 0;
    });

    if (outOfStockItems.length > 0) {
      alert(
        "Some items in your cart are out of stock. Please remove them before checkout."
      );
      return;
    }

    // Check if any item quantity exceeds available stock
    const overStockItems = cart.filter((item) => {
      const product = productDetails[item.productId];
      return product && item.quantity > product.stock;
    });

    if (overStockItems.length > 0) {
      alert(
        "Some items in your cart exceed available stock. Please adjust quantities."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("/api/order", {
        items: cart,
        addressId: selectedAddress._id,
      });

      const { transactionToken } = response.data;
      if (window.snap && window.snap.pay) {
        window.snap.pay(transactionToken, {
          onSuccess: async function (result) {
            console.log("Payment success:", result);
            await axios.delete("/api/cart");
            fetchCart();
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
          },
          onError: function (result) {
            console.error("Payment error:", result);
          },
          onClose: function () {
            console.log("Payment popup closed");
            setIsLoading(false);
          },
        });
      } else {
        console.error("Snap.js is not loaded");
        alert("Failed to initialize payment");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to checkout", error);
      alert("Failed to checkout");
      setIsLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const product = cart.find((item) => item.productId === productId);

      await axios.delete("/api/cart", {
        data: {
          productId,
          size: product.size.join(","),
        },
      });
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  const handleQuantity = async (productId, size, newQuantity) => {
    try {
      if (newQuantity > 0) {
        const product = productDetails[productId];
        if (product && newQuantity > product.stock) {
          alert(`Only ${product.stock} items available in stock`);
          return;
        }

        await axios.put("/api/cart", {
          productId,
          size,
          quantity: newQuantity,
        });
        fetchCart();
      }
    } catch (error) {
      console.error("Failed to update item quantity", error);
    }
  };

  const isItemOutOfStock = (productId) => {
    const product = productDetails[productId];
    return product && product.stock <= 0;
  };

  const getMaxQuantity = (productId) => {
    const product = productDetails[productId];
    return product ? product.stock : 1;
  };

  const subTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalUnits = cart.reduce((total, item) => total + item.quantity, 0);

  const PPN = subTotal * 0.05;
  const total = subTotal + PPN;

  const hasOutOfStockItems = cart.some((item) =>
    isItemOutOfStock(item.productId)
  );

  return (
    <>
      <section className="w-full mt-2 py-5 sm:py-7 bg-primary-dark rounded-lg">
        <div className="text-center container max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-gothic font-semibold mb-2 text-primary-lightest">
            Shopping Cart
          </h2>
        </div>
      </section>

      <section className="w-full py-10">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            <main className="w-full lg:w-3/5">
              {cart.length === 0 ? (
                <div className="flex-center h-64 glassmorphism bg-primary-lightest">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-lightest">
                      Your cart is empty
                    </p>
                    {session ? (
                      <Link
                        href="/"
                        className="text-primary-light hover:text-primary-lightest hover:underline transition-all duration-150"
                      >
                        Continue shopping
                      </Link>
                    ) : (
                      <div className="mt-4">
                        <p className="text-lg text-primary-dark mb-3">
                          Sign in to see the items in your cart
                        </p>
                        <Link
                          href="/auth/login"
                          className="sign-btn bg-primary-medium px-6 py-2"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                cart.map((product) => {
                  const outOfStock = isItemOutOfStock(product.productId);
                  const maxQuantity = getMaxQuantity(product.productId);
                  const productStock =
                    productDetails[product.productId]?.stock || 0;

                  return (
                    <article
                      className={`glassmorphism mb-6 ${
                        outOfStock ? "opacity-75 border-2 border-red-400" : ""
                      }`}
                      key={`${product.productId}-${product.size.join(",")}`}
                    >
                      {outOfStock && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 flex items-center">
                          <FaExclamationTriangle className="mr-2" />
                          <span className="font-medium">
                            This item is currently out of stock
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <div className="block w-20 h-20 flex-center m-2">
                            <Image
                              src={`${getImageUrl(product.images)}`}
                              alt={product.name}
                              width={100}
                              height={100}
                              className={`object-none bg-white p-2 rounded sm:object-contain ${
                                outOfStock ? "grayscale" : ""
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <Link
                              href={`/detail/${product.productId}`}
                              className="text-primary-lightest hover:text-primary-medium font-medium transition-colors"
                            >
                              {product.name}
                            </Link>
                            <p className="text-primary-lightest text-sm mt-1">
                              Size:{" "}
                              <span className="font-medium">
                                {product.size.join(", ")}
                              </span>
                            </p>
                            <p className="text-primary-lightest font-semibold mt-1">
                              {formatPrice(product.price)}
                            </p>
                            {productStock > 0 &&
                              productStock <= 10 &&
                              !outOfStock && (
                                <p className="text-yellow-400 text-sm mt-1">
                                  Only {productStock} left in stock
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 rounded-lg overflow-hidden border border-primary-medium">
                            <button
                              onClick={() =>
                                handleQuantity(
                                  product.productId,
                                  product.size.join(","),
                                  product.quantity - 1
                                )
                              }
                              disabled={outOfStock}
                              className="bg-primary-medium text-primary-lightest hover:bg-primary-dark w-10 flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="text-xl">-</span>
                            </button>
                            <div className="w-12 bg-primary-lightest flex-center text-primary-darkest font-medium">
                              {product.quantity}
                            </div>
                            <button
                              onClick={() =>
                                handleQuantity(
                                  product.productId,
                                  product.size.join(","),
                                  product.quantity + 1
                                )
                              }
                              disabled={
                                outOfStock || product.quantity >= maxQuantity
                              }
                              className="bg-primary-medium text-primary-lightest hover:bg-primary-dark w-10 flex-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="text-xl">+</span>
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(product.productId)}
                            className="cart-btn bg-red-500 border-red-500 hover:bg-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </main>

            <aside className="w-full lg:w-2/5">
              <div className="glassmorphism bg-primary-darkest text-primary-lightest">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-primary-lightest">
                    Order Summary
                  </h2>

                  {hasOutOfStockItems && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
                      <div className="flex items-center">
                        <FaExclamationTriangle className="mr-2" />
                        <span className="text-sm">
                          Remove out-of-stock items before checkout
                        </span>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-3 mb-6">
                    <li className="flex-between py-2 border-b border-primary-dark/30">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {formatPrice(subTotal)}
                      </span>
                    </li>
                    <li className="flex-between py-2 border-b border-primary-dark/30">
                      <span>Items:</span>
                      <span className="font-medium">{totalUnits} item(s)</span>
                    </li>
                    <li className="flex-between py-2 border-b border-primary-dark/30">
                      <span>PPN (5%):</span>
                      <span className="font-medium">{formatPrice(PPN)}</span>
                    </li>
                    <li className="flex-between py-3 text-lg font-semibold mt-2">
                      <span>Total:</span>
                      <span>{formatPrice(total)}</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleCheckout}
                    disabled={
                      isLoading ||
                      cart.length === 0 ||
                      !selectedAddress ||
                      hasOutOfStockItems
                    }
                    className="sign-btn bg-primary-medium hover:bg-primary-darkest w-full py-3 text-lg font-medium transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="loading mx-auto"></div>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>

                  {hasOutOfStockItems && (
                    <p className="text-red-400 text-sm mt-2 text-center">
                      Please remove out-of-stock items to continue
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Address onSelectAddress={setSelectedAddress} />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
