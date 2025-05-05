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

// GET handler for retrieving user orders
export const GET = async (req) => {
  try {
    await connectDB();
    const userId = await sessionId();
    const orders = await Order.find({ userId });

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    const statusCode = error.message === "Not authenticated" ? 401 : 500;
    return new Response(
      JSON.stringify({
        error:
          statusCode === 401 ? "Not authenticated" : "Internal Server Error",
      }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};

//POST handler for creating new orders
export const POST = async (req) => {
  try {
    await connectDB();
    const userId = await sessionId();

    const body = await req.json();
    const { items, addressId } = body;

    if (!items || !items.length || !addressId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Calculate item totals and order total
    const updatedItems = items.map((item) => ({
      ...item,
      totalAmount: item.price * item.quantity,
    }));

    const subTotal = updatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    // Calculate PPN (tax) at 5%
    const ppnAmount = Math.round(subTotal * 0.05);
    const totalAmount = subTotal + ppnAmount;

    // Get user and address details
    const user = await User.findById(userId);
    const address = await Address.findById(addressId);

    if (!user || !address) {
      return new Response(
        JSON.stringify({ error: "User or address not found" }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create the order
    const order = await Order.create({
      userId,
      items: updatedItems,
      subTotal,
      ppnAmount,
      totalAmount,
      addressId,
    });

    // Prepare customer details for payment
    const customerDetails = {
      name: user.name,
      email: user.email,
      phoneNo: address.phoneNo,
    };

    // Create transaction with Midtrans
    const transaction = await createTransaction(
      order._id.toString(),
      totalAmount,
      customerDetails,
      updatedItems,
      ppnAmount
    );

    // If transaction creation is successful, clear the cart
    if (transaction && transaction.token) {
      await clearCart(userId);
      return new Response(
        JSON.stringify({
          order,
          transactionToken: transaction.token,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // If the transaction was not successful, respond with an error
      return new Response(JSON.stringify({ error: "Transaction failed" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Failed to create order:", error);
    const statusCode = error.message === "Not authenticated" ? 401 : 500;
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: statusCode,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
