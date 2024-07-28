import Cart from "@models/cart";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

/* POST CART */
export const POST = async (req) => {
  try {
    await connectDB();
    const { productId, name, quantity, images, price } = await req.json();
    const userId = await sessionId();
    console.log("UserId:", userId);

    const post = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, name, quantity, images, price } } },
      { upsert: true, new: true }
    );
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
