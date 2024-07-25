import Cart from "@models/cart";
import Product from "@models/product";
import { connectDB } from "@utils/db";
import { getSession } from "next-auth/react";

export const POST = async (req) => {
  await connectDB();
  const { action, id, product, quantity, productId } = await req.json();

  try {
    let cart = await Cart.findOne({ user: id });

    switch (action) {
      case "add":
        if (!cart) {
          cart = await Cart.create({
            user: id,
            orderItems: [{ product, quantity }],
          });
        } else {
          const itemIndex = cart.orderItems.findIndex((item) =>
            item.product.equals(product)
          );
          if (itemIndex > -1) {
            cart.orderItems[itemIndex], (quantity += quantity);
          } else {
            cart.orderItems.push({ product, quantity });
          }
        }
        await cart.save();
        return new Response(JSON.stringify(cart), { status: 200 });

      case "remove":
        if (cart) {
          cart.orderItems = cart.orderItems.filter(
            (item) => !item.product.equals(productId)
          );
          await cart.save();
        }
        return new Response(JSON.stringify(cart), { status: 200 });
      case "update":
        if (cart) {
          const itemIndex = cart.orderItems.findIndex((item) =>
            item.product.equals(productId)
          );
          if (itemIndex > -1) {
            cart.orderItems[itemIndex].quantity = quantity;
            await cart.save();
          }
        }
        return new Response(JSON.stringify(cart), { status: 200 });

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

export const GET = async (req) => {
  await connectDB();
  const { id } = req.query;

  try {
    const cart = await Cart.findOne({ user: id }).populate(
      "orderItems.product"
    );
    return new Response(JSON.stringify(cart), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};
