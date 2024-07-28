"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ItemList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/product");
      setProducts(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    })
      .format(price)
      .replace("Rp", "Rp.");
  };

  return (
    <section className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-8 p-4 my-8 ">
      {products.map((product) => (
        <Link
          key={product._id}
          href={`/detail/${product._id}`}
          className="relative cursor-pointer text-gray-950 hover:scale-105 transition-all rounded-md overflow-hidden shadow-md"
        >
          <Image
            src={`/${product.images}`}
            alt={product.name}
            width={350}
            height={350}
            className="max-h-80 object-scale-down mb-28"
          />
          <div className="flex flex-col font-bold md:text-xl text-md p-4 text-center gap-2 absolute bottom-0 left-0 right-0">
            <h1>{product.name}</h1>
            <h1>{formatPrice(product.price)}</h1>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default ItemList;
