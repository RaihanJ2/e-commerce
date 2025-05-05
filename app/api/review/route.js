import Review from "@models/review";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Order from "@models/order";
import Product from "@models/product";

const sessionId = async () => {
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
    const checkPurchase = searchParams.get("checkPurchase");

    if (checkPurchase) {
      const userId = await sessionId();
      const userOrder = await Order.findOne({
        userId,
        "items.productId": productId,
      });

      const hasPurchased = !!userOrder;
      return new Response(JSON.stringify({ hasPurchased }), { status: 200 });
    }

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
    const userId = await sessionId();
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

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const firstAvg = totalRating / reviews.length;
    const roundedFirstAvg = firstAvg.toFixed(2);
    const avgRating = parseFloat(roundedFirstAvg);

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
