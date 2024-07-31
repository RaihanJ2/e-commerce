import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createTransaction } from "@utils/midtrans";
import Order from "@models/order";
import User from "@models/user";

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  console.log(session.user);

  return session.user.id;
};

export const POST = async (req) => {
  await connectDB();

  try {
    const userId = await sessionId();
    const { items } = await req.json();
    const updatedItems = items.map((item) => ({
      ...item,
      totalAmount: item.price * item.quantity,
    }));

    let totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const user = await User.findById(userId);

    const order = await Order.create({
      userId,
      items: updatedItems,
      totalAmount,
    });

    const customerDetails = {
      name: user.name,
      email: user.email,
    };

    const transaction = await createTransaction(
      order._id.toString(),
      totalAmount,
      customerDetails,
      updatedItems
    );

    return new Response(
      JSON.stringify({
        order,
        transactionToken: transaction.token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to create order:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
