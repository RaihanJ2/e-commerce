"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaStar, FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";

const ReviewForm = ({ productId }) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      try {
        const res = await axios.get(
          `/api/review?productId=${productId}&checkPurchase=true`
        );
        setHasPurchased(res.data.hasPurchased);
      } catch (error) {
        console.error("Failed to check purchase status", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkPurchaseStatus();
    }
  }, [session, productId]);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleHoverRating = (value) => {
    setHoverRating(value);
  };

  const handleOffRating = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/review", {
        productId,
        rating,
        review: reviewText,
      });
      setRating(0);
      setReviewText("");
      console.log("Review submitted:", res.data);
      router.push(`/detail/${productId}`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit review", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return hasPurchased ? (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col rounded-md bg-black py-4 px-8"
    >
      <div className="flex flex-row mb-4">
        <div className="flex-1 flex justify-start items-center gap-3 cursor-pointer">
          {session?.user.image ? (
            <Image
              src={session?.user.image}
              alt={session?.user.name}
              width={60}
              height={60}
              className="rounded-full object-contain"
            />
          ) : (
            <FaUser className="rounded-full text-white text-3xl p-1 border-2" />
          )}
          <div className="flex flex-col">
            <label className="font-bold text-white">{session.user.name}</label>
            <div className="flex cursor-pointer">
              {[1, 2, 3, 4, 5].map((value) => (
                <FaStar
                  key={value}
                  size={20}
                  className={`star-icon ${
                    hoverRating >= value || rating >= value
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  onClick={() => handleRating(value)}
                  onMouseEnter={() => handleHoverRating(value)}
                  onMouseLeave={handleOffRating}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <textarea
          className="p-2 my-2 h-24 rounded resize-none w-full"
          name="review"
          id="review"
          placeholder="Write your review here..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />
        <button
          type="submit"
          className="w-1/5 h-10 border bg-white hover:border-white hover:bg-black hover:text-white rounded duration-75 text-black"
        >
          Submit
        </button>
      </div>
    </form>
  ) : (
    <div className="p-6 rounded-md bg-white text-3xl text-main font-bold flex-center">
      You can only leave a review if you have purchased this product.
    </div>
  );
};

export default ReviewForm;
