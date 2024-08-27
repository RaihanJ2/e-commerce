import Prediction from "@models/prediction";
import Neighbor from "@models/neighbor";
import Review from "@models/review";
import { connectDB } from "@utils/db";

export const POST = async (req) => {
  try {
    await connectDB();
    const { userId, productId } = await req.json();

    if (!userId || !productId) {
      return new Response(JSON.stringify({ message: "Invalid input" }), {
        status: 400,
      });
    }

    const productNeighbors = await Neighbor.findOne({ productId });

    if (!productNeighbors) {
      return new Response(
        JSON.stringify({ message: "No neighbors found for this product" }),
        { status: 404 }
      );
    }

    let weightedSum = 0;
    let similaritySum = 0;

    for (const neighbor of productNeighbors.neighbors) {
      try {
        const review = await Review.findOne({
          userId,
          productId: neighbor.neighborId,
        });

        if (review) {
          weightedSum += review.rating * neighbor.similarity;
          similaritySum += neighbor.similarity;
        }
      } catch (reviewError) {
        console.error(
          `Error fetching review for neighbor ${neighbor.neighborId}:`,
          reviewError
        );
      }
    }

    if (similaritySum === 0) {
      return new Response(
        JSON.stringify({ message: "Insufficient data to make a prediction" }),
        { status: 400 }
      );
    }

    const prediction = weightedSum / similaritySum;

    await Prediction.findOneAndUpdate(
      { userId, productId },
      { userId, productId, prediction },
      { upsert: true }
    );

    return new Response(JSON.stringify({ prediction }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
};
