"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import Address from "@components/Address";
import { formatPrice, getImageUrl } from "@utils/utils";

const Cart = () => {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get("/api/cart");
      setCart(res.data.items || []);
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

  const subTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const totalUnits = cart.reduce((total, item) => total + item.quantity, 0);

  const PPN = subTotal * 0.05;
  const total = subTotal + PPN;

  return (
    <>
      <section className="w-full mt-2 py-5 sm:py-7 bg-primary-lightest rounded-lg">
        <div className="text-center container max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-gothic font-semibold mb-2 text-primary-darkest">
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
                    <p className="text-2xl font-bold text-primary-darkest">
                      Your cart is empty
                    </p>
                    {session ? (
                      <Link
                        href="/"
                        className="text-primary-medium hover:text-primary-dark hover:underline transition-all duration-150"
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
                cart.map((product) => (
                  <article
                    className="glassmorphism mb-6"
                    key={`${product.productId}-${product.size.join(",")}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="block w-20 h-20  flex-center m-2">
                          <Image
                            src={`${getImageUrl(product.images)}`}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="object-none bg-white p-2 rounded sm:object-contain"
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
                            className="bg-primary-medium text-primary-lightest hover:bg-primary-dark w-10 flex-center transition-colors"
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
                            className="bg-primary-medium text-primary-lightest hover:bg-primary-dark w-10 flex-center transition-colors"
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
                ))
              )}
            </main>

            <aside className="w-full lg:w-2/5">
              <div className="glassmorphism bg-primary-darkest text-primary-lightest">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4 blue_gradient">
                    Order Summary
                  </h2>

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
                      isLoading || cart.length === 0 || !selectedAddress
                    }
                    className="sign-btn bg-primary-light hover:bg-primary-medium w-full py-3 text-lg font-medium transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="loading mx-auto"></div>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </button>
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
