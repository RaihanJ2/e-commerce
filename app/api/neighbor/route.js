import Review from "@models/review";
import Neighbor from "@models/neighbor";
import { connectDB } from "@utils/db";

/** CALCULATE COSINE SIMILARITY */
const calculateCosineSimilarity = (productReviews, otherProductReviews) => {
  const ratings = {};

  // Build the ratings object
  [...productReviews, ...otherProductReviews].forEach((review) => {
    const key = review.userId.toString();
    if (!ratings[key]) ratings[key] = {};
    ratings[key][review.productId.toString()] = review.rating;
  });

  const productId1 = productReviews[0].productId.toString();
  const productId2 = otherProductReviews[0].productId.toString();

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  Object.keys(ratings).forEach((userId) => {
    const rating1 = ratings[userId][productId1];
    const rating2 = ratings[userId][productId2];
    if (rating1 && rating2) {
      dotProduct += rating1 * rating2;
      magnitude1 += Math.pow(rating1, 2);
      magnitude2 += Math.pow(rating2, 2);
    }
  });

  const magnitude1Sqrt = Math.sqrt(magnitude1);
  const magnitude2Sqrt = Math.sqrt(magnitude2);

  return magnitude1Sqrt && magnitude2Sqrt
    ? dotProduct / (magnitude1Sqrt * magnitude2Sqrt)
    : 0;
};

export async function POST(req) {
  try {
    await connectDB();

    // Extract productId from request body
    const { productId } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
      });
    }

    // Fetch reviews for the given product
    const productReviews = await Review.find({ productId }).populate("userId");
    if (!productReviews.length) {
      return new Response(
        JSON.stringify({ error: "No reviews found for the given product" }),
        { status: 404 }
      );
    }

    // Fetch all distinct products to compare with
    const allProductIds = await Review.distinct("productId");
    const otherProductIds = allProductIds.filter(
      (id) => id.toString() !== productId.toString()
    );

    // Calculate similarity for each product
    const similarities = [];
    for (const otherProductId of otherProductIds) {
      const otherProductReviews = await Review.find({
        productId: otherProductId,
      }).populate("userId");
      const similarity = calculateCosineSimilarity(
        productReviews,
        otherProductReviews
      );

      if (similarity > 0) {
        similarities.push({ neighborId: otherProductId, similarity });
      }
    }

    // Sort by similarity in descending order and take top N
    similarities.sort((a, b) => b.similarity - a.similarity);
    const topNeighbors = similarities.slice(0, 20); // Adjust the number of top neighbors if needed

    // Update the Neighbor model
    await Neighbor.findOneAndUpdate(
      { productId },
      { neighbors: topNeighbors },
      { upsert: true, new: true }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Neighbors updated successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
    });
  }
}
