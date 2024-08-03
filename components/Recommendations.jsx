import Image from "next/image";
import Link from "next/link";

const Recommendations = ({ recommendations }) => {
  return (
    <section>
      {recommendations.map((recProduct) => (
        <Link
          key={recProduct._id}
          href={`/detail/${recProduct._id}`}
          className="relative cursor-pointer border border-white bg-white text-main hover:scale-105 transition-all rounded-md overflow-hidden"
        >
          <Image
            src={`/${recProduct.images}`}
            alt={recProduct.name}
            width={300}
            height={300}
            className="max-h-80 object-scale-down mb-28 sm:mb-22 p-4"
          />
          <div className="flex flex-col font-sans bg-main text-white font-bold md:text-xl text-md p-4 text-center gap-2 absolute bottom-0 left-0 right-0">
            <h1>{recProduct.name}</h1>
            <h1>{formatPrice(recProduct.price)}</h1>
          </div>
        </Link>
      ))}
    </section>
  );
};

export default Recommendations;
