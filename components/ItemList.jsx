"use client";
import Loading from "@app/loading";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const ItemList = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [displayProducts, setDisplayProducts] = useState(8);

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

  const handleCategory = (category) => {
    setSelectedCategory(category);
    setDisplayProducts(8);
  };

  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  const productsToDisplay = filteredProducts.slice(0, displayProducts);

  const loadMore = () => {
    setDisplayProducts(displayProducts + 8);
  };
  if (!products) {
    <Loading />;
  }
  return (
    <>
      <section className="flex flex-center gap-2 m-4">
        <button
          onClick={() => setSelectedCategory("")}
          className={`p-2 border-2 rounded font-sans hover:scale-105 duration-75 ${
            !selectedCategory
              ? "bg-white text-main border-white"
              : "bg-main text-white"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategory(category)}
            className={`p-2 border-2 rounded font-sans hover:scale-105 duration-75 ${
              selectedCategory === category
                ? "bg-white text-main border-white"
                : "bg-main text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </section>
      <section className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-8 p-4 mt-4 mb-8 ">
        {productsToDisplay.map((product) => (
          <Link
            key={product._id}
            href={`/detail/${product._id}`}
            className="relative cursor-pointer border border-white bg-white text-main hover:scale-105 transition-all rounded-md overflow-hidden"
          >
            <Image
              src={`/${product.images}`}
              alt={product.name}
              width={300}
              height={300}
              className="max-h-72 object-scale-down mb-28 sm:mb-22 p-4"
            />
            <div className="flex flex-col font-sans bg-main text-white font-bold md:text-xl text-md p-4 text-center gap-2 absolute bottom-0 left-0 right-0">
              <h1>{product.name}</h1>
              <h1>{formatPrice(product.price)}</h1>
            </div>
          </Link>
        ))}
      </section>
      {productsToDisplay.length < filteredProducts.length && (
        <div className="flex flex-center">
          <button
            onClick={loadMore}
            className="p-2 mb-6 rounded text-white font-sans hover:scale-105 border-4 duration-75 font-semibold"
          >
            Show More
          </button>
        </div>
      )}
    </>
  );
};
export async function getServerSideProps() {
  const res = await axios.get("http://localhost:3000/api/products");
  const products = res.data;

  return {
    props: {
      products,
    },
  };
}
export default ItemList;
