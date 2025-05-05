import Order from "@models/order";
import Product from "@models/product";
import Address from "@models/address";
import { connectDB } from "@utils/db";
import { getServerSession } from "next-auth";
const { authOptions } = require("@app/api/auth/[...nextauth]/route");

const sessionId = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
};

export const GET = async (req, { params }) => {
  await connectDB();
  const { id } = params;

  try {
    const userId = await sessionId();

    const order = await Order.findOne({
      _id: id,
      userId: userId,
    });

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });
    }

    const orderWithProducts = { ...order.toObject() };

    const productPromises = order.items.map(async (item, index) => {
      try {
        const product = await Product.findById(item.productId);
        if (product) {
          orderWithProducts.items[index] = {
            ...orderWithProducts.items[index],
            productName: product.name,
            productImage: product.images,
          };
        }
        return product;
      } catch (err) {
        console.error(`Error fetching product ${item.productId}:`, err);
        return null;
      }
    });

    try {
      if (order.addressId) {
        const address = await Address.findById(order.addressId);
        if (address) {
          orderWithProducts.address = address.toObject();
        }
      }
    } catch (err) {
      console.error(`Error fetching address ${order.addressId}:`, err);
    }

    await Promise.all(productPromises);

    return new Response(JSON.stringify(orderWithProducts), { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Invalid order ID" }),
      {
        status: 400,
      }
    );
  }
};

export const dynamic = "force-dynamic";
