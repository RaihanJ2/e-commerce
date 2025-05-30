import Product from "@/models/product";
import Prediction from "@/models/prediction";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

export async function GET(req) {
  try {
    await connectDB();
    const userId = await sessionId();
    const predictions = await Prediction.find({ userId })
      .sort({ prediction: -1 })
      .populate("productId");
    const recommendProducts = predictions.map((pred) => pred.productId);
    return new Response(JSON.stringify(recommendProducts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("failed to fetch recommendations", { status: 500 });
  }
}
