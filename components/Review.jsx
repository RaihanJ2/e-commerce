import Image from "next/image";
import React from "react";

const Review = () => {
  return (
    <section className=" flex flex-col flex-center gap-2 py-4">
      <div className="w-full flex flex-col bg-gray-300 py-4 px-8">
        <div className="flex flex-row">
          <Image
            src="/vercel.svg"
            alt={`/product.name`}
            width={100}
            height={100}
            className="p-4"
          />
          <div className="flex flex-col">
            <label className="font-bold">username</label>
            <span>****</span>
          </div>
        </div>
        <textarea
          className="p-2 my-2 h-2/6 rounded resize-none"
          name="review"
          id="review"
        />
        <button className=" w-2/6 border bg-black hover:bg-gray-800 rounded text-white ">
          Submit
        </button>
      </div>
      <div className="w-full flex flex-col bg-gray-300 py-4 px-8">
        <div className="flex flex-row">
          <Image
            src="/vercel.svg"
            alt={`/product.name`}
            width={100}
            height={100}
            className="p-4"
          />
          <div className="flex flex-col">
            <label className="font-bold">username</label>
            <span>****</span>
          </div>
        </div>
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corrupti ex,
          corporis officia nisi voluptatem vel quis atque eveniet, repellat
          excepturi quo. Necessitatibus fugiat, veniam ipsa saepe quasi adipisci
          fuga perferendis?
        </p>
      </div>
    </section>
  );
};

export default Review;
