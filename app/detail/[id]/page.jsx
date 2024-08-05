"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Loading from "@app/loading";
import Review from "@app/Review/page";
import { FaStar } from "react-icons/fa6";
import Recommendations from "@components/Recommendations";

export default function ProductDetail({ params }) {
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

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

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size before adding to cart.");
      return;
    }
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

  const handleQuantity = useCallback((newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  }, []);

  const handleSizeClick = useCallback((size) => {
    setSelectedSize(size);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  /** LOADING STATE **/

  if (!product) {
    return <Loading />;
  }

  return (
    <>
      <section
        key={product.id}
        className="flex flex-row flex-center w-full m-4 px-4 py-8 rounded-xl bg-white text-tertiary"
      >
        <div className="flex flex-col items-center lg:flex-row gap-4">
          <Image
            src={`/${product.images}`}
            alt={product.name}
            width={500}
            height={500}
            className="max-h-[30rem] w-auto"
          />
          <div className="flex flex-col px-8 w-2/3 ml-10 gap-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <span
              className={`flex flex-row items-center text-2xl ${
                product.avgRatings < 3 ? "text-red-500" : "text-yellow-500"
              }`}
            >
              {product.avgRatings} <p className="text-black">/5</p>{" "}
              <FaStar className="text-yellow-500" />
            </span>

            {product.description.map((desc, index) => (
              <p className="font-medium text-lg" key={index}>
                {desc}
              </p>
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
                    className={`p-2 border-2 rounded hover:scale-105 duration-75 ${
                      selectedSize === size
                        ? "bg-main text-white"
                        : "border-main bg-white text-tertiary"
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
                  className="bg-tertiary text-white hover:opacity-80 h-full w-20 rounded-l cursor-pointer outline-none "
                >
                  <span className="m-auto text-2xl font-thin">-</span>
                </button>
                <input
                  type="number"
                  className="outline-none focus:outline-none text-center w-full bg-tertiary font-semibold text-md md:text-base cursor-default flex items-center justify-center text-white  "
                  name="custom-input-number"
                  value={quantity}
                  readOnly
                />
                <button
                  onClick={() => handleQuantity(quantity + 1)}
                  data-action="increment"
                  className="bg-tertiary text-white hover:opacity-80 h-full w-20 rounded-r cursor-pointer outline-none "
                >
                  <span className="m-auto text-2xl font-thin">+</span>
                </button>
              </div>
            </div>

            <div className="">
              <p className="my-4 text-2xl font-bold">
                {formatPrice(quantity * product.price)}
              </p>
              <button
                onClick={handleAddToCart}
                className=" bg-main text-white py-2 px-4 rounded hover:scale-105 duration-75"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full">
        <Recommendations productId={id} />
      </section>
      <section className="w-full py-8">
        <Review productId={product._id} />
      </section>
    </>
  );
}
