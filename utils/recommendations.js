import Order from "@models/order";
import { connectDB } from "./db";

export const fetchInteract = async () => {
  try {
    await connectDB();

    const orders = await Order.find().populate("items.productId");

    const productUserMatrix = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId.toString();
        const userId = order.user.toString();

        if (!productUserMatrix[productId]) {
          productUserMatrix[productId] = {};
        }

        productUserMatrix[productId][userId] =
          (productUserMatrix[productId][userId] || 0) + item.quantity;
      });
    });

    return productUserMatrix;
  } catch (error) {
    console.error("Error fetching interact data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch interact data" }),
      { status: 500 }
    );
  }
};

export const calculateCosineSimilarity = (vecA, vecB) => {
  const dotProduct = Object.keys(vecA).reduce((sum, key) => {
    return sum + vecA[key] * (vecB[key] || 0);
  }, 0);

  const magnitudeA = Math.sqrt(
    Object.values(vecA).reduce((sum, value) => sum + value ** 2, 0)
  );
  const magnitudeB = Math.sqrt(
    Object.values(vecB).reduce((sum, value) => sum + value ** 2, 0)
  );

  return dotProduct / magnitudeA / magnitudeB;
};

export const calculateItemSimilarity = (matrix) => {
  const similarityMatrix = {};

  const products = Object.keys(matrix);
  products.forEach((productA, index) => {
    similarityMatrix[productA] = {};

    for (let i = index + 1; i < products.length; i++) {
      const productB = products[i];

      const similarity = calculateCosineSimilarity(
        matrix[productA],
        matrix[productB]
      );

      similarityMatrix[productA][productB] = similarity;
      similarityMatrix[productB][productA] = similarity;
    }
  });

  return similarityMatrix;
};

export const getTopNRecommendations = (productId, similarityMatrix, N = 5) => {
  const similarProducts = Object.entries(similarityMatrix[productId] || {})
    .sort(([, similarityA], [, similarityB]) => similarityB - similarityA)
    .slice(0, N)
    .map(([productId]) => productId);

  return similarProducts;
};
