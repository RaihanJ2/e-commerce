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

/* GET CART */

export const GET = async () => {
  try {
    await connectDB();
    const userId = await sessionId();
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return new Response(JSON.stringify({ items: [] }), { status: 200 });
    }
    return new Response(JSON.stringify(cart), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

/* POST CART */
export const POST = async (req) => {
  try {
    await connectDB();
    const { productId, name, quantity, images, price } = await req.json();
    const userId = await sessionId();

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, name, quantity, images, price });
      }
      await cart.save();
    } else {
      await Cart.create({
        userId,
        items: [
          {
            productId,
            name,
            quantity,
            images,
            price,
          },
        ],
      });
    }

    return new Response(JSON.stringify(cart), { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

/* DELETE CART */
export const DELETE = async (req) => {
  try {
    await connectDB();
    const { productId } = await req.json();
    const userId = await sessionId();

    const cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => !item.productId.equals(productId)
      );
      await cart.save();
      return new Response(JSON.stringify(cart), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Cart or item not found", {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    return new Response("Failed to remove item from cart", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

/* PUT CART */

export const PUT = async (req) => {
  try {
    await connectDB();
    const { productId, quantity } = await req.json();
    const userId = await sessionId();

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex((item) =>
        item.productId.equals(productId)
      );

      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
        await cart.save();
        return new Response(JSON.stringify(cart), { status: 200 });
      }
    }
  } catch (error) {
    console.error("Failed to update item in cart:", error);
    return new Response("Failed to update item in cart", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
