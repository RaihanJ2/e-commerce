"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Loading from "@app/loading";
import { useSession } from "next-auth/react";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${id}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <Loading />;
  }
  const handleAddToCart = async () => {
    try {
      await axios.post("/api/cart", {
        productId: product.id,
        name: product.name,
        quantity,
        images: product.images,
        price: product.price,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };
  const handleQuantity = (newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
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

  return (
    <section key={product.id} className="flex flex-row p-8">
      <div className="flex flex-col items-center md:flex-row gap-4">
        <Image
          src={`/${product.images}`}
          alt={product.name}
          width={500}
          height={500}
        />
        <div className="flex flex-col px-8 w-2/3 ml-10">
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {product.description.map((desc, index) => (
            <p key={index}>{desc}</p>
          ))}

          {product.size.length === 1 ? (
            <div>
              {product.size.map((size, index) => (
                <p key={index}>Size: {size}</p>
              ))}
            </div>
          ) : (
            <select className="w-32" name="size" id="size">
              {product.size.map((size, index) => (
                <option key={index}>{size}</option>
              ))}
            </select>
          )}
          <div className="w-24">
            <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
              <button
                onClick={() => handleQuantity(quantity - 1)}
                data-action="decrement"
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none "
              >
                <span className="m-auto text-2xl font-thin">-</span>
              </button>
              <input
                type="number"
                className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black md:text-base cursor-default flex items-center justify-center text-gray-900  "
                name="custom-input-number"
                value={quantity}
                readOnly
              />
              <button
                onClick={() => handleQuantity(quantity + 1)}
                data-action="increment"
                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer outline-none "
              >
                <span className="m-auto text-2xl font-thin">+</span>
              </button>
            </div>
          </div>

          <div className="">
            <p className="my-4">{formatPrice(quantity * product.price)}</p>
            <button
              onClick={handleAddToCart}
              className=" bg-black text-white py-2 px-4 rounded"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
