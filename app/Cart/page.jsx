"use client";
import { formatPrice, getCart, removeCart, updateQty } from "@utils/cart";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Cart = () => {
  const [cart, setCart] = useState();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      getCart(session.user.id).then(setCart);
    }
  }, [session]);

  const handleRemove = async (id) => {
    await removeCart(session.user.id, id);
    const updatedCart = await getCart(session.user.id);
    setCart(updatedCart);
  };

  const handleQuantity = async (id, quantity) => {
    await updateQty(session.user.id, id, quantity);
    const updatedCart = await getCart(session.user.id);
    setCart(updatedCart);
  };
  const subTotal = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const totalUnits = cart.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const PPN = subTotal * 0.05;

  const total = subTotal + PPN;

  return (
    <>
      <section className="w-full py-5 sm:py-7 bg-blue-100">
        <div className="text-center container max-w-screen-xl mx-auto px-4">
          <h2 className=" text-3xl font-semibold mb-2">Item(s) in Cart</h2>
        </div>
      </section>
      <section className="w-full py-10">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <main className="md:w-3/4">
              {cart.orderItems.map((item) => (
                <article className="border border-gray-200 bg-white shadow-sm rounded mb-8 pb-3 lg:p-10 ">
                  <div className="">
                    <div className="flex flex-wrap justify-evenly lg:flex-row gap-5 mb-4">
                      <div className="w-full lg:w-2/5 xl:w-2/4">
                        <figure className="flex leading-5">
                          <div>
                            <div className="block w-16 h-16 rounded border border-gray-200 overflow-hidden">
                              <Image
                                src={`/${item.product.images}`}
                                alt={item.product.name}
                                width={100}
                                height={100}
                                className="object-scale-down max-h-80"
                              />
                            </div>
                          </div>
                          <figcaption className="ml-3">
                            <p>
                              <Link
                                href={`/detail/${item.product.id}`}
                                className="hover:text-blue-600"
                              >
                                {item.product.name}
                              </Link>
                            </p>
                          </figcaption>
                        </figure>
                      </div>
                      <div className="w-24">
                        <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
                          <button
                            onClick={() =>
                              handleQuantity(
                                item.product.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            data-action="decrement"
                            className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none "
                          >
                            <span className="m-auto text-2xl font-thin">-</span>
                          </button>
                          <input
                            type="number"
                            className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default flex items-center justify-center text-gray-900  "
                            name="custom-input-number"
                            value={item.quantity}
                            readOnly
                          />
                          <button
                            onClick={() =>
                              handleQuantity(item.product.id, item.quantity + 1)
                            }
                            data-action="increment"
                            className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer outline-none "
                          >
                            <span className="m-auto text-2xl font-thin">+</span>
                          </button>
                        </div>
                      </div>
                      <div className="leading-5">
                        <p className="font-semibold not-italic">Price:</p>
                        <small className="text-gray-400">
                          {" "}
                          {formatPrice(item.product.price)}
                        </small>
                      </div>
                      <div className="">
                        <a
                          onClick={() => handleRemove(item.product.id)}
                          className="px-4 py-2 inline-block text-red-600 bg-white shadow-sm border border-gray-200 rounded-md hover:bg-gray-100 cursor-pointer"
                        >
                          Remove
                        </a>
                      </div>
                    </div>
                  </div>
                  <hr className="my-4" />
                </article>
              ))}
            </main>
            <aside className="md:w-1/4">
              <article className="border border-gray-200 bg-white shadow-sm rounded mb-5 p-3 lg:p-5">
                <ul className="mb-5">
                  <li className="flex justify-between text-gray-600 mb-1">
                    <span>SubTotal</span>
                    <span>{formatPrice(subTotal)}</span>
                  </li>
                  <li className="flex justify-between text-gray-600 mb-1">
                    <span>Total Units:</span>
                    <span className="to-green-500">{totalUnits}</span>
                  </li>
                  <li className="flex justify-between to-gray-600 mb-1">
                    <span>PPN:</span>
                    <span>{formatPrice(PPN)}</span>
                  </li>
                  <li className="text-lg font-bold border-t flex justify-between mt-3 pt-3">
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </li>
                </ul>
                <a className="px-4 py-3 mb-2 inline-block text-lg w-full text-center font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 cursor-pointer">
                  Continue
                </a>
                <Link
                  href="/"
                  className="px-4 py-3 mb-2 inline-block text-lg w-full text-center font-medium text-green-600 bg-white shadow-sm border-gray-200 rounded-md hover:bg-gray-100 "
                >
                  Back to Shop
                </Link>
              </article>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
