"use client";

import Image from "next/image";
import { FaStar, FaUser } from "react-icons/fa";

const ReviewList = ({ reviews }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review._id} className="flex rounded bg-white p-4">
          <div className="h-1/4 min-w-24">
            <div className="flex-1 flex justify-start items-center gap-3">
              {review.userId.image ? (
                <Image
                  src={review.userId.image}
                  alt={review.userId.username}
                  width={40}
                  height={40}
                  className="rounded-full object-contain"
                />
              ) : (
                <FaUser className=" w-10 h-10 rounded-full object-contain border-2" />
              )}
              <div className="flex flex-col">
                <h3 className="font-satoshi font-semibold text-gray-900">
                  {review.userId.username}
                </h3>
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500" />
                  ))}
                </div>
              </div>
            </div>

            <p className="pt-2">{review.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
