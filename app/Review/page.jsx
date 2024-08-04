"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ReviewList from "@components/ReviewList";
import ReviewForm from "@components/ReviewFrom";

const Review = ({ productId }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/review?productId=${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const handleReviewSubmit = async (newReview) => {
    try {
      const response = await axios.post("/api/review", newReview);
      setReviews([response.data, ...reviews]);
    } catch (error) {
      console.error("Failed to create review", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <section className="w-full flex flex-col gap-4 py-4">
      <ReviewForm onReviewSubmit={handleReviewSubmit} productId={productId} />
      <ReviewList reviews={reviews} />
    </section>
  );
};

export default Review;
