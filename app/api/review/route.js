import Review from "@models/review";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const getSessionUserId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

export const GET = async (req) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const reviews = productId
      ? await Review.find({ productId }).populate({
          path: "userId",
          select: "image username",
        })
      : await Review.find().populate("userId", "username image");

    return new Response(JSON.stringify(reviews), { status: 200 });
  } catch (error) {
    console.error("Failed to fetch reviews", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

export const POST = async (req) => {
  try {
    await connectDB();
    const userId = await getSessionUserId();
    const { productId, rating, review } = await req.json();

    const userOrder = await Order.findOne({
      userId,
      "items.productId": productId,
    });

    if (!userOrder) {
      throw new Error("User has not ordered this product");
    }

    const newReview = new Review({
      userId,
      productId,
      rating,
      review,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newReview.save();
    return new Response(JSON.stringify(newReview), { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
