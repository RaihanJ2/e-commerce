"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

const Cart = () => {
  const { data: session } = useSession();
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart");
      setCart(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCart();
    }
  }, [session]);

  const handleRemove = async (productId) => {
    try {
      await axios.delete("/api/cart", {
        data: { productId },
      });
      fetchCart();
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  const handleQuantity = async (productId, newQuantity) => {
    try {
      await axios.put("/api/cart", {
        productId,
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      console.error("failed to update quantity", error);
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
      <section className="w-full py-5 sm:py-7 bg-blue-100">
        <div className="text-center container max-w-screen-xl mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-2">Item(s) in Cart</h2>
        </div>
      </section>
      <section className="w-full py-10">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <main className="md:w-3/4">
              {cart.map((product) => (
                <article
                  className="border border-gray-200 bg-white shadow-sm rounded mb-8 pb-3 lg:p-10"
                  key={product.productId}
                >
                  {/* flex flex-wrap justify-evenly lg:flex-row gap-5 mb-4 */}
                  <div className="flex justify-evenly items-center">
                    <div className="w-full lg:w-2/5 xl:w-2/4">
                      <figure className="flex leading-5">
                        <div>
                          <div className="block w-16 h-16 rounded border border-gray-200 overflow-hidden">
                            <Image
                              src={`/${product.images}`}
                              alt={product.name}
                              width={100}
                              height={100}
                              className="object-scale-down max-h-80"
                            />
                          </div>
                        </div>
                        <figcaption className="ml-3 flex-center">
                          <div className="">
                            <p>
                              <Link
                                href={`/detail/${product.productId}`}
                                className="hover:text-blue-600"
                              >
                                {product.name}
                              </Link>
                            </p>
                            <p className="text-gray-600 text-sm">
                              {product.size.join(", ")}
                            </p>
                          </div>
                          <p className="font-semibold not-italic">
                            {formatPrice(product.price)}
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
                              product.quantity - 1
                            )
                          }
                          className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                        >
                          <span className="m-auto text-2xl font-thin">-</span>
                        </button>
                        <input
                          type="number"
                          className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default flex items-center justify-center text-gray-900"
                          value={product.quantity}
                          readOnly
                        />
                        <button
                          onClick={() =>
                            handleQuantity(
                              product.productId,
                              product.quantity + 1
                            )
                          }
                          className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer outline-none"
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
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </main>
            <aside className="w-full md:w-2/4">
              <div className="card shadow-sm border border-gray-200">
                <div className="p-5">
                  <article className="text-center md:text-left">
                    <h6 className="text-lg font-semibold mt-4">
                      Order Summary
                    </h6>
                  </article>
                  <ul className="text-gray-600 py-2">
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
                  <Link
                    href="/checkout"
                    className="px-4 py-3 inline-block text-lg w-full text-center font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
