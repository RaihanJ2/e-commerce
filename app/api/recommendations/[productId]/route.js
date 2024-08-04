import { connectDB } from "@utils/db";
import { generateItemSimilarityMatrix } from "@utils/recommendations";
import Product from "@models/product";

export const GET = async (req, { params }) => {
  await connectDB();

  const { productId } = params;

  try {
    const similarityMatrix = await generateItemSimilarityMatrix();

    if (!similarityMatrix[productId]) {
      return new Response(
        JSON.stringify({ error: "No recommendations available." }),
        { status: 404 }
      );
    }

    const similarItems = Object.entries(similarityMatrix[productId])
      .sort(([, similarityA], [, similarityB]) => similarityB - similarityA)
      .map(([similarProductId]) => similarProductId);

    const products = await Product.find({ _id: { $in: similarItems } });

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
