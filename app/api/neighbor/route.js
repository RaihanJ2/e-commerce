import Review from "@models/review";
import Neighbor from "@models/neighbor";
import { connectDB } from "@utils/db";

const calculateSimilarity = (productReviews, otherProductReviews) => {
  const ratings = {};

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

    const { productId } = await req.json();

    if (!productId) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), {
        status: 400,
      });
    }

    const productReviews = await Review.find({ productId }).populate("userId");
    if (!productReviews.length) {
      return new Response(
        JSON.stringify({ error: "No reviews found for the given product" }),
        { status: 404 }
      );
    }

    const allProductIds = await Review.distinct("productId");
    const otherProductIds = allProductIds.filter(
      (id) => id.toString() !== productId.toString()
    );

    const similarities = [];
    for (const otherProductId of otherProductIds) {
      const otherProductReviews = await Review.find({
        productId: otherProductId,
      }).populate("userId");
      const similarity = calculateSimilarity(
        productReviews,
        otherProductReviews
      );

      if (similarity > 0) {
        similarities.push({ neighborId: otherProductId, similarity });
      }
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    const topNeighbors = similarities.slice(0, 20);

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
