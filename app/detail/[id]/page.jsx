"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Loading from "@app/loading";
import { set } from "mongoose";
import Review from "@components/Review";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/product/${id}`);
        setProduct(res.data);
        if (res.data.size.length === 1) {
          setSelectedSize(res.data.size[0]);
        }
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
        productId: product._id,
        name: product.name,
        size: selectedSize,
        quantity: quantity,
        images: product.images,
        price: product.price,
      });
    } catch (error) {
      console.error("Failed to add item to cart", error);
      alert("Failed to add item to cart.");
    }
  };
  const handleQuantity = (newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };
  const handleSizeClick = (size) => {
    setSelectedSize(size);
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
    <>
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
                <p>Size: {product.size[0]} </p>
                <input type="hidden" value={product.size[0]} readOnly />
              </div>
            ) : (
              <div className="flex gap-2">
                {product.size.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => handleSizeClick(size)}
                    className={`p-2 border rounded ${
                      selectedSize === size
                        ? "bg-gray-300 border-black"
                        : "bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
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
      <section className="w-full">
        <Review />
      </section>
    </>
  );
}
