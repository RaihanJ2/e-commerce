import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { createTransaction } from "@utils/midtrans";
import Order from "@models/order";
import User from "@models/user";
import Address from "@models/address";
import Cart from "@models/cart";
import Product from "@models/product";

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

// Helper function to check and reserve stock
const checkAndReserveStock = async (items) => {
  const stockChecks = [];

  // First, check if all items have sufficient stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
    stockChecks.push({
      productId: item.productId,
      quantity: item.quantity,
      currentStock: product.stock,
    });
  }

  // If all checks pass, update the stock
  const stockUpdates = [];
  try {
    for (const check of stockChecks) {
      const updatedProduct = await Product.findByIdAndUpdate(
        check.productId,
        { $inc: { stock: -check.quantity } },
        { new: true }
      );
      stockUpdates.push({
        productId: check.productId,
        quantity: check.quantity,
      });
    }
    return stockUpdates;
  } catch (error) {
    // If any stock update fails, rollback the successful ones
    await rollbackStockUpdates(stockUpdates);
    throw error;
  }
};

// Helper function to rollback stock updates in case of failure
const rollbackStockUpdates = async (stockUpdates) => {
  for (const update of stockUpdates) {
    try {
      await Product.findByIdAndUpdate(update.productId, {
        $inc: { stock: update.quantity },
      });
    } catch (error) {
      console.error(
        `Failed to rollback stock for product ${update.productId}:`,
        error
      );
    }
  }
};

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

    const updatedItems = items.map((item) => ({
      ...item,
      totalAmount: item.price * item.quantity,
    }));

    const subTotal = updatedItems.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const ppnAmount = Math.round(subTotal * 0.05);
    const totalAmount = subTotal + ppnAmount;

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

    // Check and reserve stock before creating order
    let stockUpdates = [];
    try {
      stockUpdates = await checkAndReserveStock(updatedItems);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create the order
    let order;
    try {
      order = await Order.create({
        userId,
        items: updatedItems,
        subTotal,
        ppnAmount,
        totalAmount,
        addressId,
      });
    } catch (error) {
      // If order creation fails, rollback stock updates
      await rollbackStockUpdates(stockUpdates);
      throw error;
    }

    const customerDetails = {
      name: user.name,
      email: user.email,
      phoneNo: address.phoneNo,
    };

    try {
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
        // If transaction fails, rollback stock and delete the order
        await rollbackStockUpdates(stockUpdates);
        await Order.findByIdAndDelete(order._id);
        return new Response(JSON.stringify({ error: "Transaction failed" }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      // If transaction creation fails, rollback stock and delete the order
      await rollbackStockUpdates(stockUpdates);
      await Order.findByIdAndDelete(order._id);
      throw error;
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
