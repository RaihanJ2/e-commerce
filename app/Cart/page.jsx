"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";
import Address from "@components/Address";

const Cart = () => {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

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
    script.setAttribute("data-client-key", "YOUR_SANDBOX_CLIENT_KEY");

    script.onload = () => {
      console.log("Snap.js loaded successfully");
    };

    script.onerror = () => {
      console.error("Failed to load Snap.js");
    };

    document.head.appendChild(script);
  }, [session]);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }
    try {
      const response = await axios.post("api/order", {
        items: cart,
        addressId: selectedAddress._id,
      });

      const { transactionToken } = response.data;
      if (window.snap && window.snap.pay) {
        window.snap.pay(transactionToken, {
          onSuccess: async function (result) {
            console.log("Payment success:", result);
            await axios.delete("/api/cart");
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            // Handle pending payment here
          },
          onError: function (result) {
            console.error("Payment error:", result);
            // Handle payment error here
          },
          onClose: function () {
            console.log("Payment popup closed");
            // Handle popup close here
          },
        });
      } else {
        console.error("Snap.js is not loaded");
        alert("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Failed to checkout", error);
      alert("Failed to checkout");
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
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(price)
      .replace("Rp", "Rp.");
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
      <section className="w-full mt-2 py-5 sm:py-7 bg-white text-main rounded">
        <div className="text-center container max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-2">Item(s) in Cart</h2>
        </div>
      </section>
      <section className="w-full py-10">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <main className="md:w-3/4">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <p className="text-2xl font-bold">Your cart is empty</p>
                    {session ? (
                      <Link
                        href="/"
                        className="text-green- opacity-80 hover:underline"
                      >
                        Continue shopping
                      </Link>
                    ) : (
                      <p className="text-lg mt-4">
                        Sign in to see the items in your cart
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                cart.map((product) => (
                  <article
                    className="border border-gray-200 bg-white text-tertiary shadow-sm rounded mb-8 pb-3 sm:p-4 lg:p-10"
                    key={`${product.productId}-${product.size.join(",")}`}
                  >
                    <div className="flex justify-evenly items-center gap-16">
                      <div className="w-full lg:w-2/5 xl:w-2/4">
                        <figure className="flex leading-5">
                          <div>
                            <div className="block w-16 h-16 rounded border border-gray-200 flex-center">
                              <Image
                                src={`/${product.images}`}
                                alt={product.name}
                                width={100}
                                height={100}
                                className=""
                              />
                            </div>
                          </div>
                          <figcaption className="w-full ml-3 flex-evenly">
                            <div className="">
                              <p>
                                <Link
                                  href={`/detail/${product.productId}`}
                                  className="hover:text-blue-600 pr-4 text-base sm:text-sm"
                                >
                                  {product.name}
                                </Link>
                              </p>
                              <p className="text-gray-600 text-sm sm:text-xs">
                                {product.size.join(", ")}
                              </p>
                            </div>
                            <p className="font-semibold not-italic flex flex-row">
                              {formatPrice(product.price)}{" "}
                            </p>
                          </figcaption>
                        </figure>
                      </div>
                      <div className="w-24 flex-center">
                        <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
                          <button
                            onClick={() =>
                              handleQuantity(
                                product.productId,
                                product.size.join(","),
                                product.quantity - 1
                              )
                            }
                            className="bg-tertiary text-white hover:opacity-80 h-full w-20 rounded-l cursor-pointer outline-none"
                          >
                            <span className="m-auto text-2xl font-thin">-</span>
                          </button>
                          <input
                            type="number"
                            className="outline-none focus:outline-none text-center bg-tertiary w-full bg-gray-300 font-semibold text-md hover:opacity-80 md:text-base cursor-default flex items-center justify-center text-white"
                            value={product.quantity}
                            readOnly
                          />
                          <button
                            onClick={() =>
                              handleQuantity(
                                product.productId,
                                product.size.join(","),
                                product.quantity + 1
                              )
                            }
                            className="bg-tertiary text-white hover:opacity-80 h-full w-20 rounded-r cursor-pointer outline-none"
                          >
                            <span className="m-auto text-2xl font-thin">+</span>
                          </button>
                        </div>
                      </div>
                      <div className="leading-5">
                        <button
                          onClick={() => handleRemove(product.productId)}
                          className="px-4 py-2 inline-block text-red-600 bg-red-100 border border-transparent rounded-md hover:bg-red-200"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </main>
            <aside className=" flex-col flex-center w-full md:w-2/4 text-white">
              <div className="w-full shadow-sm border rounded-md border-gray-200">
                <div className="p-5">
                  <article className="text-center md:text-left">
                    <h6 className="text-lg font-semibold mt-4">
                      Order Summary
                    </h6>
                  </article>
                  <ul className="py-2">
                    <li className="flex justify-between py-2">
                      <span>SubTotal price:</span>
                      <span>{formatPrice(subTotal)}</span>
                    </li>
                    <li className="flex justify-between py-2">
                      <span>Quantity:</span>
                      <span>{totalUnits} item(s)</span>
                    </li>
                    <li className="flex justify-between py-2">
                      <span>PPN:</span>
                      <span>{formatPrice(PPN)}</span>
                    </li>
                    <li className="text-lg font-semibold border-t flex flex-between pt-2">
                      <span>Total price:</span>
                      <span>{formatPrice(total)}</span>
                    </li>
                  </ul>
                  <hr className="my-4" />
                  <button
                    onClick={handleCheckout}
                    className="px-4 py-3 inline-block text-lg w-full text-center font-medium text-main bg-white border border-transparent rounded-md hover:scale-105 duration-75"
                  >
                    Checkout
                  </button>
                </div>
              </div>

              <Address onSelectAddress={setSelectedAddress} />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
