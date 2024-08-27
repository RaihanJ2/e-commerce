import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createTransaction } from "@utils/midtrans";
import Order from "@models/order";
import User from "@models/user";
import Address from "@models/address";
import Cart from "@models/cart";

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

const clearCart = async (userId) => {
  try {
    await Cart.deleteMany({ userId });
  } catch (error) {
    console.error("Failed to clear cart:", error);
  }
};

export const POST = async (req) => {
  await connectDB();

  try {
    const userId = await sessionId();
    const { items, addressId } = await req.json();

    const updatedItems = items.map((item) => ({
      ...item,
      totalAmount: item.price * item.quantity,
    }));

    let totalAmount = updatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const user = await User.findById(userId);
    const address = await Address.findById(addressId);

    const order = await Order.create({
      userId,
      items: updatedItems,
      totalAmount,
      addressId,
    });

    const customerDetails = {
      name: user.name,
      email: user.email,
      phone: address.phoneNo,
    };

    const transaction = await createTransaction(
      order._id.toString(),
      totalAmount,
      customerDetails,
      updatedItems,
      address
    );

    // If transaction creation is successful, clear the cart
    if (transaction && transaction.token) {
      await clearCart(userId);
      return new Response(
        JSON.stringify({
          order,
          transactionToken: transaction.token,
        }),
        { status: 200 }
      );
    } else {
      // If the transaction was not successful, respond with an error
      return new Response(JSON.stringify({ error: "Transaction failed" }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Failed to create order:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
