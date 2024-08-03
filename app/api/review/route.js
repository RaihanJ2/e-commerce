import Review from "@models/review";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Order from "@models/order";
import Product from "@models/product";

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
      return new Response(
        JSON.stringify({ error: "User has not ordered this product" }),
        { status: 403 }
      );
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

    const reviews = await Review.find({ productId });

    if (reviews.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reviews found for this product" }),
        { status: 404 }
      );
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, { avgRatings: avgRating });

    return new Response(
      JSON.stringify({
        message: "Review added and average rating updated successfully",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create review", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
