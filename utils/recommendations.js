import Review from "@models/review";
import Product from "@models/product";
import mongoose from "mongoose";

/**
 * Calculates the cosine similarity between two items
 */
const calculateCosineSimilarity = (itemVectorA, itemVectorB) => {
  const dotProduct = itemVectorA.reduce(
    (sum, val, index) => sum + val * itemVectorB[index],
    0
  );
  const magnitudeA = Math.sqrt(
    itemVectorA.reduce((sum, val) => sum + val * val, 0)
  );
  const magnitudeB = Math.sqrt(
    itemVectorB.reduce((sum, val) => sum + val * val, 0)
  );
  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Generates an item similarity matrix based on reviews
 */
export const generateItemSimilarityMatrix = async () => {
  const reviews = await Review.find().populate("productId").exec();

  const productIds = [
    ...new Set(reviews.map((review) => review.productId._id.toString())),
  ];

  const similarityMatrix = {};

  productIds.forEach((productIdA, indexA) => {
    similarityMatrix[productIdA] = {};

    productIds.forEach((productIdB, indexB) => {
      if (indexA !== indexB) {
        const reviewsA = reviews.filter(
          (review) => review.productId._id.toString() === productIdA
        );
        const reviewsB = reviews.filter(
          (review) => review.productId._id.toString() === productIdB
        );

        const usersA = reviewsA.map((review) => review.userId.toString());
        const usersB = reviewsB.map((review) => review.userId.toString());

        const commonUsers = usersA.filter((userId) => usersB.includes(userId));

        if (commonUsers.length > 0) {
          const vectorA = commonUsers.map(
            (userId) =>
              reviewsA.find((review) => review.userId.toString() === userId)
                .rating
          );
          const vectorB = commonUsers.map(
            (userId) =>
              reviewsB.find((review) => review.userId.toString() === userId)
                .rating
          );

          similarityMatrix[productIdA][productIdB] = calculateCosineSimilarity(
            vectorA,
            vectorB
          );
        } else {
          similarityMatrix[productIdA][productIdB] = 0;
        }
      }
    });
  });

  return similarityMatrix;
};
