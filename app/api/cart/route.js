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
    const { productId, name, size, quantity, images, price } = await req.json();
    const userId = await sessionId();

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [
          {
            productId,
            name,
            size,
            quantity,
            images,
            price,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.equals(productId) && item.size.join(",") === size
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          name,
          size,
          quantity,
          images,
          price,
        });
      }
      await cart.save();
    }

    return new Response(JSON.stringify(cart), { status: 200 });
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

/* DELETE CART */
export const DELETE = async (req) => {
  try {
    await connectDB();
    const { productId, size } = await req.json();
    const userId = await sessionId();

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.equals(productId) && item.size.join(",") === size
      );
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
        return new Response(JSON.stringify(cart), { status: 200 });
      } else {
        return new Response(
          JSON.stringify({ error: " Item not found in cart" }),
          { status: 404 }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Failed to delete item from cart:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};

/* PUT CART */

export const PUT = async (req) => {
  try {
    await connectDB();
    const { productId, size, quantity } = await req.json();
    const userId = await sessionId();

    const cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) =>
          item.productId.equals(productId) && item.size.join(",") === size
      );
      if (itemIndex > -1) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
        }
        await cart.save();
        return new Response(JSON.stringify(cart), { status: 200 });
      } else {
        return new Response(
          JSON.stringify({ error: "Item not found in cart" }),
          { status: 404 }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "Cart not found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error("Failed to update quantity:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
};
